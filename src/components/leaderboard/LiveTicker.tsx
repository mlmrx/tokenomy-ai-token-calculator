
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Zap, DollarSign, Leaf } from "lucide-react";

const LiveTicker = () => {
  const [counters, setCounters] = useState({
    totalTokens: 2250000000000,
    avgTPS: 8125,
    avgCost: 5.41,
    totalCO2: 4977,
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCounters(prev => ({
        totalTokens: prev.totalTokens + Math.floor(Math.random() * 1000000),
        avgTPS: prev.avgTPS + Math.floor(Math.random() * 10) - 5,
        avgCost: prev.avgCost + (Math.random() * 0.1) - 0.05,
        totalCO2: prev.totalCO2 + Math.floor(Math.random() * 10),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number, decimals = 0) => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(decimals)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(decimals)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(decimals)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(decimals)}K`;
    return num.toFixed(decimals);
  };

  return (
    <Card className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Live Token Processing</span>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            Real-time
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-5 w-5 mr-1" />
            </div>
            <div className="text-2xl font-bold tabular-nums transition-all duration-500">
              {formatNumber(counters.totalTokens, 1)}
            </div>
            <div className="text-xs opacity-80">Total Tokens/Month</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Zap className="h-5 w-5 mr-1" />
            </div>
            <div className="text-2xl font-bold tabular-nums transition-all duration-500">
              {formatNumber(counters.avgTPS)}
            </div>
            <div className="text-xs opacity-80">Avg TPS</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="h-5 w-5 mr-1" />
            </div>
            <div className="text-2xl font-bold tabular-nums transition-all duration-500">
              ${counters.avgCost.toFixed(2)}
            </div>
            <div className="text-xs opacity-80">Avg Cost/1M</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Leaf className="h-5 w-5 mr-1" />
            </div>
            <div className="text-2xl font-bold tabular-nums transition-all duration-500">
              {formatNumber(counters.totalCO2)}g
            </div>
            <div className="text-xs opacity-80">Avg CO2/1M</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveTicker;
