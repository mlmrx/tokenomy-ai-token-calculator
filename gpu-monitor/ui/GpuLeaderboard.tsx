
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Medal, Award, ExternalLink, Share2 } from 'lucide-react';

interface LeaderboardEntry {
  gpu_uuid: string;
  value: number;
  rank: number;
  change: number; // Position change from previous period
  percentage: number; // Percentage of total
}

type MetricType = 'tokens_total' | 'avg_tps' | 'efficiency' | 'cost_effectiveness';

interface GpuLeaderboardProps {
  metric?: MetricType;
  limit?: number;
  showShareButton?: boolean;
  embedMode?: boolean;
}

export function GpuLeaderboard({ 
  metric = 'tokens_total', 
  limit = 10,
  showShareButton = true,
  embedMode = false
}: GpuLeaderboardProps) {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<MetricType>(metric);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        // In production, this would fetch from /gpu/leaderboard?metric=${selectedMetric}&limit=${limit}
        const mockData: LeaderboardEntry[] = [];
        const baseValues = {
          tokens_total: 1000000,
          avg_tps: 1500,
          efficiency: 0.95,
          cost_effectiveness: 850
        };
        
        const baseValue = baseValues[selectedMetric];
        
        for (let i = 0; i < limit; i++) {
          const variance = Math.random() * 0.4 + 0.8; // 0.8 to 1.2
          const value = Math.round(baseValue * variance * (1 - i * 0.1));
          const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
          
          mockData.push({
            gpu_uuid: `gpu-${String(i + 1).padStart(3, '0')}-${Math.random().toString(36).substr(2, 8)}`,
            value,
            rank: i + 1,
            change,
            percentage: (value / (baseValue * limit * 0.6)) * 100
          });
        }
        
        setLeaderboardData(mockData);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 30000); // Update every 30s

    return () => clearInterval(interval);
  }, [selectedMetric, limit]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Award className="h-5 w-5 text-amber-600" />;
      default: return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getChangeIndicator = (change: number) => {
    if (change > 0) return <span className="text-green-600 text-xs">↑{change}</span>;
    if (change < 0) return <span className="text-red-600 text-xs">↓{Math.abs(change)}</span>;
    return <span className="text-gray-500 text-xs">—</span>;
  };

  const formatValue = (value: number, metric: string) => {
    switch (metric) {
      case 'tokens_total':
        return `${(value / 1e6).toFixed(1)}M`;
      case 'avg_tps':
        return `${value}`;
      case 'efficiency':
        return `${(value * 100).toFixed(1)}%`;
      case 'cost_effectiveness':
        return `$${value}`;
      default:
        return value.toString();
    }
  };

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case 'tokens_total': return 'Total Tokens';
      case 'avg_tps': return 'Avg TPS';
      case 'efficiency': return 'Efficiency';
      case 'cost_effectiveness': return 'Cost/MT';
      default: return metric;
    }
  };

  const handleShare = () => {
    const embedUrl = `${window.location.origin}/gpu-monitoring/leaderboard?metric=${selectedMetric}&limit=${limit}&embed=true`;
    navigator.clipboard.writeText(embedUrl);
    // In production, show a toast notification
    console.log('Embed URL copied to clipboard');
  };

  const handleMetricChange = (value: string) => {
    setSelectedMetric(value as MetricType);
  };

  if (!embedMode) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              GPU Leaderboard
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={selectedMetric} onValueChange={handleMetricChange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tokens_total">Total Tokens</SelectItem>
                  <SelectItem value="avg_tps">Average TPS</SelectItem>
                  <SelectItem value="efficiency">Efficiency</SelectItem>
                  <SelectItem value="cost_effectiveness">Cost/MT</SelectItem>
                </SelectContent>
              </Select>
              {showShareButton && (
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : (
              leaderboardData.map((entry) => (
                <div key={entry.gpu_uuid} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    {getRankIcon(entry.rank)}
                    <div>
                      <div className="font-medium text-sm">
                        {entry.gpu_uuid.substring(0, 16)}...
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {entry.percentage.toFixed(1)}% of total
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">
                      {formatValue(entry.value, selectedMetric)}
                    </div>
                    <div className="flex items-center justify-end gap-1">
                      {getChangeIndicator(entry.change)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Embed mode - minimal UI
  return (
    <div className="bg-white border rounded-lg p-4 max-w-md">
      <div className="text-lg font-bold mb-3 flex items-center gap-2">
        <Trophy className="h-5 w-5" />
        Top {limit} - {getMetricLabel(selectedMetric)}
      </div>
      <div className="space-y-2">
        {leaderboardData.slice(0, 5).map((entry) => (
          <div key={entry.gpu_uuid} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getRankIcon(entry.rank)}
              <span className="text-sm font-medium">
                GPU-{entry.rank.toString().padStart(3, '0')}
              </span>
            </div>
            <span className="font-bold">
              {formatValue(entry.value, selectedMetric)}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t text-center">
        <a 
          href={`${window.location.origin}/gpu-monitoring`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:underline flex items-center justify-center gap-1"
        >
          View Full Dashboard <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
