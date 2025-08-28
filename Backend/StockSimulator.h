#ifndef STOCKSIMULATOR_H
#define STOCKSIMULATOR_H

#include <string>
#include <queue>
#include <mutex>
#include <condition_variable>
#include <unordered_map>
#include <atomic>

// Stock event structure
struct StockEvent {
    std::string ticker;
    double price;
    long long timestamp;
};

// Thread-safe queue
template<typename T>
class ThreadSafeQueue {
    std::queue<T> q;
    mutable std::mutex mtx;
    std::condition_variable cv;
    bool stopped = false;

public:
    void push(const T& value) {
        {
            std::lock_guard<std::mutex> lock(mtx);
            q.push(value);
        }
        cv.notify_one();
    }

    bool pop(T& value) {
        std::unique_lock<std::mutex> lock(mtx);
        cv.wait(lock, [&]{ return stopped || !q.empty(); });

        if (stopped && q.empty()) return false;
        value = q.front();
        q.pop();
        return true;
    }

    void stop() {
        {
            std::lock_guard<std::mutex> lock(mtx);
            stopped = true;
        }
        cv.notify_all();
    }
};

// ✅ producer declaration (free function, not inside the class!)
void producer(ThreadSafeQueue<StockEvent>& q, const std::string& ticker, int interval,std::atomic<bool>& stop_flag);

#endif // STOCKSIMULATOR_H
