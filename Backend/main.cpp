#include "StockSimulator.h"
#include <websocketpp/config/asio_no_tls.hpp>
#include <websocketpp/server.hpp>
#include <thread>
#include <iostream>
#include <sstream>
#include <set>
#include <mutex>
#include <atomic>

typedef websocketpp::server<websocketpp::config::asio> server;
typedef websocketpp::connection_hdl connection_hdl;

ThreadSafeQueue<StockEvent> q;
std::set<connection_hdl, std::owner_less<connection_hdl>> clients;
std::mutex clients_mtx;
std::atomic<bool> stop_producers_flag(false);

void consumer(server* s) {
    StockEvent e;
    while (q.pop(e)) {
        std::ostringstream oss;
        oss << "{ \"ticker\": \"" << e.ticker << "\", "
            << "\"price\": " << e.price << ", "
            << "\"timestamp\": " << e.timestamp << " }";

        std::string msg = oss.str();

        std::lock_guard<std::mutex> lock(clients_mtx);
        for (auto& client : clients) {
            s->send(client, msg, websocketpp::frame::opcode::text);
        }
    }
}

int main() {
    server echo_server;

    echo_server.init_asio();

    echo_server.set_open_handler([&](connection_hdl hdl) {
        std::lock_guard<std::mutex> lock(clients_mtx);
        clients.insert(hdl);
    });

    echo_server.set_close_handler([&](connection_hdl hdl) {
        std::lock_guard<std::mutex> lock(clients_mtx);
        clients.erase(hdl);
    });

    echo_server.listen(9002);
    echo_server.start_accept();

    // Start producer threads with the new stop flag
    std::vector<std::thread> producer_threads;
    producer_threads.emplace_back(producer, std::ref(q), "AAPL", 12, std::ref(stop_producers_flag));
    producer_threads.emplace_back(producer, std::ref(q), "GOOG", 20, std::ref(stop_producers_flag));
    producer_threads.emplace_back(producer, std::ref(q), "MSFT", 15, std::ref(stop_producers_flag));
    producer_threads.emplace_back(producer, std::ref(q), "AMZN", 25, std::ref(stop_producers_flag));

    // Start consumer thread
    std::vector<std::thread> consumer_threads;
    for (int i = 0; i < 3; ++i) {
        consumer_threads.emplace_back(consumer, &echo_server);
    }

    echo_server.run();

    // After the server shuts down (e.g., via Ctrl+C), initiate a graceful shutdown
    stop_producers_flag = true;
    for (auto& t : producer_threads) {
        t.join();
    }
    q.stop();
    for (auto& t : consumer_threads) {
        t.join();
    }

    return 0;
}