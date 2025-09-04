import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  Brain, 
  Eye, 
  Layers, 
  Network, 
  MessageSquare,
  ArrowRight,
  Activity,
  Cpu,
  Database,
  Sparkles
} from 'lucide-react';

interface ProcessingStage {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  duration: number;
  details: string[];
  color: string;
}

interface TokenVisualization {
  token: string;
  id: number;
  attention: number;
  embedding: number[];
  position: number;
}

const PromptProcessingVisualizer = () => {
  const [inputText, setInputText] = useState("What are the benefits of renewable energy?");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [tokens, setTokens] = useState<TokenVisualization[]>([]);
  const [processingDetails, setProcessingDetails] = useState<any>({});
  const [activeLayer, setActiveLayer] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout>();

  const stages: ProcessingStage[] = [
    {
      id: 'input',
      name: 'Input Reception',
      description: 'Raw text input is received and prepared for processing',
      icon: <MessageSquare className="h-5 w-5" />,
      duration: 500,
      details: [
        'Text normalization and cleaning',
        'Character encoding validation',
        'Input length validation',
        'Special character handling'
      ],
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'tokenization',
      name: 'Tokenization',
      description: 'Text is broken down into tokens using BPE/SentencePiece',
      icon: <Zap className="h-5 w-5" />,
      duration: 800,
      details: [
        'Byte-Pair Encoding (BPE) applied',
        'Subword tokenization',
        'Special tokens added ([CLS], [SEP])',
        'Token ID assignment'
      ],
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'embedding',
      name: 'Token Embedding',
      description: 'Tokens are converted to high-dimensional vectors',
      icon: <Database className="h-5 w-5" />,
      duration: 600,
      details: [
        'Token embedding lookup (768/1024/4096 dim)',
        'Positional encoding addition',
        'Layer normalization',
        'Dropout application'
      ],
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'attention',
      name: 'Multi-Head Attention',
      description: 'Self-attention mechanisms process token relationships',
      icon: <Eye className="h-5 w-5" />,
      duration: 1200,
      details: [
        'Query, Key, Value matrices computed',
        'Attention scores calculated',
        'Multi-head parallel processing',
        'Attention weights normalized'
      ],
      color: 'from-amber-500 to-amber-600'
    },
    {
      id: 'transformer',
      name: 'Transformer Layers',
      description: 'Deep neural network layers process the embeddings',
      icon: <Layers className="h-5 w-5" />,
      duration: 2000,
      details: [
        'Feed-forward networks (FFN)',
        'Residual connections',
        'Layer normalization',
        'Multiple transformer blocks'
      ],
      color: 'from-red-500 to-red-600'
    },
    {
      id: 'context',
      name: 'Context Integration',
      description: 'Global context and memory are integrated',
      icon: <Brain className="h-5 w-5" />,
      duration: 900,
      details: [
        'Long-term memory integration',
        'Context window management',
        'Cross-attention mechanisms',
        'Knowledge base queries'
      ],
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      id: 'generation',
      name: 'Response Generation',
      description: 'Output tokens are generated using autoregressive decoding',
      icon: <Cpu className="h-5 w-5" />,
      duration: 1500,
      details: [
        'Autoregressive token prediction',
        'Temperature and top-p sampling',
        'Beam search optimization',
        'Repetition penalty application'
      ],
      color: 'from-cyan-500 to-cyan-600'
    },
    {
      id: 'output',
      name: 'Output Processing',
      description: 'Generated tokens are decoded back to human-readable text',
      icon: <Sparkles className="h-5 w-5" />,
      duration: 400,
      details: [
        'Token ID to text conversion',
        'Special token removal',
        'Text post-processing',
        'Response formatting'
      ],
      color: 'from-pink-500 to-pink-600'
    }
  ];

  useEffect(() => {
    generateTokens();
  }, [inputText]);

  const generateTokens = () => {
    if (!inputText.trim()) {
      setTokens([]);
      return;
    }

    // Simulate tokenization
    const words = inputText.split(/\s+/);
    const newTokens: TokenVisualization[] = [];
    let tokenId = 0;

    words.forEach((word, wordIndex) => {
      if (word.length <= 3) {
        newTokens.push({
          token: word,
          id: 30000 + tokenId++,
          attention: Math.random() * 0.8 + 0.2,
          embedding: Array.from({ length: 8 }, () => Math.random() - 0.5),
          position: wordIndex
        });
      } else if (word.length <= 7) {
        if (Math.random() > 0.4) {
          newTokens.push({
            token: word,
            id: 30000 + tokenId++,
            attention: Math.random() * 0.8 + 0.2,
            embedding: Array.from({ length: 8 }, () => Math.random() - 0.5),
            position: wordIndex
          });
        } else {
          const mid = Math.floor(word.length / 2);
          newTokens.push(
            {
              token: word.substring(0, mid),
              id: 30000 + tokenId++,
              attention: Math.random() * 0.8 + 0.2,
              embedding: Array.from({ length: 8 }, () => Math.random() - 0.5),
              position: wordIndex
            },
            {
              token: word.substring(mid),
              id: 30000 + tokenId++,
              attention: Math.random() * 0.8 + 0.2,
              embedding: Array.from({ length: 8 }, () => Math.random() - 0.5),
              position: wordIndex
            }
          );
        }
      } else {
        // Long words split into multiple tokens
        let remaining = word;
        let subPos = 0;
        while (remaining.length > 0) {
          const len = Math.min(Math.floor(Math.random() * 4) + 2, remaining.length);
          newTokens.push({
            token: remaining.substring(0, len),
            id: 30000 + tokenId++,
            attention: Math.random() * 0.8 + 0.2,
            embedding: Array.from({ length: 8 }, () => Math.random() - 0.5),
            position: wordIndex + subPos * 0.1
          });
          remaining = remaining.substring(len);
          subPos++;
        }
      }
    });

    setTokens(newTokens);
  };

  const startAnimation = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    setIsPlaying(true);
    setCurrentStage(0);
    setProgress(0);

    let stageIndex = 0;
    let stageProgress = 0;

    intervalRef.current = setInterval(() => {
      const currentStageData = stages[stageIndex];
      const progressIncrement = 100 / (currentStageData.duration / 50);
      
      stageProgress += progressIncrement;
      setProgress(Math.min(stageProgress, 100));

      if (stageProgress >= 100) {
        stageIndex++;
        if (stageIndex >= stages.length) {
          setIsPlaying(false);
          clearInterval(intervalRef.current!);
          return;
        }
        setCurrentStage(stageIndex);
        stageProgress = 0;
      }
    }, 50);
  };

  const reset = () => {
    setIsPlaying(false);
    setCurrentStage(0);
    setProgress(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const renderAttentionMatrix = () => (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-muted-foreground">Attention Weights Heatmap</h4>
      <div className="grid grid-cols-8 gap-1 max-w-md">
        {tokens.slice(0, 8).map((token, i) => (
          tokens.slice(0, 8).map((_, j) => (
            <div
              key={`${i}-${j}`}
              className="w-6 h-6 rounded-sm flex items-center justify-center text-xs"
              style={{
                backgroundColor: `hsl(${200 + (token.attention * j * 50)}, 70%, ${50 + (token.attention * 30)}%)`,
                color: token.attention * j > 0.5 ? 'white' : 'black'
              }}
            >
              {(token.attention * (j + 1) * 0.2).toFixed(1)}
            </div>
          ))
        ))}
      </div>
    </div>
  );

  const renderEmbeddingVisualization = () => (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-muted-foreground">Token Embeddings (8D simplified)</h4>
      {tokens.slice(0, 6).map((token, idx) => (
        <div key={idx} className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">{token.token}</Badge>
            <span className="text-xs text-muted-foreground">ID: {token.id}</span>
          </div>
          <div className="flex gap-1">
            {token.embedding.map((val, i) => (
              <div
                key={i}
                className="w-4 h-12 rounded-sm"
                style={{
                  backgroundColor: val > 0 ? `hsl(120, 70%, ${50 + val * 30}%)` : `hsl(0, 70%, ${50 + Math.abs(val) * 30}%)`,
                }}
                title={`Dimension ${i}: ${val.toFixed(3)}`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-6 mb-12">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-indigo-600/20 blur-3xl -z-10 rounded-full"></div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            AI Prompt Processing Visualizer
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Deep dive into every microsecond of AI processing. Visualize tokenization, attention mechanisms, 
            neural network layers, and response generation in real-time.
          </p>
        </div>
      </div>

      {/* Input Section */}
      <Card className="border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Input Your Prompt
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter your prompt to see how AI processes it..."
            className="min-h-[100px] text-lg"
          />
          <div className="flex gap-4">
            <Button onClick={startAnimation} className="flex items-center gap-2">
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isPlaying ? 'Pause' : 'Start Processing'}
            </Button>
            <Button onClick={reset} variant="outline" className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Processing Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Timeline */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Processing Pipeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stages.map((stage, index) => (
                <div
                  key={stage.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    index === currentStage
                      ? 'bg-primary/10 border-2 border-primary/30 scale-105'
                      : index < currentStage
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-muted/30'
                  }`}
                >
                  <div className={`p-2 rounded-full bg-gradient-to-r ${stage.color} text-white`}>
                    {stage.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{stage.name}</div>
                    <div className="text-xs text-muted-foreground">{stage.description}</div>
                    {index === currentStage && (
                      <Progress value={progress} className="mt-2 h-1" />
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Visualization */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                {stages[currentStage]?.name || 'Processing Pipeline'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="tokens">Tokenization</TabsTrigger>
                  <TabsTrigger value="attention">Attention</TabsTrigger>
                  <TabsTrigger value="neural">Neural Layers</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4">Current Stage: {stages[currentStage]?.name}</h3>
                    <p className="text-muted-foreground mb-4">{stages[currentStage]?.description}</p>
                    <div className="grid grid-cols-2 gap-4">
                      {stages[currentStage]?.details.map((detail, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <ArrowRight className="h-4 w-4 text-primary" />
                          <span className="text-sm">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Live Metrics */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{tokens.length}</div>
                      <div className="text-sm text-muted-foreground">Tokens Generated</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{Math.round(progress)}%</div>
                      <div className="text-sm text-muted-foreground">Stage Progress</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{currentStage + 1}/8</div>
                      <div className="text-sm text-muted-foreground">Pipeline Stage</div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="tokens" className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Token Breakdown</h3>
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-2">Original Text:</div>
                      <div className="text-lg mb-4 p-2 bg-white rounded border">{inputText}</div>
                      
                      <div className="text-sm text-muted-foreground mb-2">Tokenized Output:</div>
                      <div className="flex flex-wrap gap-2">
                        {tokens.map((token, idx) => (
                          <div
                            key={idx}
                            className="flex flex-col items-center bg-white border rounded-lg p-2 hover:shadow-md transition-shadow cursor-pointer"
                            style={{
                              borderColor: `hsl(${200 + (token.attention * 100)}, 60%, 60%)`,
                              transform: currentStage >= 1 ? 'scale(1)' : 'scale(0.8)',
                              opacity: currentStage >= 1 ? 1 : 0.5,
                              transition: 'all 0.3s ease'
                            }}
                          >
                            <div className="font-mono text-sm">{token.token}</div>
                            <div className="text-xs text-muted-foreground">ID: {token.id}</div>
                            <div className="text-xs text-blue-600">Pos: {token.position}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {renderEmbeddingVisualization()}
                  </div>
                </TabsContent>

                <TabsContent value="attention" className="space-y-6">
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Multi-Head Attention Visualization</h3>
                    {renderAttentionMatrix()}
                    
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-lg">
                      <h4 className="font-semibold mb-3">Attention Mechanism Details</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Query (Q):</strong> What information to look for
                        </div>
                        <div>
                          <strong>Key (K):</strong> What information is available
                        </div>
                        <div>
                          <strong>Value (V):</strong> The actual information content
                        </div>
                        <div>
                          <strong>Attention Score:</strong> Q·K similarity measure
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="neural" className="space-y-6">
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Neural Network Layers</h3>
                    
                    {/* Layer Selector */}
                    <div className="flex gap-2 flex-wrap">
                      {Array.from({length: 12}, (_, i) => (
                        <Button
                          key={i}
                          variant={activeLayer === i ? "default" : "outline"}
                          size="sm"
                          onClick={() => setActiveLayer(i)}
                        >
                          Layer {i + 1}
                        </Button>
                      ))}
                    </div>

                    {/* Layer Visualization */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg">
                      <h4 className="font-semibold mb-4">Transformer Layer {activeLayer + 1}</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-white rounded border">
                          <span>Multi-Head Attention</span>
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                              style={{ width: currentStage >= 4 ? '100%' : '0%' }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white rounded border">
                          <span>Feed Forward Network</span>
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                              style={{ width: currentStage >= 5 ? '100%' : '0%' }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white rounded border">
                          <span>Layer Normalization</span>
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-500 h-2 rounded-full transition-all duration-1000"
                              style={{ width: currentStage >= 5 ? '100%' : '0%' }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Technical Specifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Technical Deep Dive
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold">Model Architecture</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Transformer-based</li>
                <li>• 12-96 layers deep</li>
                <li>• Multi-head attention</li>
                <li>• Feed-forward networks</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Processing Stats</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• ~100B-1T parameters</li>
                <li>• 4096-8192 context length</li>
                <li>• Float16/BFloat16 precision</li>
                <li>• Parallel computation</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Optimization</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• GPU/TPU acceleration</li>
                <li>• Gradient checkpointing</li>
                <li>• Mixed precision training</li>
                <li>• Memory optimization</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Output Generation</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Autoregressive decoding</li>
                <li>• Temperature sampling</li>
                <li>• Top-p/Top-k filtering</li>
                <li>• Beam search</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PromptProcessingVisualizer;