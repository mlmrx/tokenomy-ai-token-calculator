
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Pause, Activity, Zap, DollarSign, Clock } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface RealTimeMonitorProps {
  isActive: boolean;
}

interface TokenEvent {
  id: string;
  timestamp: number;
  provider: string;
  model: string;
  tokens: number;
  cost: number;
  latency: number;
  type: 'request' | 'response';
}

const RealTimeMonitor: React.FC<RealTimeMonitorProps> = ({ isActive }) => {
  const [events, setEvents] = useState<TokenEvent[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(isActive);
  const [liveMetrics, setLiveMetrics] = useState({
    tokensPerSecond: 0,
    requestsPerSecond: 0,
    avgLatency: 0,
    currentCost: 0,
  });

  // Simulate real-time token events
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      const providers = ['OpenAI', 'Anthropic', 'Google', 'Meta'];
      const models = ['GPT-4', 'Claude-3', 'Gemini-Pro', 'LLaMA-2'];
      
      const newEvent: TokenEvent = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        provider: providers[Math.floor(Math.random() * providers.length)],
        model: models[Math.floor(Math.random() * models.length)],
        tokens: Math.floor(Math.random() * 2000) + 100,
        cost: Math.random() * 0.05 + 0.001,
        latency: Math.random() * 2000 + 200,
        type: Math.random() > 0.5 ? 'request' : 'response',
      };

      setEvents(prev => {
        const updated = [newEvent, ...prev].slice(0, 50); // Keep last 50 events
        return updated;
      });

      // Update live metrics
      setLiveMetrics(prev => ({
        tokensPerSecond: Math.floor(Math.random() * 1000) + 500,
        requestsPerSecond: Math.floor(Math.random() * 50) + 10,
        avgLatency: Math.floor(Math.random() * 500) + 800,
        currentCost: prev.currentCost + newEvent.cost,
      }));
    }, Math.random() * 2000 + 500); // Random interval for realistic feel

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
  };

  const clearEvents = () => {
    setEvents([]);
    setLiveMetrics({
      tokensPerSecond: 0,
      requestsPerSecond: 0,
      avgLatency: 0,
      currentCost: 0,
    });
  };

  // Generate chart data from recent events
  const chartData = events.slice(0, 20).reverse().map((event, index) => ({
    time: index,
    tokens: event.tokens,
    latency: event.latency,
  }));

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            onClick={toggleMonitoring}
            variant={isMonitoring ? "destructive" : "default"}
            className="flex items-center gap-2"
          >
            {isMonitoring ? (
              <>
                <Pause className="h-4 w-4" />
                Pause Monitoring
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Start Monitoring
              </>
            )}
          </Button>
          
          <Button variant="outline" onClick={clearEvents}>
            Clear Events
          </Button>
          
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-sm font-medium">
              {isMonitoring ? 'Live' : 'Paused'}
            </span>
          </div>
        </div>
        
        <Badge variant="outline">
          {events.length} events captured
        </Badge>
      </div>

      {/* Live Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Zap className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold tabular-nums">{liveMetrics.tokensPerSecond.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Tokens/sec</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold tabular-nums">{liveMetrics.requestsPerSecond}</p>
                <p className="text-sm text-muted-foreground">Requests/sec</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold tabular-nums">{liveMetrics.avgLatency}ms</p>
                <p className="text-sm text-muted-foreground">Avg Latency</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold tabular-nums">${liveMetrics.currentCost.toFixed(3)}</p>
                <p className="text-sm text-muted-foreground">Current Cost</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-time Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Token Flow (Real-time)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <XAxis dataKey="time" hide />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="tokens" stroke="#3B82F6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Event Stream */}
        <Card>
          <CardHeader>
            <CardTitle>Live Event Stream</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] overflow-auto space-y-2">
              {events.map((event) => (
                <div key={event.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg animate-in slide-in-from-top duration-300">
                  <div className={`w-2 h-2 rounded-full ${event.type === 'request' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{event.provider}</span>
                      <Badge variant="outline" className="text-xs">{event.model}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{event.tokens.toLocaleString()} tokens</span>
                      <span>${event.cost.toFixed(4)}</span>
                      <span>{event.latency}ms</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
              
              {events.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  {isMonitoring ? 'Waiting for token events...' : 'Start monitoring to see live events'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RealTimeMonitor;
