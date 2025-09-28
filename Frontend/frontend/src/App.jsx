import React, { useEffect, useState } from "react";
import './App.css'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";

function App() {
  const [stocks, setStocks] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("connecting");

  // Mock data for demonstration (remove when your WebSocket works)
  const generateMockData = () => {
    const mockStocks = [
      { ticker: "AAPL", basePrice: 150 },
      { ticker: "GOOGL", basePrice: 2800 },
      { ticker: "TSLA", basePrice: 800 },
    ];

    const mockData = mockStocks.map((stock) => {
      const history = [];
      let currentPrice = stock.basePrice;

      for (let i = 0; i < 30; i++) {
        const change = (Math.random() - 0.5) * 10;
        currentPrice += change;
        const time = new Date(
          Date.now() - (30 - i) * 60000
        ).toLocaleTimeString();

        history.push({
          price: currentPrice,
          time: time,
          ma20:
            i >= 19
              ? history
                  .slice(Math.max(0, i - 19), i + 1)
                  .reduce((sum, p) => sum + p.price, 0) / Math.min(20, i + 1)
              : null,
        });
      }

      return {
        ticker: stock.ticker,
        price: currentPrice,
        timestamp: Date.now() / 1000,
        history: history,
      };
    });

    setStocks(mockData);
    setConnectionStatus("mock");
  };

  useEffect(() => {
    // Try WebSocket connection
    const ws = new WebSocket("ws://localhost:9002");

    const connectionTimer = setTimeout(() => {
      if (connectionStatus === "connecting") {
        console.log("WebSocket connection timeout, using mock data");
        generateMockData();
        ws.close();
      }
    }, 3000);

    ws.onopen = () => {
      setConnectionStatus("connected");
      clearTimeout(connectionTimer);
    };

    ws.onmessage = (event) => {
      console.log(event);
      try {
        const data = JSON.parse(event.data);
        setStocks((prevStocks) => {
          const stockIndex = prevStocks.findIndex(
            (s) => s.ticker === data.ticker
          );
          if (stockIndex !== -1) {
            const updated = [...prevStocks];
            const history = [
              ...updated[stockIndex].history,
              {
                price: data.price,
                time: new Date(data.timestamp * 1000).toLocaleTimeString(),
              },
            ];

            // calculate moving average (last 20)
            const withMA = history.map((point, idx) => {
              if (idx < 19) return { ...point, ma20: null };
              const slice = history.slice(idx - 19, idx + 1);
              const avg = slice.reduce((sum, p) => sum + p.price, 0) / 20;
              return { ...point, ma20: avg };
            });

            updated[stockIndex] = {
              ...updated[stockIndex],
              price: data.price,
              timestamp: data.timestamp,
              history: withMA,
            };
            console.log("hey ", updated);
            return updated;
          } else {
            return [
              ...prevStocks,
              {
                ...data,
                history: [
                  {
                    price: data.price,
                    time: new Date(data.timestamp * 1000).toLocaleTimeString(),
                    ma20: null,
                  },
                ],
              },
            ];
          }
        });
      } catch (error) {
        console.error("Failed to parse JSON:", error);
      }
    };

    ws.onerror = () => {
      setConnectionStatus("error");
      clearTimeout(connectionTimer);
      generateMockData();
    };

    return () => {
      clearTimeout(connectionTimer);
      ws.close();
    };
  }, []);

  useEffect(() => {
    console.log("Stocks updated:", stocks);
  }, [stocks]);

  const getCompanyName = (ticker) => {
    const companies = {
      'AAPL': 'Apple Inc.',
      'GOOGL': 'Alphabet Inc.',
      'TSLA': 'Tesla Inc.'
    };
    return companies[ticker] || ticker;
  };

  const getMarketEmoji = (ticker) => {
    const emojis = {
      'AAPL': '🍎',
      'GOOGL': '🔍',
      'TSLA': '⚡'
    };
    return emojis[ticker] || '📈';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header */}
          <div className="text-center mb-16">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-3xl mb-6 shadow-2xl">
                <span className="text-3xl">📊</span>
              </div>
              <h1 className="text-6xl lg:text-7xl font-black bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent mb-4 tracking-tight">
                Stock Dashboard
              </h1>
              <p className="text-xl text-slate-300 font-light mb-8 max-w-2xl mx-auto leading-relaxed">
                Real-time market data visualization with advanced analytics and live WebSocket connection
              </p>
            </div>

            <div className="flex justify-center">
              <div className={`inline-flex items-center px-6 py-3 rounded-2xl backdrop-blur-sm border transition-all duration-300 shadow-lg ${
                connectionStatus === "connected"
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                  : connectionStatus === "mock"
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                  : connectionStatus === "error"
                  ? "bg-red-500/20 text-red-300 border-red-500/30"
                  : "bg-blue-500/20 text-blue-300 border-blue-500/30"
              }`}>
                <div className={`w-2 h-2 rounded-full mr-3 ${
                  connectionStatus === "connected" ? "bg-emerald-400 animate-pulse"
                  : connectionStatus === "mock" ? "bg-amber-400 animate-pulse"
                  : connectionStatus === "error" ? "bg-red-400"
                  : "bg-blue-400 animate-pulse"
                }`}></div>
                <span className="font-medium">
                  {connectionStatus === "connected"
                    ? "Connected to Live WebSocket"
                    : connectionStatus === "mock"
                    ? "Demo Mode - Mock Data Active"
                    : connectionStatus === "error"
                    ? "Connection Failed - Using Demo Data"
                    : "Establishing Connection..."}
                </span>
              </div>
            </div>
          </div>

          {stocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-64">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full blur-xl opacity-75 animate-pulse"></div>
                <div className="relative w-20 h-20 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full animate-spin">
                  <div className="absolute top-1 right-1 bottom-1 left-1 bg-slate-900 rounded-full"></div>
                </div>
              </div>
              <div className="text-center text-slate-300 space-y-3">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  Initializing Market Connection
                </h3>
                <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
                  Establishing secure connection to real-time market data feed on port 9002
                </p>
                <div className="flex items-center justify-center space-x-1 mt-4">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
              {stocks.map((stock, index) => {
                const currentPrice = stock.price;
                const previousPrice = stock.history[stock.history.length - 2]?.price;
                const isUp = currentPrice >= previousPrice;
                const priceChange = previousPrice
                  ? ((currentPrice - previousPrice) / previousPrice) * 100
                  : 0;

                return (
                  <div
                    key={stock.ticker}
                    className="group bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-[1.02] hover:shadow-3xl p-8"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Enhanced Header */}
                    <div className="flex justify-between items-start mb-8">
                      <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                          {getMarketEmoji(stock.ticker)}
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white mb-1">{stock.ticker}</h2>
                          <p className="text-slate-400 text-sm font-medium">{getCompanyName(stock.ticker)}</p>
                        </div>
                      </div>

                      <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl backdrop-blur-sm ${
                        isUp
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-red-500/20 text-red-300"
                      }`}>
                        <span className={`text-lg ${isUp ? "text-emerald-400" : "text-red-400"}`}>
                          {isUp ? "↗" : "↘"}
                        </span>
                        <span className="font-bold text-sm">
                          {Math.abs(priceChange).toFixed(2)}%
                        </span>
                      </div>
                    </div>

                    {/* Enhanced Current Price */}
                    <div className="mb-8">
                      <div className="flex items-baseline space-x-3 mb-2">
                        <span className={`text-5xl font-black ${
                          isUp ? "text-emerald-400" : "text-red-400"
                        }`}>
                          ${stock.price.toFixed(2)}
                        </span>
                        <span className="text-slate-400 text-lg">USD</span>
                      </div>
                      <p className="text-slate-400 text-sm flex items-center space-x-2">
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></span>
                        <span>
                          Last updated: {new Date(stock.timestamp * 1000).toLocaleTimeString()}
                        </span>
                      </p>
                    </div>

                    {/* Enhanced Graph */}
                    <div className="mb-6 p-4 bg-slate-800/30 rounded-2xl border border-slate-700/50">
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart
                          data={stock.history}
                          margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                        >
                          <defs>
                            <linearGradient
                              id={`gradient-${stock.ticker}`}
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor={isUp ? "#10b981" : "#ef4444"}
                                stopOpacity={0.8}
                              />
                              <stop
                                offset="95%"
                                stopColor={isUp ? "#10b981" : "#ef4444"}
                                stopOpacity={0.1}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="2 2"
                            stroke="#374151"
                            opacity={0.3}
                          />
                          <XAxis
                            dataKey="time"
                            minTickGap={30}
                            tick={{ fontSize: 10, fill: "#94a3b8" }}
                            stroke="#475569"
                            interval="preserveStartEnd"
                            axisLine={false}
                          />
                          <YAxis
                            domain={["auto", "auto"]}
                            tick={{ fontSize: 10, fill: "#94a3b8" }}
                            stroke="#475569"
                            axisLine={false}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "rgba(15, 23, 42, 0.95)",
                              backdropFilter: "blur(10px)",
                              borderRadius: "16px",
                              border: "1px solid rgba(148, 163, 184, 0.2)",
                              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                              color: "#f8fafc",
                            }}
                            labelStyle={{ color: "#f8fafc", fontWeight: "600" }}
                          />
                          <Area
                            type="monotone"
                            dataKey="price"
                            stroke={isUp ? "#10b981" : "#ef4444"}
                            strokeWidth={3}
                            fill={`url(#gradient-${stock.ticker})`}
                            name="Price ($)"
                            activeDot={{
                              r: 6,
                              fill: isUp ? "#10b981" : "#ef4444",
                              stroke: "#ffffff",
                              strokeWidth: 2,
                            }}
                          />
                          {stock.history.some((point) => point.ma20 !== null) && (
                            <Line
                              type="monotone"
                              dataKey="ma20"
                              stroke="#f59e0b"
                              strokeWidth={2}
                              dot={false}
                              name="MA (20)"
                              strokeDasharray="8 4"
                            />
                          )}
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Enhanced Stats */}
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                          <span className="text-white text-sm">📊</span>
                        </div>
                        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">
                          Data Points
                        </p>
                        <p className="text-xl font-bold text-white">
                          {stock.history.length}
                        </p>
                      </div>

                      <div className="text-center p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
                        <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                          <span className="text-white text-sm">📈</span>
                        </div>
                        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">
                          MA (20)
                        </p>
                        <p className="text-xl font-bold text-white">
                          {stock.history[stock.history.length - 1]?.ma20
                            ? `$${stock.history[stock.history.length - 1].ma20.toFixed(2)}`
                            : "--"}
                        </p>
                      </div>
                    </div>

                    {/* Subtle glow effect on hover */}
                    <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${
                      isUp
                        ? "bg-gradient-to-r from-emerald-500/5 to-green-500/5"
                        : "bg-gradient-to-r from-red-500/5 to-rose-500/5"
                    }`}></div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;