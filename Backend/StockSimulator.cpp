#include "StockSimulator.h"
#include <thread>
#include <chrono>
#include <cstdlib>
#include <atomic> 

// Updated producer definition to check the stop flag
void producer(ThreadSafeQueue<StockEvent>& q, const std::string& ticker, int interval, std::atomic<bool>& stop_flag) {
    while (!stop_flag) {
        StockEvent e;
        e.ticker = ticker;
        e.price = 100.0 + (std::rand() % 100);   // Random-ish price
        e.timestamp = std::time(nullptr);

        q.push(e);
        std::this_thread::sleep_for(std::chrono::seconds(interval));
    }
}