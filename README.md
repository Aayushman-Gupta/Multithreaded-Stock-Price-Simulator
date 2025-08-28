# 📊 Live Stock Price Simulator & Dashboard

A **real-time stock dashboard** that streams simulated stock prices over **WebSockets** and visualizes them with beautiful **interactive charts** built in React.  
When the WebSocket backend is unavailable, the app smartly switches to **mock data mode** so the UI is always alive.

---

## ✨ Features

- ⚡ **Real-time WebSocket Streaming** – Stocks update live with every tick.  
- 🎨 **Modern UI** – Responsive dark-theme dashboard powered by **TailwindCSS**.  
- 📈 **Interactive Charts** – Area & line charts with price curves, shaded trends, tooltips, and legends.  
- 📉 **20-Period Moving Average** – Overlayed on price charts for trend analysis.  
- 🔄 **Automatic Mock Fallback** – No backend? No problem – the app generates realistic random stock data.  
- 📱 **Responsive Design** – Works seamlessly on desktop, tablet, and mobile.  

---

## 🖼️ Demo Preview

### 📊 Full Dashboard
![Dashboard Preview](./demo/dashboard.png)

(./demo/stock-cards.png)


## 🛠️ Tech Stack

### Frontend
- ⚛️ [React](https://reactjs.org/) – Component-based UI  
- 🎨 [TailwindCSS](https://tailwindcss.com/) – Styling and layout  
- 📊 [Recharts](https://recharts.org/) – Interactive charts  

### Backend
- 💻 C++ Stock Simulator  
- 🔌 WebSocket server (running at `ws://localhost:9002`)  

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/your-username/stock-dashboard.git
cd stock-dashboard
