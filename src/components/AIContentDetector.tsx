import React, { useState, useEffect, ChangeEvent } from 'react';
// Assuming these are your shadcn/ui components. Adjust paths if necessary.
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import GlassmorphicTheme from './GlassmorphicTheme';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
// import { Badge } from '@/components/ui/badge'; // Badge was imported but not used, can be removed if not needed
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

// Add type definition for Tesseract on the window object
declare global {
  interface Window {
    Tesseract?: any; // Tesseract might not be loaded, so it's optional. Replace 'any' with a more specific type if available.
  }
}

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
  if (words.length > 0) { // Ensure words array is not empty
    unigrams[words[words.length - 1]] = (unigrams[words[words.length - 1]] || 0) + 1;
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

  return count > 0 ? Math.exp(-logProb / count) : 1; // Return 1 (high perplexity) if no bigrams found
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
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length > 1) {
    const startWords = sentences.map(s => s.trim().split(/\s+/)[0]?.toLowerCase()).filter(Boolean);
    const startWordCounts: { [key: string]: number } = {};

    startWords.forEach(word => {
      startWordCounts[word] = (startWordCounts[word] || 0) + 1;
    });

    const maxRepeat = Math.max(0, ...Object.values(startWordCounts)); // Ensure Math.max has at least one number
    if (sentences.length > 0 && maxRepeat > sentences.length * 0.3) patternScore += 0.3;
  }


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
  const repetitionScore = Object.keys(wordCounts).length > 0 ? repetitions.length / Object.keys(wordCounts).length : 0;

  // Check for phrase repetition
  const phrases: { [key: string]: number } = {};
  if (words.length >= 3) {
    for (let i = 0; i < words.length - 2; i++) {
      const phrase = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
      phrases[phrase] = (phrases[phrase] || 0) + 1;
    }
  }

  const phraseRepetitions = Object.values(phrases).filter(count => count > 1).length;
  const phraseScore = Object.keys(phrases).length > 0 ? phraseRepetitions / Object.keys(phrases).length : 0;

  return Math.min(1, (repetitionScore + phraseScore) / 2);
};

// Vocabulary sophistication
const analyzeVocabulary = (text: string): number => {
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  if (words.length < 10) return 0;

  const uniqueWords = new Set(words);
  const lexicalDiversity = uniqueWords.size > 0 && words.length > 0 ? uniqueWords.size / words.length : 0;


  // Common vs uncommon words ratio
  const commonWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
    'this', 'that', 'these', 'those', 'what', 'which', 'who', 'when', 'where', 'why', 'how'
  ]);

  const uncommonWordsCount = [...uniqueWords].filter(word =>
    !commonWords.has(word) && word.length > 4
  ).length;

  const sophisticationScore = uniqueWords.size > 0 ? uncommonWordsCount / uniqueWords.size : 0;

  return Math.min(1, (lexicalDiversity + sophisticationScore) / 2);
};

// Sentiment consistency
const analyzeSentiment = (text: string): number => {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length < 3) return 0;

  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'positive', 'beneficial', 'helpful', 'useful', 'love', 'happy', 'joy', 'success'];
  const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'negative', 'harmful', 'difficult', 'challenging', 'problematic', 'concerning', 'hate', 'sad', 'fear', 'failure'];

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

  return Math.min(1, Math.sqrt(variance) / 2); // Normalize, assuming max reasonable std dev for sentiment scores
};

// Calculate readability score (Flesch Reading Ease approximation)
const calculateReadability = (text: string): number => {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const wordsMatch = text.match(/\b\w+\b/g);
  const words: string[] = wordsMatch ? wordsMatch : [];

  if (sentences.length === 0 || words.length === 0) return 0;

  const syllables = words.reduce((acc: number, word: string) => {
    // Basic syllable counter (can be improved)
    let processedWord = word.toLowerCase();
    if (processedWord.length <= 3) return acc + 1;
    processedWord = processedWord.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    processedWord = processedWord.replace(/^y/, '');
    const vowelMatches = processedWord.match(/[aeiouy]{1,2}/g);
    return acc + (vowelMatches ? vowelMatches.length : 0);
  }, 0);

  const avgSentenceLength = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;

  const score = 206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord;
  return Math.max(0, Math.min(100, score)); // Score is between 0 and 100
};

const analyzeText = (text: string): DetectionResult => {
  if (!text.trim()) {
    return {
      overallScore: 0,
      confidence: 0,
      label: 'No text provided',
      analysis: {
        synthId: 0, perplexity: 0, burstiness: 0, patterns: 0,
        repetition: 0, vocabulary: 0, sentiment: 0
      },
      flags: [],
      suggestions: ['Please provide text to analyze'],
      metadata: {
        wordCount: 0, sentenceCount: 0, avgWordsPerSentence: 0,
        uniqueWords: 0, readabilityScore: 0
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
    synthId: 0.25, perplexity: 0.15, burstiness: 0.1, patterns: 0.2,
    repetition: 0.15, vocabulary: 0.1, sentiment: 0.05
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
  if (analysis.burstiness < 0.2 && sentences.length > 2) flags.push('Low sentence length variation (robotic)');
  if (analysis.vocabulary > 0.8) flags.push('Highly sophisticated or niche vocabulary');
  if (analysis.perplexity < 20 && analysis.perplexity > 0) flags.push('Very low perplexity (predictable text)'); // Low perplexity can indicate AI
  if (analysis.sentiment > 0.8) flags.push('Highly uniform sentiment');


  if (overallScore > 0.7) {
    suggestions.push('Consider human review for verification.');
    suggestions.push('Cross-reference content with known AI generation patterns.');
  } else if (overallScore < 0.3) {
    suggestions.push('Content appears to have strong human-written characteristics.');
  } else {
    suggestions.push('Mixed signals detected. May contain both human and AI-generated elements or be stylistically ambiguous.');
    suggestions.push('Further scrutiny may be needed depending on context.');
  }

  const label = overallScore > 0.75 ? 'Very Likely AI-Generated' :
    overallScore > 0.6 ? 'Likely AI-Generated' :
      overallScore > 0.4 ? 'Possibly AI-Generated' :
        overallScore > 0.25 ? 'Likely Human-Written' : 'Very Likely Human-Written';

  const metadata = {
    wordCount: words.length,
    sentenceCount: sentences.length,
    avgWordsPerSentence: sentences.length > 0 ? Math.round((words.length / sentences.length) * 10) / 10 : 0,
    uniqueWords,
    readabilityScore: Math.round(calculateReadability(text))
  };

  return {
    overallScore, confidence, label, analysis, flags, suggestions, metadata
  };
};


const EnhancedAIContentDetector: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadMessage, setUploadMessage] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [tesseractReady, setTesseractReady] = useState<boolean>(false);
  const [tesseractWarning, setTesseractWarning] = useState<string>('');

  // Check for Tesseract.js on component mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Tesseract) {
      setTesseractReady(true);
      setTesseractWarning(''); // Clear warning if found
    } else {
      const warningMsg = "Tesseract.js (for image OCR) is NOT LOADED. Image analysis will be disabled. To enable it, YOU MUST ADD the following script tag to your main HTML file (e.g., public/index.html): <script src='https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js'></script>";
      console.error("CRITICAL SETUP REQUIRED: " + warningMsg); // More prominent console message
      setTesseractWarning(warningMsg);
      setTesseractReady(false);
    }
  }, []);


  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setUploadMessage(''); // Clear upload message before analysis
    // Simulate processing time for better UX
    setTimeout(() => {
      const res = analyzeText(text);
      setResult(res);
      setIsAnalyzing(false);
    }, 1500);
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setText(''); // Clear previous text
    setResult(null); // Clear previous results
    setUploadProgress(0);
    setUploadMessage(`Processing ${file.name}...`);

    const reader = new FileReader();

    reader.onprogress = (event: ProgressEvent<FileReader>) => {
      if (event.lengthComputable) {
        setUploadProgress((event.loaded / event.total) * 100);
      }
    };

    reader.onload = async (event: ProgressEvent<FileReader>) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setText(content);
        setUploadMessage(`${file.name} loaded successfully.`);
      }
      setUploadProgress(100);
      setTimeout(() => {
        setUploadProgress(0);
      }, 1500);
    };

    reader.onerror = () => {
        setUploadMessage(`Error reading ${file.name}.`);
        setUploadProgress(0);
    }

    if (file.type.startsWith('text/')) {
      setUploadMessage(`Reading text file: ${file.name}`);
      reader.readAsText(file);
    } else if (file.type.startsWith('image/')) {
      setUploadMessage(`Extracting text from image: ${file.name}`);
      if (!tesseractReady || !window.Tesseract) { // Double check Tesseract readiness
        const errorMsg = tesseractWarning || "Tesseract.js is not loaded, so image OCR cannot proceed. Please add the Tesseract.js CDN script to your application's main HTML file.";
        setUploadMessage(errorMsg);
        console.error(errorMsg);
        setUploadProgress(0);
        return;
      }
      try {
        const { data: { text: imageText } } = await window.Tesseract.recognize(
          file,
          'eng', // Language
          {
            logger: (m: any) => { 
              if (m.status === 'recognizing text') {
                setUploadProgress(m.progress * 100);
              }
            }
          }
        );
        setText(imageText);
        setUploadMessage(`Text extracted from ${file.name} successfully!`);
        setUploadProgress(100);
      } catch (error) {
        console.error("Error during OCR:", error);
        setUploadMessage(`Failed to extract text from ${file.name}. ${error instanceof Error ? error.message : 'Unknown OCR error.'}. Ensure Tesseract.js is correctly loaded from CDN.`);
        setUploadProgress(0);
      }
    } else if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
      setUploadMessage(`Processing ${file.type}: ${file.name}`);
      setText(`[Automated transcription for audio/video files like '${file.name}' would be implemented here using a speech-to-text service. This feature is currently a placeholder.]`);
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 1500);
    } else {
      setUploadMessage(`Unsupported file type: ${file.type}. Please upload text or image files.`);
      setUploadProgress(0);
      setFileName('');
    }
     e.target.value = ''; 
  };

  const getScoreColor = (score: number) => {
    if (score > 0.75) return 'text-red-600 dark:text-red-400';
    if (score > 0.6) return 'text-orange-600 dark:text-orange-400';
    if (score > 0.4) return 'text-yellow-600 dark:text-yellow-400';
    if (score > 0.25) return 'text-blue-600 dark:text-blue-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getScoreIcon = (score: number) => {
    if (score > 0.6) return <XCircle className="h-5 w-5 text-red-500" />;
    if (score > 0.4) return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    return <CheckCircle className="h-5 w-5 text-green-500" />;
  };
  

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <GlassmorphicTheme variant="hero" className="p-6 rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Search className="h-8 w-8 text-cyan-600" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Content Detector
              </h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Advanced AI detection using multi-layered analysis including text and image files
            </p>
          </div>
        </div>
      </GlassmorphicTheme>
      
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-6 bg-white dark:bg-gray-900 rounded-xl shadow-2xl">
      <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-md">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Content Detector Pro
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Advanced AI detection using multi-layered analysis. Upload text or image files.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {tesseractWarning && (
            <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-700 dark:text-red-500">
              <AlertTriangle className="h-5 w-5" />
              <AlertDescription>
                <strong className="font-semibold">Setup Required for Image OCR:</strong>
                <p className="mt-1">{tesseractWarning}</p>
              </AlertDescription>
            </Alert>
          )}
          <div className="space-y-4">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your text here for analysis, or upload a file below..."
              className="min-h-[200px] text-base p-4 rounded-lg border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
            />

            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".txt,.md,.rtf,.html,.xml,image/png,image/jpeg,image/webp,image/bmp,audio/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload-input"
                />
                <label htmlFor="file-upload-input" className="w-full sm:w-auto">
                  <Button variant="outline" asChild className="cursor-pointer w-full sm:w-auto flex items-center justify-center gap-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                    <span> 
                      <Upload className="h-5 w-5" />
                       Upload File
                    </span>
                  </Button>
                </label>
              </div>

             <Button
                onClick={handleAnalyze}
                disabled={!text.trim() || isAnalyzing}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <>
                    <Activity className="h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    Analyze Content
                  </>
                )}
              </Button>
            </div>
             {fileName && <p className="text-sm text-gray-500 dark:text-gray-400">Selected file: {fileName}</p>}
            {(uploadProgress > 0 || uploadMessage) && (
              <div className="mt-2">
                {uploadMessage && <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{uploadMessage}</p>}
                {uploadProgress > 0 && <Progress value={uploadProgress} className="h-2 [&>div]:bg-blue-500" />}
              </div>
            )}
          </div>

          {result && (
            <Tabs defaultValue="overview" className="space-y-4 pt-4">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                <TabsTrigger value="overview" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:shadow-sm rounded-md py-2">Overview</TabsTrigger>
                <TabsTrigger value="analysis" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:shadow-sm rounded-md py-2">Analysis</TabsTrigger>
                <TabsTrigger value="metadata" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:shadow-sm rounded-md py-2">Metadata</TabsTrigger>
                <TabsTrigger value="insights" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:shadow-sm rounded-md py-2">Insights</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <div className="text-center space-y-2">
                        <div className="flex items-center justify-center gap-2">
                          {getScoreIcon(result.overallScore)}
                          <h3 className={`text-3xl font-bold ${getScoreColor(result.overallScore)}`}>
                            {result.label}
                          </h3>
                        </div>
                        <div className="flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>AI Score: <strong>{Math.round(result.overallScore * 100)}%</strong></span>
                          <span>Confidence: <strong>{Math.round(result.confidence * 100)}%</strong></span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                            <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                <span>AI Probability</span>
                                <span className={getScoreColor(result.overallScore)}>{Math.round(result.overallScore * 100)}%</span>
                            </div>
                            <Progress value={result.overallScore * 100} className="h-3 rounded-full [&>div]:bg-gradient-to-r [&>div]:from-blue-400 [&>div]:to-purple-500" />
                        </div>
                        <div>
                            <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                <span>Detection Confidence</span>
                                <span>{Math.round(result.confidence * 100)}%</span>
                            </div>
                            <Progress value={result.confidence * 100} className="h-2 rounded-full [&>div]:bg-green-500" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {result.flags.length > 0 && (
                  <Alert variant={result.overallScore > 0.5 ? "destructive" : "default"} className="bg-yellow-50 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
                    <AlertDescription>
                      <strong className="font-semibold">Detection Flags:</strong>
                      <ul className="mt-2 space-y-1 list-disc list-inside">
                        {result.flags.map((flag, index) => (
                          <li key={index} className="text-sm">{flag}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              <TabsContent value="analysis" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(result.analysis).map(([key, value]) => {
                    const labels: {[key: string]: string} = {
                      synthId: 'SynthID Watermark', perplexity: 'Perplexity Score',
                      burstiness: 'Burstiness', patterns: 'AI Patterns',
                      repetition: 'Repetition', vocabulary: 'Vocabulary Sophistication',
                      sentiment: 'Sentiment Variation'
                    };
                    const icons: {[key: string]: React.ReactNode} = {
                      synthId: <Shield className="h-5 w-5 text-blue-500" />,
                      perplexity: <TrendingUp className="h-5 w-5 text-green-500" />,
                      burstiness: <Activity className="h-5 w-5 text-purple-500" />,
                      patterns: <Eye className="h-5 w-5 text-red-500" />,
                      repetition: <BarChart3 className="h-5 w-5 text-yellow-500" />,
                      vocabulary: <FileText className="h-5 w-5 text-indigo-500" />,
                      sentiment: <Zap className="h-5 w-5 text-pink-500" />
                    };
                    return (
                      <Card key={key} className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                        <CardContent className="pt-4 space-y-2">
                          <div className="flex items-center gap-3">
                            {icons[key]}
                            <span className="font-semibold text-gray-700 dark:text-gray-200">
                              {labels[key]}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Score</span>
                            <span className={`font-bold ${getScoreColor(value)}`}>
                              {Math.round(value * 100)}%
                            </span>
                          </div>
                          <Progress value={value * 100} className="h-2 rounded-full" />
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="metadata" className="space-y-4">
                <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">Document Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-6">
                      {[
                        { label: "Word Count", value: result.metadata.wordCount.toLocaleString() },
                        { label: "Sentences", value: result.metadata.sentenceCount.toLocaleString() },
                        { label: "Avg Words/Sentence", value: result.metadata.avgWordsPerSentence },
                        { label: "Unique Words", value: result.metadata.uniqueWords.toLocaleString() },
                        { label: "Readability Score", value: `${result.metadata.readabilityScore}/100` },
                        { label: "Lexical Diversity", value: `${result.metadata.wordCount > 0 ? Math.round((result.metadata.uniqueWords / result.metadata.wordCount) * 100) : 0}%` },
                      ].map(item => (
                        <div key={item.label} className="space-y-1">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{item.label}</div>
                          <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="insights" className="space-y-4">
                <div className="space-y-4">
                  <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-100">
                        <Eye className="h-6 w-6 text-blue-500" />
                        Key Insights & Suggestions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {result.suggestions.map((suggestion, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{suggestion}</span>
                          </div>
                        ))}
                         {result.suggestions.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">No specific suggestions at this time.</p>}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">Detection Methodology</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                        <p>
                          This detector employs a sophisticated suite of algorithms to analyze text and identify characteristics often associated with AI-generated content. The analysis is multi-faceted:
                        </p>
                        <ul className="space-y-2 ml-4 list-disc">
                          <li><strong>SynthID-inspired Watermark:</strong> Checks for subtle statistical patterns indicative of some generation models.</li>
                          <li><strong>Perplexity Estimation:</strong> Measures the predictability of the text; very low perplexity can be a sign of AI.</li>
                          <li><strong>Burstiness Analysis:</strong> Examines variations in sentence length and structure.</li>
                          <li><strong>Pattern Recognition:</strong> Identifies common phrases and structures frequently used by AI.</li>
                          <li><strong>Repetition Analysis:</strong> Detects unusual repetition of words and phrases.</li>
                          <li><strong>Vocabulary Sophistication:</strong> Assesses lexical diversity and the use of uncommon words.</li>
                           <li><strong>Sentiment Variation:</strong> Analyzes the consistency or fluctuation of sentiment across the text.</li>
                        </ul>
                        <p className="mt-3 text-xs text-gray-500 dark:text-gray-500">
                            Note: AI detection is an evolving field. This tool provides an estimate based on current models and should be used as one of many signals in content assessment.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
       <footer className="text-center text-xs text-gray-400 dark:text-gray-500 py-4">
        AI Content Detector Pro &copy; {new Date().getFullYear()}
      </footer>
      </div>
    </div>
  );
};

export default EnhancedAIContentDetector;
