# 📊 Live Stock Price Simulator & Dashboard

A **real-time stock dashboard** built with **React + Vite**, streaming live prices via **WebSockets** and visualized using **Recharts**.
If the WebSocket server is unavailable, the app gracefully switches to **mock data mode** so the UI always stays alive.

---

## ✨ Features

- ⚡ **Real-time WebSocket Streaming** – Live updates for each stock in your dashboard.
- 🎨 **Dark-Themed Modern UI** – Clean responsive cards styled with **TailwindCSS**.
- 📈 **Interactive Charts** – Area & line charts with price curves, shaded trends, tooltips, and legends.
- 📉 **20-Period Moving Average** – Overlayed on stock price graphs for better trend analysis.
- 🔄 **Automatic Mock Fallback** – Backend down? The app generates realistic random stock data.
- 📱 **Responsive Design** – Optimized for desktop, tablet, and mobile.

---

## 🖼️ Demo Preview

### 📊 Dashboard Overview
![Dashboard Preview](./demo/dashboard.png)

### 📈 Stock Cards
![Stock Cards](./demo/stock-cards.png)

---

## 🛠️ Tech Stack

### Frontend
- ⚛️ [React](https://reactjs.org/) (via [Vite](https://vitejs.dev/)) – Lightning-fast development
- 🎨 [TailwindCSS](https://tailwindcss.com/) – Utility-first styling
- 📊 [Recharts](https://recharts.org/) – Data visualization

### Backend
- 💻 C++ Stock Simulator
- 🔌 WebSocket server at `ws://localhost:9002`

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/your-username/stock-price-simulator.git
cd stock-price-simulator
