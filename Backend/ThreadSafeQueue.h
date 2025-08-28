#pragma once
#include <queue>
#include <mutex>
#include <condition_variable>

template<typename T>
class ThreadSafeQueue {
    std::queue<T> q;
    std::mutex m;
    std::condition_variable cv;
    bool stopped = false;

public:
    void push(T item) {
        {
            std::lock_guard<std::mutex> lk(m);
            q.push(std::move(item));
        }
        cv.notify_one();
    }

    bool pop(T& out) {
        std::unique_lock<std::mutex> lk(m);
        cv.wait(lk, [&]{ return stopped || !q.empty(); });
        if (q.empty()) return false;
        out = std::move(q.front());
        q.pop();
        return true;
    }

    void stop() {
        {
            std::lock_guard<std::mutex> lk(m);
            stopped = true;
        }
        cv.notify_all();
    }
};
