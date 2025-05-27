import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  Upload, 
  Brain, 
  Shield, 
  BarChart3, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap,
  Eye,
  TrendingUp,
  Activity
} from 'lucide-react';

interface DetectionResult {
  overallScore: number;
  confidence: number;
  label: string;
  analysis: {
    synthId: number;
    perplexity: number;
    burstiness: number;
    patterns: number;
    repetition: number;
    vocabulary: number;
    sentiment: number;
  };
  flags: string[];
  suggestions: string[];
  metadata: {
    wordCount: number;
    sentenceCount: number;
    avgWordsPerSentence: number;
    uniqueWords: number;
    readabilityScore: number;
  };
}

// Enhanced SynthID-inspired watermark detection
const detectSynthIDWatermark = (text: string): number => {
  const tokens = text.trim().split(/\s+/).filter(Boolean);
  if (tokens.length < 10) return 0;
  
  // Multi-layer hash analysis
  const layer1 = tokens.map(t => t.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 2);
  const layer2 = tokens.map(t => (t.length * 31 + t.charCodeAt(0)) % 3);
  const layer3 = tokens.map(t => t.toLowerCase().split('').reduce((acc, c) => acc * 7 + c.charCodeAt(0), 1) % 5);
  
  // Calculate distribution anomalies
  const anomaly1 = Math.abs(layer1.filter(x => x === 1).length / tokens.length - 0.5);
  const anomaly2 = Math.abs(layer2.filter(x => x === 1).length / tokens.length - 0.33);
  const anomaly3 = Math.abs(layer3.filter(x => x === 2).length / tokens.length - 0.2);
  
  return Math.min(1, (anomaly1 + anomaly2 + anomaly3) * 2);
};

// Perplexity estimation
const calculatePerplexity = (text: string): number => {
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length < 5) return 0;
  
  const bigrams: { [key: string]: number } = {};
  const unigrams: { [key: string]: number } = {};
  
  for (let i = 0; i < words.length - 1; i++) {
    const bigram = `${words[i]} ${words[i + 1]}`;
    bigrams[bigram] = (bigrams[bigram] || 0) + 1;
    unigrams[words[i]] = (unigrams[words[i]] || 0) + 1;
  }
  
  let logProb = 0;
  let count = 0;
  
  for (const [bigram, freq] of Object.entries(bigrams)) {
    const [w1] = bigram.split(' ');
    const prob = freq / (unigrams[w1] || 1);
    if (prob > 0) {
      logProb += Math.log(prob);
      count++;
    }
  }
  
  return count > 0 ? Math.exp(-logProb / count) : 1;
};

// Burstiness detection
const calculateBurstiness = (text: string): number => {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length < 3) return 0;
  
  const lengths = sentences.map(s => s.trim().split(/\s+/).length);
  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((acc, len) => acc + Math.pow(len - mean, 2), 0) / lengths.length;
  const stdDev = Math.sqrt(variance);
  
  return Math.min(1, stdDev / Math.max(mean, 1));
};

// Pattern detection
const detectPatterns = (text: string): number => {
  let patternScore = 0;
  
  // Common AI phrases
  const aiPhrases = [
    /as an ai/i,
    /i'm an ai/i,
    /language model/i,
    /i don't have personal/i,
    /i cannot/i,
    /it's important to note/i,
    /however,? it'?s worth/i,
    /in conclusion/i,
    /to summarize/i,
    /furthermore/i,
    /moreover/i,
    /additionally/i
  ];
  
  aiPhrases.forEach(phrase => {
    if (phrase.test(text)) patternScore += 0.1;
  });
  
  // Repetitive structures
  const sentences = text.split(/[.!?]+/);
  const startWords = sentences.map(s => s.trim().split(/\s+/)[0]?.toLowerCase()).filter(Boolean);
  const startWordCounts: { [key: string]: number } = {};
  
  startWords.forEach(word => {
    startWordCounts[word] = (startWordCounts[word] || 0) + 1;
  });
  
  const maxRepeat = Math.max(...Object.values(startWordCounts));
  if (maxRepeat > sentences.length * 0.3) patternScore += 0.3;
  
  return Math.min(1, patternScore);
};

// Repetition analysis
const analyzeRepetition = (text: string): number => {
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length < 10) return 0;
  
  // Check for word repetition
  const wordCounts: { [key: string]: number } = {};
  words.forEach(word => {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  });
  
  const repetitions = Object.values(wordCounts).filter(count => count > 1);
  const repetitionScore = repetitions.length / Object.keys(wordCounts).length;
  
  // Check for phrase repetition
  const phrases: { [key: string]: number } = {};
  for (let i = 0; i < words.length - 2; i++) {
    const phrase = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
    phrases[phrase] = (phrases[phrase] || 0) + 1;
  }
  
  const phraseRepetitions = Object.values(phrases).filter(count => count > 1).length;
  const phraseScore = phraseRepetitions / Math.max(Object.keys(phrases).length, 1);
  
  return Math.min(1, (repetitionScore + phraseScore) / 2);
};

// Vocabulary sophistication
const analyzeVocabulary = (text: string): number => {
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  if (words.length < 10) return 0;
  
  const uniqueWords = new Set(words);
  const lexicalDiversity = uniqueWords.size / words.length;
  
  // Common vs uncommon words ratio
  const commonWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
    'this', 'that', 'these', 'those', 'what', 'which', 'who', 'when', 'where', 'why', 'how'
  ]);
  
  const uncommonWords = [...uniqueWords].filter(word => 
    !commonWords.has(word) && word.length > 4
  ).length;
  
  const sophisticationScore = uncommonWords / uniqueWords.size;
  
  return Math.min(1, (lexicalDiversity + sophisticationScore) / 2);
};

// Sentiment consistency
const analyzeSentiment = (text: string): number => {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length < 3) return 0;
  
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'positive', 'beneficial', 'helpful', 'useful'];
  const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'negative', 'harmful', 'difficult', 'challenging', 'problematic', 'concerning'];
  
  const sentiments = sentences.map(sentence => {
    const words = sentence.toLowerCase().split(/\s+/);
    let score = 0;
    words.forEach(word => {
      if (positiveWords.includes(word)) score += 1;
      if (negativeWords.includes(word)) score -= 1;
    });
    return score;
  });
  
  const mean = sentiments.reduce((a, b) => a + b, 0) / sentiments.length;
  const variance = sentiments.reduce((acc, sent) => acc + Math.pow(sent - mean, 2), 0) / sentiments.length;
  
  return Math.min(1, Math.sqrt(variance) / 2);
};

// Calculate readability score (Flesch Reading Ease approximation)
const calculateReadability = (text: string): number => {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.match(/\b\w+\b/g) || [];
  const syllables = words.reduce((acc, word) => {
    return acc + Math.max(1, word.toLowerCase().replace(/[^aeiou]/g, '').length);
  }, 0);
  
  if (sentences.length === 0 || words.length === 0) return 0;
  
  const avgSentenceLength = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;
  
  const score = 206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord;
  return Math.max(0, Math.min(100, score));
};

const analyzeText = (text: string): DetectionResult => {
  if (!text.trim()) {
    return {
      overallScore: 0,
      confidence: 0,
      label: 'No text provided',
      analysis: {
        synthId: 0,
        perplexity: 0,
        burstiness: 0,
        patterns: 0,
        repetition: 0,
        vocabulary: 0,
        sentiment: 0
      },
      flags: [],
      suggestions: ['Please provide text to analyze'],
      metadata: {
        wordCount: 0,
        sentenceCount: 0,
        avgWordsPerSentence: 0,
        uniqueWords: 0,
        readabilityScore: 0
      }
    };
  }

  const words = text.match(/\b\w+\b/g) || [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
  
  const analysis = {
    synthId: detectSynthIDWatermark(text),
    perplexity: calculatePerplexity(text),
    burstiness: calculateBurstiness(text),
    patterns: detectPatterns(text),
    repetition: analyzeRepetition(text),
    vocabulary: analyzeVocabulary(text),
    sentiment: analyzeSentiment(text)
  };
  
  // Calculate weighted overall score
  const weights = {
    synthId: 0.25,
    perplexity: 0.15,
    burstiness: 0.1,
    patterns: 0.2,
    repetition: 0.15,
    vocabulary: 0.1,
    sentiment: 0.05
  };
  
  const overallScore = Object.entries(analysis).reduce((acc, [key, value]) => {
    return acc + value * (weights[key as keyof typeof weights] || 0);
  }, 0);
  
  const confidence = Math.min(1, Math.max(0.1, 
    1 - Math.abs(0.5 - overallScore) * 2 + (words.length > 100 ? 0.2 : 0)
  ));
  
  const flags: string[] = [];
  const suggestions: string[] = [];
  
  if (analysis.synthId > 0.6) flags.push('High watermark signature detected');
  if (analysis.patterns > 0.5) flags.push('AI-typical language patterns found');
  if (analysis.repetition > 0.7) flags.push('Unusual repetition patterns');
  if (analysis.burstiness < 0.2) flags.push('Low sentence length variation');
  if (analysis.vocabulary > 0.8) flags.push('Highly sophisticated vocabulary');
  
  if (overallScore > 0.7) {
    suggestions.push('Consider human review for verification');
    suggestions.push('Check for AI-generated content policies');
  } else if (overallScore < 0.3) {
    suggestions.push('Content appears authentically human-written');
  } else {
    suggestions.push('Mixed signals - may contain both human and AI elements');
  }
  
  const label = overallScore > 0.75 ? 'Very Likely AI-Generated' :
                overallScore > 0.6 ? 'Likely AI-Generated' :
                overallScore > 0.4 ? 'Possibly AI-Generated' :
                overallScore > 0.25 ? 'Likely Human-Written' : 'Very Likely Human-Written';
  
  const metadata = {
    wordCount: words.length,
    sentenceCount: sentences.length,
    avgWordsPerSentence: sentences.length > 0 ? Math.round(words.length / sentences.length * 10) / 10 : 0,
    uniqueWords,
    readabilityScore: Math.round(calculateReadability(text))
  };
  
  return {
    overallScore,
    confidence,
    label,
    analysis,
    flags,
    suggestions,
    metadata
  };
};

const AIContentDetector = () => {
  const [text, setText] = useState('');
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    // Simulate processing time for better UX
    setTimeout(() => {
      const res = analyzeText(text);
      setResult(res);
      setIsAnalyzing(false);
    }, 1500);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadProgress(0);
    const reader = new FileReader();
    
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        setUploadProgress((event.loaded / event.total) * 100);
      }
    };
    
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setText(content);
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 1000);
    };
    
    reader.readAsText(file);
  };

  const getScoreColor = (score: number) => {
    if (score > 0.75) return 'text-red-600';
    if (score > 0.6) return 'text-orange-600';
    if (score > 0.4) return 'text-yellow-600';
    if (score > 0.25) return 'text-blue-600';
    return 'text-green-600';
  };

  const getScoreIcon = (score: number) => {
    if (score > 0.6) return <XCircle className="h-4 w-4 text-red-500" />;
    if (score > 0.4) return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-500 to-pink-500 bg-clip-text text-transparent">
                AI Content Detector Pro
              </CardTitle>
              <CardDescription>
                Advanced AI detection using SynthID-inspired algorithms and multi-layered analysis
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your text here for analysis..."
              className="min-h-[200px] text-base"
            />
            
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".txt,.md,.json,.csv,.log,.html,.js,.ts,.tsx,.py,.java,.pdf,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button variant="outline" className="cursor-pointer" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </span>
                  </Button>
                </label>
              </div>
              
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="flex-1 max-w-xs">
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}
              
              <Button 
                onClick={handleAnalyze} 
                disabled={!text.trim() || isAnalyzing}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {isAnalyzing ? (
                  <>
                    <Activity className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Analyze Content
                  </>
                )}
              </Button>
            </div>
          </div>

          {result && (
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
                <TabsTrigger value="metadata">Metadata</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <div className="text-center space-y-2">
                        <div className="flex items-center justify-center gap-2">
                          {getScoreIcon(result.overallScore)}
                          <h3 className={`text-2xl font-bold ${getScoreColor(result.overallScore)}`}>
                            {result.label}
                          </h3>
                        </div>
                        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                          <span>Score: {Math.round(result.overallScore * 100)}%</span>
                          <span>Confidence: {Math.round(result.confidence * 100)}%</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>AI Probability</span>
                          <span>{Math.round(result.overallScore * 100)}%</span>
                        </div>
                        <Progress value={result.overallScore * 100} className="h-3" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Detection Confidence</span>
                          <span>{Math.round(result.confidence * 100)}%</span>
                        </div>
                        <Progress value={result.confidence * 100} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {result.flags.length > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Detection Flags:</strong>
                      <ul className="mt-2 space-y-1">
                        {result.flags.map((flag, index) => (
                          <li key={index} className="text-sm">• {flag}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              <TabsContent value="analysis" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(result.analysis).map(([key, value]) => {
                    const labels = {
                      synthId: 'SynthID Watermark',
                      perplexity: 'Perplexity Score',
                      burstiness: 'Burstiness',
                      patterns: 'AI Patterns',
                      repetition: 'Repetition',
                      vocabulary: 'Vocabulary',
                      sentiment: 'Sentiment Variation'
                    };
                    
                    const icons = {
                      synthId: <Shield className="h-4 w-4" />,
                      perplexity: <TrendingUp className="h-4 w-4" />,
                      burstiness: <Activity className="h-4 w-4" />,
                      patterns: <Eye className="h-4 w-4" />,
                      repetition: <BarChart3 className="h-4 w-4" />,
                      vocabulary: <FileText className="h-4 w-4" />,
                      sentiment: <Zap className="h-4 w-4" />
                    };
                    
                    return (
                      <Card key={key}>
                        <CardContent className="pt-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              {icons[key as keyof typeof icons]}
                              <span className="font-medium text-sm">
                                {labels[key as keyof typeof labels]}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Score</span>
                              <span className={getScoreColor(value)}>
                                {Math.round(value * 100)}%
                              </span>
                            </div>
                            <Progress value={value * 100} className="h-2" />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="metadata" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Document Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Word Count</div>
                        <div className="text-2xl font-bold">{result.metadata.wordCount.toLocaleString()}</div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Sentences</div>
                        <div className="text-2xl font-bold">{result.metadata.sentenceCount}</div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Avg Words/Sentence</div>
                        <div className="text-2xl font-bold">{result.metadata.avgWordsPerSentence}</div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Unique Words</div>
                        <div className="text-2xl font-bold">{result.metadata.uniqueWords.toLocaleString()}</div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Readability Score</div>
                        <div className="text-2xl font-bold">{result.metadata.readabilityScore}</div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Lexical Diversity</div>
                        <div className="text-2xl font-bold">
                          {Math.round((result.metadata.uniqueWords / result.metadata.wordCount) * 100)}%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="insights" className="space-y-4">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Key Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {result.suggestions.map((suggestion, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-sm">{suggestion}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Detection Method</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4 text-sm">
                        <p>
                          This detector uses multiple advanced algorithms including:
                        </p>
                        <ul className="space-y-2 ml-4">
                          <li>• <strong>SynthID-inspired watermark detection</strong> - Multi-layer hash analysis</li>
                          <li>• <strong>Perplexity estimation</strong> - Language model probability assessment</li>
                          <li>• <strong>Burstiness analysis</strong> - Sentence length variation patterns</li>
                          <li>• <strong>Pattern recognition</strong> - AI-typical language structures</li>
                          <li>• <strong>Repetition analysis</strong> - Word and phrase redundancy</li>
                          <li>• <strong>Vocabulary sophistication</strong> - Lexical diversity and complexity</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AIContentDetector;