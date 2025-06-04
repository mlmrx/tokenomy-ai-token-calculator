
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sankey, Rectangle, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Filter, Download, Play, Pause } from "lucide-react";

interface TokenFlowVisualizerProps {
  timeRange: string;
}

interface FlowNode {
  id: string;
  name: string;
  value: number;
  category: 'source' | 'provider' | 'model' | 'application';
  color: string;
}

interface FlowLink {
  source: string;
  target: string;
  value: number;
}

const TokenFlowVisualizer: React.FC<TokenFlowVisualizerProps> = ({ timeRange }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [flowData, setFlowData] = useState<{ nodes: FlowNode[], links: FlowLink[] }>({
    nodes: [],
    links: []
  });

  // Mock data for token flow visualization
  const generateFlowData = () => {
    const nodes: FlowNode[] = [
      // Sources
      { id: 'web_app', name: 'Web App', value: 45000, category: 'source', color: '#10B981' },
      { id: 'api_calls', name: 'API Calls', value: 32000, category: 'source', color: '#3B82F6' },
      { id: 'mobile_app', name: 'Mobile App', value: 28000, category: 'source', color: '#8B5CF6' },
      { id: 'batch_jobs', name: 'Batch Jobs', value: 15000, category: 'source', color: '#F59E0B' },
      
      // Providers
      { id: 'openai', name: 'OpenAI', value: 42000, category: 'provider', color: '#10B981' },
      { id: 'anthropic', name: 'Anthropic', value: 35000, category: 'provider', color: '#8B5CF6' },
      { id: 'google', name: 'Google', value: 28000, category: 'provider', color: '#3B82F6' },
      { id: 'meta', name: 'Meta', value: 15000, category: 'provider', color: '#F59E0B' },
      
      // Models
      { id: 'gpt4', name: 'GPT-4', value: 25000, category: 'model', color: '#10B981' },
      { id: 'gpt3_5', name: 'GPT-3.5', value: 17000, category: 'model', color: '#10B981' },
      { id: 'claude3', name: 'Claude-3', value: 22000, category: 'model', color: '#8B5CF6' },
      { id: 'claude_haiku', name: 'Claude Haiku', value: 13000, category: 'model', color: '#8B5CF6' },
      { id: 'gemini_pro', name: 'Gemini Pro', value: 18000, category: 'model', color: '#3B82F6' },
      { id: 'gemini_flash', name: 'Gemini Flash', value: 10000, category: 'model', color: '#3B82F6' },
      { id: 'llama2', name: 'LLaMA-2', value: 15000, category: 'model', color: '#F59E0B' },
      
      // Applications
      { id: 'chat', name: 'Chat', value: 38000, category: 'application', color: '#10B981' },
      { id: 'content_gen', name: 'Content Generation', value: 32000, category: 'application', color: '#3B82F6' },
      { id: 'code_assist', name: 'Code Assistant', value: 28000, category: 'application', color: '#8B5CF6' },
      { id: 'analysis', name: 'Data Analysis', value: 22000, category: 'application', color: '#F59E0B' },
    ];

    const links: FlowLink[] = [
      // Source to Provider flows
      { source: 'web_app', target: 'openai', value: 18000 },
      { source: 'web_app', target: 'anthropic', value: 15000 },
      { source: 'web_app', target: 'google', value: 12000 },
      { source: 'api_calls', target: 'openai', value: 14000 },
      { source: 'api_calls', target: 'google', value: 10000 },
      { source: 'api_calls', target: 'meta', value: 8000 },
      { source: 'mobile_app', target: 'anthropic', value: 12000 },
      { source: 'mobile_app', target: 'openai', value: 10000 },
      { source: 'mobile_app', target: 'google', value: 6000 },
      { source: 'batch_jobs', target: 'meta', value: 7000 },
      { source: 'batch_jobs', target: 'anthropic', value: 8000 },
      
      // Provider to Model flows
      { source: 'openai', target: 'gpt4', value: 25000 },
      { source: 'openai', target: 'gpt3_5', value: 17000 },
      { source: 'anthropic', target: 'claude3', value: 22000 },
      { source: 'anthropic', target: 'claude_haiku', value: 13000 },
      { source: 'google', target: 'gemini_pro', value: 18000 },
      { source: 'google', target: 'gemini_flash', value: 10000 },
      { source: 'meta', target: 'llama2', value: 15000 },
      
      // Model to Application flows
      { source: 'gpt4', target: 'chat', value: 12000 },
      { source: 'gpt4', target: 'code_assist', value: 8000 },
      { source: 'gpt4', target: 'content_gen', value: 5000 },
      { source: 'gpt3_5', target: 'chat', value: 10000 },
      { source: 'gpt3_5', target: 'content_gen', value: 7000 },
      { source: 'claude3', target: 'chat', value: 9000 },
      { source: 'claude3', target: 'content_gen', value: 8000 },
      { source: 'claude3', target: 'analysis', value: 5000 },
      { source: 'claude_haiku', target: 'chat', value: 7000 },
      { source: 'claude_haiku', target: 'content_gen', value: 6000 },
      { source: 'gemini_pro', target: 'analysis', value: 10000 },
      { source: 'gemini_pro', target: 'code_assist', value: 8000 },
      { source: 'gemini_flash', target: 'content_gen', value: 6000 },
      { source: 'gemini_flash', target: 'chat', value: 4000 },
      { source: 'llama2', target: 'code_assist', value: 12000 },
      { source: 'llama2', target: 'analysis', value: 7000 },
    ];

    return { nodes, links };
  };

  useEffect(() => {
    setFlowData(generateFlowData());
  }, [timeRange]);

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const topFlows = flowData.links
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const formatNumber = (num: number) => {
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            onClick={togglePlayback}
            variant={isPlaying ? "destructive" : "default"}
          >
            {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isPlaying ? 'Pause' : 'Play'} Animation
          </Button>
          
          <Select defaultValue="all">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Flows</SelectItem>
              <SelectItem value="high_volume">High Volume</SelectItem>
              <SelectItem value="cost_optimized">Cost Optimized</SelectItem>
              <SelectItem value="fast_latency">Fast Latency</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Flow Data
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Flow Visualization */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Token Flow Diagram
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[600px] w-full border rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
              {/* Simplified Flow Visualization */}
              <div className="absolute inset-4 flex items-center justify-between">
                {/* Sources Column */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-center">Sources</h3>
                  {flowData.nodes.filter(n => n.category === 'source').map((node, i) => (
                    <div key={node.id} className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border-l-4" style={{ borderLeftColor: node.color }}>
                      <div className="text-sm font-medium">{node.name}</div>
                      <div className="text-xs text-muted-foreground">{formatNumber(node.value)} tokens</div>
                    </div>
                  ))}
                </div>
                
                {/* Providers Column */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-center">Providers</h3>
                  {flowData.nodes.filter(n => n.category === 'provider').map((node, i) => (
                    <div key={node.id} className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border-l-4" style={{ borderLeftColor: node.color }}>
                      <div className="text-sm font-medium">{node.name}</div>
                      <div className="text-xs text-muted-foreground">{formatNumber(node.value)} tokens</div>
                    </div>
                  ))}
                </div>
                
                {/* Models Column */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-center">Models</h3>
                  {flowData.nodes.filter(n => n.category === 'model').slice(0, 6).map((node, i) => (
                    <div key={node.id} className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border-l-4" style={{ borderLeftColor: node.color }}>
                      <div className="text-xs font-medium">{node.name}</div>
                      <div className="text-xs text-muted-foreground">{formatNumber(node.value)}</div>
                    </div>
                  ))}
                </div>
                
                {/* Applications Column */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-center">Applications</h3>
                  {flowData.nodes.filter(n => n.category === 'application').map((node, i) => (
                    <div key={node.id} className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border-l-4" style={{ borderLeftColor: node.color }}>
                      <div className="text-sm font-medium">{node.name}</div>
                      <div className="text-xs text-muted-foreground">{formatNumber(node.value)} tokens</div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Animated flowing particles */}
              {isPlaying && (
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="absolute w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{
                      left: `${20 + i * 15}%`,
                      top: `${30 + (i % 3) * 20}%`,
                      animationDelay: `${i * 0.5}s`
                    }}></div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Flows */}
        <Card>
          <CardHeader>
            <CardTitle>Top Token Flows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topFlows.map((flow, index) => {
                const sourceNode = flowData.nodes.find(n => n.id === flow.source);
                const targetNode = flowData.nodes.find(n => n.id === flow.target);
                
                return (
                  <div key={`${flow.source}-${flow.target}`} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <div>
                        <div className="text-sm font-medium">
                          {sourceNode?.name} → {targetNode?.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatNumber(flow.value)} tokens
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">{formatNumber(flow.value)}</div>
                      <div className="text-xs text-muted-foreground">
                        {((flow.value / 120000) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Flow Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">120K</div>
            <div className="text-sm text-muted-foreground">Total Tokens/Hour</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">4</div>
            <div className="text-sm text-muted-foreground">Active Providers</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">12</div>
            <div className="text-sm text-muted-foreground">Models in Use</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">85%</div>
            <div className="text-sm text-muted-foreground">Flow Efficiency</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TokenFlowVisualizer;
