
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Medal, Award, Share, Copy } from 'lucide-react';
import { GpuMetrics } from '@/lib/mockGpuData';
import { useToast } from '@/hooks/use-toast';

interface GpuLeaderboardProps {
  data: GpuMetrics[];
  metric: keyof GpuMetrics;
  limit: number;
}

const GpuLeaderboard: React.FC<GpuLeaderboardProps> = ({ data, metric, limit }) => {
  const { toast } = useToast();

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Award className="h-5 w-5 text-amber-600" />;
      default: return <span className="w-5 h-5 flex items-center justify-center text-sm font-medium text-muted-foreground">#{rank}</span>;
    }
  };

  const getMetricDisplay = (gpu: GpuMetrics, metricKey: keyof GpuMetrics) => {
    const value = gpu[metricKey];
    
    switch (metricKey) {
      case 'tokens_total':
        return `${(Number(value) / 1000000).toFixed(1)}M tokens`;
      case 'tps':
        return `${Number(value).toLocaleString()} TPS`;
      case 'cost_per_mtoken':
        return `$${Number(value).toFixed(2)}/M`;
      case 'power_draw_w':
        return `${Number(value)}W`;
      default:
        return String(value);
    }
  };

  const getMetricLabel = (metricKey: keyof GpuMetrics) => {
    switch (metricKey) {
      case 'tokens_total': return 'Total Tokens Processed';
      case 'tps': return 'Tokens Per Second';
      case 'cost_per_mtoken': return 'Cost per Million Tokens';
      case 'power_draw_w': return 'Power Consumption';
      default: return String(metricKey);
    }
  };

  const sortedData = [...data]
    .sort((a, b) => {
      const aValue = Number(a[metric]);
      const bValue = Number(b[metric]);
      // For cost metrics, lower is better
      if (metric === 'cost_per_mtoken' || metric === 'energy_per_mtoken') {
        return aValue - bValue;
      }
      return bValue - aValue;
    })
    .slice(0, limit);

  const handleShare = () => {
    const shareText = `GPU Performance Leaderboard - Top ${limit} by ${getMetricLabel(metric)}`;
    const shareUrl = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: shareText,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      toast({
        title: 'Copied to clipboard',
        description: 'Leaderboard link has been copied to your clipboard.',
      });
    }
  };

  const handleCopyEmbed = () => {
    const embedCode = `<iframe src="${window.location.href}?embed=true" width="400" height="600" style="border:none;"></iframe>`;
    navigator.clipboard.writeText(embedCode);
    toast({
      title: 'Embed code copied',
      description: 'The embed code has been copied to your clipboard.',
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            GPU Leaderboard - {getMetricLabel(metric)}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopyEmbed}>
              <Copy className="h-4 w-4 mr-2" />
              Embed
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedData.map((gpu, index) => {
            const rank = index + 1;
            const isTopThree = rank <= 3;
            
            return (
              <div 
                key={gpu.gpu_uuid}
                className={`flex items-center gap-4 p-3 rounded-lg border ${
                  isTopThree ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' : 'bg-muted/30'
                }`}
              >
                <div className="flex items-center justify-center w-8">
                  {getRankIcon(rank)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-medium truncate">
                      {gpu.gpu_uuid}
                    </span>
                    <Badge 
                      variant={gpu.status === 'healthy' ? 'default' : 'secondary'}
                      className={
                        gpu.status === 'healthy' ? 'bg-green-100 text-green-800' :
                        gpu.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }
                    >
                      {gpu.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {gpu.model_id}
                  </p>
                </div>
                
                <div className="text-right">
                  <div className="font-mono font-bold text-lg">
                    {getMetricDisplay(gpu, metric)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {gpu.utilization}% utilization
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {sortedData.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No GPU data available for ranking
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GpuLeaderboard;
