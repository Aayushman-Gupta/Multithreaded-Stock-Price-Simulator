import React, { use, useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, Area, AreaChart
} from 'recharts';

function App() {
  const [stocks, setStocks] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  // Mock data for demonstration (remove when your WebSocket works)
  const generateMockData = () => {
    const mockStocks = [
      { ticker: 'AAPL', basePrice: 150 },
      { ticker: 'GOOGL', basePrice: 2800 },
      { ticker: 'TSLA', basePrice: 800 }
    ];

    const mockData = mockStocks.map(stock => {
      const history = [];
      let currentPrice = stock.basePrice;

      for (let i = 0; i < 30; i++) {
        const change = (Math.random() - 0.5) * 10;
        currentPrice += change;
        const time = new Date(Date.now() - (30 - i) * 60000).toLocaleTimeString();

        history.push({
          price: currentPrice,
          time: time,
          ma20: i >= 19 ? history.slice(Math.max(0, i - 19), i + 1).reduce((sum, p) => sum + p.price, 0) / Math.min(20, i + 1) : null
        });
      }

      return {
        ticker: stock.ticker,
        price: currentPrice,
        timestamp: Date.now() / 1000,
        history: history
      };
    });

    setStocks(mockData);
    setConnectionStatus('mock');
  };

  useEffect(() => {
    // Try WebSocket connection
    const ws = new WebSocket("ws://localhost:9002");

    const connectionTimer = setTimeout(() => {
      if (connectionStatus === 'connecting') {
        console.log('WebSocket connection timeout, using mock data');
        generateMockData();
        ws.close();
      }
    }, 3000);

    ws.onopen = () => {
      setConnectionStatus('connected');
      clearTimeout(connectionTimer);
    };

    ws.onmessage = (event) => {
      console.log(event)
      try {
        const data = JSON.parse(event.data);
        setStocks(prevStocks => {
          const stockIndex = prevStocks.findIndex(s => s.ticker === data.ticker);
          if (stockIndex !== -1) {
            const updated = [...prevStocks];
            const history = [
              ...updated[stockIndex].history,
              { price: data.price, time: new Date(data.timestamp * 1000).toLocaleTimeString() }
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
              history: withMA
            };
            console.log("hey ",updated)
            return updated;
          } else {
            return [...prevStocks, {
              ...data,
              history: [{ price: data.price, time: new Date(data.timestamp * 1000).toLocaleTimeString(), ma20: null }]
            }];
          }
        });
      } catch (error) {
        console.error("Failed to parse JSON:", error);
      }

    };

    ws.onerror = () => {
      setConnectionStatus('error');
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
  },[stocks]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            📊 Live Stock Dashboard
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-500 mx-auto rounded-full"></div>
          <div className="mt-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              connectionStatus === 'connected' ? 'bg-green-900 text-green-300' :
              connectionStatus === 'mock' ? 'bg-yellow-900 text-yellow-300' :
              connectionStatus === 'error' ? 'bg-red-900 text-red-300' :
              'bg-blue-900 text-blue-300'
            }`}>
              {connectionStatus === 'connected' ? '🟢 Connected to WebSocket' :
               connectionStatus === 'mock' ? '🟡 Using Mock Data' :
               connectionStatus === 'error' ? '🔴 Connection Failed - Mock Data' :
               '🔵 Connecting...'}
            </span>
          </div>
        </div>

        {stocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mb-6"></div>
              <div className="text-center text-gray-300 space-y-2">
              <p className="text-lg font-medium">🔗 Connecting to server...</p>
              <p className="text-sm text-gray-400">Ensure backend is running on port 9002</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stocks.map(stock => {
              const currentPrice = stock.price;
              const previousPrice = stock.history[stock.history.length - 2]?.price;
              const isUp = currentPrice >= previousPrice;
              const priceChange = previousPrice ? ((currentPrice - previousPrice) / previousPrice * 100) : 0;

              return (
                <div
                  key={stock.ticker}
                  className="bg-gray-800 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 border border-gray-700"
                >
                  {/* Header */}
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">{stock.ticker}</h2>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          isUp
                            ? 'bg-green-900 text-green-300'
                            : 'bg-red-900 text-red-300'
                        }`}
                      >
                        {isUp ? '▲' : '▼'} {Math.abs(priceChange).toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  {/* Current Price */}
                  <div className="mb-6">
                    <p className={`text-4xl font-bold ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                      ${stock.price.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Last updated: {new Date(stock.timestamp * 1000).toLocaleTimeString()}
                    </p>
                  </div>

                  {/* Graph */}
                  <div className="h-48 mb-4 w-48">
                   <ResponsiveContainer width="100%" height={200}>
                      <AreaChart
                        data={stock.history}
                        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                      >
                        <defs>
                          <linearGradient id={`gradient-${stock.ticker}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={isUp ? "#10b981" : "#ef4444"} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={isUp ? "#10b981" : "#ef4444"} stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="2 2" stroke="#374151" />
                        <XAxis
                          dataKey="time"
                          minTickGap={30}
                          tick={{ fontSize: 10, fill: '#9ca3af' }}
                          stroke="#6b7280"
                          interval="preserveStartEnd"
                        />
                        <YAxis
                          domain={['auto', 'auto']}
                          tick={{ fontSize: 10, fill: '#9ca3af' }}
                          stroke="#6b7280"
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1f2937",
                            borderRadius: "8px",
                            border: "1px solid #374151",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                            color: "#f9fafb"
                          }}
                          labelStyle={{ color: "#f9fafb" }}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="price"
                          stroke={isUp ? "#10b981" : "#ef4444"}
                          strokeWidth={2.5}
                          fill={`url(#gradient-${stock.ticker})`}
                          name="Price ($)"
                          activeDot={{ r: 4, fill: isUp ? "#10b981" : "#ef4444" }}
                        />
                        {stock.history.some(point => point.ma20 !== null) && (
                          <Line
                            type="monotone"
                            dataKey="ma20"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            dot={false}
                            name="MA (20)"
                            strokeDasharray="5 5"
                          />
                        )}
                      </AreaChart>
                    </ResponsiveContainer>

                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
                    <div className="text-center">
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Data Points</p>
                      <p className="text-lg font-semibold text-gray-200">{stock.history.length}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400 uppercase tracking-wide">MA (20)</p>
                      <p className="text-lg font-semibold text-gray-200">
                        {stock.history[stock.history.length - 1]?.ma20
                          ? `$${stock.history[stock.history.length - 1].ma20.toFixed(2)}`
                          : '--'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;