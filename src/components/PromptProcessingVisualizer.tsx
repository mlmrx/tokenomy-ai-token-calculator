import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
  Sparkles,
  Info,
  Timer,
  Gauge,
  DollarSign,
  TrendingUp,
  Split,
  Merge,
  Hash,
  Binary,
  GitBranch
} from 'lucide-react';
import GlassmorphicTheme from './GlassmorphicTheme';

interface SubStep {
  name: string;
  description: string;
  technicalDetail: string;
  duration: number;
  metrics?: {
    label: string;
    value: string;
  }[];
}

interface ProcessingStage {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  duration: number;
  details: string[];
  color: string;
  subSteps: SubStep[];
  technicalInfo: {
    title: string;
    content: string[];
  };
  realWorldExample: string;
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
      name: 'Input Reception & Preprocessing',
      description: 'Raw text input is received, validated, and prepared for neural processing',
      icon: <MessageSquare className="h-5 w-5" />,
      duration: 800,
      details: [
        'Text normalization and cleaning',
        'Character encoding validation (UTF-8)',
        'Input length validation',
        'Special character handling'
      ],
      color: 'from-blue-500 to-blue-600',
      subSteps: [
        {
          name: 'Input Reception',
          description: 'System receives raw text string from user interface',
          technicalDetail: 'HTTP POST request → API Gateway → Load Balancer → ML Server',
          duration: 100,
          metrics: [
            { label: 'Latency', value: '~5ms' },
            { label: 'Buffer Size', value: '32KB' }
          ]
        },
        {
          name: 'Character Encoding',
          description: 'Convert all characters to standardized UTF-8 encoding',
          technicalDetail: 'Unicode normalization (NFC/NFD), handles emojis, special chars, multi-byte sequences',
          duration: 150,
          metrics: [
            { label: 'Encoding', value: 'UTF-8' },
            { label: 'Chars Validated', value: inputText.length.toString() }
          ]
        },
        {
          name: 'Text Normalization',
          description: 'Standardize whitespace, remove invisible characters, handle case sensitivity',
          technicalDetail: 'Regex-based cleaning: \\s+ → single space, trim edges, preserve semantic punctuation',
          duration: 200,
          metrics: [
            { label: 'Original', value: `${inputText.length} chars` },
            { label: 'Normalized', value: `${inputText.trim().length} chars` }
          ]
        },
        {
          name: 'Length Validation',
          description: 'Verify input fits within model\'s context window limits',
          technicalDetail: `Model max context: 8192 tokens. Current estimate: ${inputText.split(/\s+/).length} words → ~${Math.ceil(inputText.split(/\s+/).length * 1.3)} tokens`,
          duration: 150,
          metrics: [
            { label: 'Context Window', value: '8192 tokens' },
            { label: 'Current Usage', value: `~${Math.ceil(inputText.split(/\s+/).length * 1.3)} tokens` }
          ]
        },
        {
          name: 'Security Check',
          description: 'Scan for injection attempts, malicious patterns, prompt exploits',
          technicalDetail: 'Pattern matching against known exploit signatures, content filtering policies',
          duration: 200,
          metrics: [
            { label: 'Threats', value: '0 detected' },
            { label: 'Safety Score', value: '100%' }
          ]
        }
      ],
      technicalInfo: {
        title: 'Input Pipeline Architecture',
        content: [
          'User input first hits an API gateway that handles rate limiting and authentication',
          'Text is immediately buffered in memory (typically 32-64KB buffer size)',
          'Character encoding is normalized to UTF-8 with full Unicode support',
          'Security filters scan for injection attacks, jailbreak attempts, and policy violations',
          'Input length is validated against the model\'s maximum context window (varies by model)',
          'All metadata is attached: timestamp, user ID, session context, API version'
        ]
      },
      realWorldExample: 'For GPT-4, this stage takes ~10-20ms. Claude handles up to 100K context window. Input preprocessing is crucial for multilingual support - handling 100+ languages with proper Unicode normalization.'
    },
    {
      id: 'tokenization',
      name: 'Tokenization (BPE/WordPiece)',
      description: 'Text is broken down into subword tokens using Byte-Pair Encoding or SentencePiece',
      icon: <Split className="h-5 w-5" />,
      duration: 1200,
      details: [
        'Byte-Pair Encoding (BPE) applied',
        'Subword tokenization',
        'Special tokens added ([CLS], [SEP], [EOS])',
        'Token ID assignment from vocabulary'
      ],
      color: 'from-purple-500 to-purple-600',
      subSteps: [
        {
          name: 'Vocabulary Loading',
          description: 'Load pre-trained tokenizer vocabulary (typically 50K-100K tokens)',
          technicalDetail: `GPT models use ~50,257 tokens. BERT uses ~30K. Each token maps to unique ID. Vocabulary includes full words, subwords, characters, and special tokens.`,
          duration: 150,
          metrics: [
            { label: 'Vocab Size', value: '50,257 tokens' },
            { label: 'Special Tokens', value: '5' }
          ]
        },
        {
          name: 'Byte-Pair Encoding',
          description: 'Apply BPE algorithm to split text into optimal subword units',
          technicalDetail: 'Iteratively merge most frequent character pairs. "renewable" → ["ren", "ew", "able"]. Handles unknown words via subword decomposition.',
          duration: 400,
          metrics: [
            { label: 'Algorithm', value: 'BPE' },
            { label: 'Tokens Created', value: tokens.length.toString() }
          ]
        },
        {
          name: 'Special Token Injection',
          description: 'Add control tokens: [CLS] for classification, [SEP] for separation, [EOS] for end',
          technicalDetail: '[CLS] (ID: 101) at start, [SEP] (ID: 102) between segments, [EOS] (ID: 50256) at end. These guide model behavior.',
          duration: 200,
          metrics: [
            { label: '[CLS]', value: 'ID 101' },
            { label: '[SEP]', value: 'ID 102' }
          ]
        },
        {
          name: 'Token ID Mapping',
          description: 'Map each token string to unique integer ID from vocabulary',
          technicalDetail: 'Hash table lookup O(1). "renewable" → 48493. Enables efficient embedding lookup in next stage.',
          duration: 250,
          metrics: [
            { label: 'Lookup Time', value: '<1ms per token' },
            { label: 'Total Tokens', value: tokens.length.toString() }
          ]
        },
        {
          name: 'Position Assignment',
          description: 'Assign absolute position index to each token for positional encoding',
          technicalDetail: `Positions 0 to ${tokens.length - 1}. Critical for maintaining word order in self-attention. Max position typically 512-8192.`,
          duration: 200,
          metrics: [
            { label: 'Max Position', value: '8192' },
            { label: 'Current', value: tokens.length.toString() }
          ]
        }
      ],
      technicalInfo: {
        title: 'Tokenization Algorithms',
        content: [
          'BPE (Byte-Pair Encoding): Used by GPT models. Merges frequent character pairs iteratively.',
          'WordPiece: Used by BERT. Similar to BPE but uses likelihood instead of frequency.',
          'SentencePiece: Language-agnostic, treats text as raw bytes. Used by T5, mBART.',
          'Subword units handle rare/unknown words by decomposition: "unhappiness" → ["un", "happiness"]',
          'Typical vocabulary: 30K-100K tokens. Balances coverage vs. computational cost.',
          'Special tokens: [PAD], [UNK], [CLS], [SEP], [MASK] for different model architectures.',
          'Tokenization is reversible but lossy for whitespace/formatting.'
        ]
      },
      realWorldExample: `GPT-4 uses ~100K vocabulary with BPE. Average English word = 1.3 tokens. "${inputText}" becomes ${tokens.length} tokens. This stage takes ~2-5ms for 100 words.`
    },
    {
      id: 'embedding',
      name: 'Token Embedding & Positional Encoding',
      description: 'Tokens are converted to dense vectors in high-dimensional space (768-4096D)',
      icon: <Hash className="h-5 w-5" />,
      duration: 900,
      details: [
        'Token embedding lookup from learned matrix',
        'Positional encoding addition (sinusoidal or learned)',
        'Layer normalization (mean=0, std=1)',
        'Dropout for regularization (typically 0.1)'
      ],
      color: 'from-green-500 to-green-600',
      subSteps: [
        {
          name: 'Embedding Matrix Lookup',
          description: 'Retrieve dense vector for each token ID from pre-trained embedding matrix',
          technicalDetail: 'Matrix size: [vocab_size × embedding_dim]. For GPT-4: [50,257 × 1,600]. Simple array index lookup O(1).',
          duration: 250,
          metrics: [
            { label: 'Embedding Dim', value: '1,600' },
            { label: 'Matrix Size', value: '80M params' }
          ]
        },
        {
          name: 'Positional Encoding',
          description: 'Add position information using sinusoidal functions or learned embeddings',
          technicalDetail: 'PE(pos, 2i) = sin(pos/10000^(2i/d)), PE(pos, 2i+1) = cos(pos/10000^(2i/d)). Allows model to use position.',
          duration: 200,
          metrics: [
            { label: 'Method', value: 'Sinusoidal' },
            { label: 'Max Length', value: '8192' }
          ]
        },
        {
          name: 'Token Type Embedding',
          description: 'Add segment embeddings to distinguish different text segments (optional)',
          technicalDetail: 'Used in BERT for question-answer pairs. Segment A vs Segment B. Binary embedding added to token embedding.',
          duration: 150,
          metrics: [
            { label: 'Segments', value: '2' },
            { label: 'Enabled', value: 'No' }
          ]
        },
        {
          name: 'Layer Normalization',
          description: 'Normalize embeddings to have mean=0 and std=1 for stable training',
          technicalDetail: 'LayerNorm(x) = γ((x-μ)/σ) + β. Learned parameters γ, β. Prevents exploding/vanishing gradients.',
          duration: 150,
          metrics: [
            { label: 'Mean', value: '≈0' },
            { label: 'Std Dev', value: '≈1' }
          ]
        },
        {
          name: 'Dropout Application',
          description: 'Randomly zero out embedding dimensions (10%) for regularization',
          technicalDetail: 'During inference: disabled. During training: prevents overfitting. Each element has 0.1 probability of being zeroed.',
          duration: 150,
          metrics: [
            { label: 'Dropout Rate', value: '0.1' },
            { label: 'Active', value: 'Inference: No' }
          ]
        }
      ],
      technicalInfo: {
        title: 'Embedding Space Architecture',
        content: [
          'Each token becomes a point in high-dimensional space (768D-4096D depending on model)',
          'Similar words cluster together: "king" near "queen", "man" near "woman"',
          'Embeddings are learned during training on massive text corpora',
          'Positional encoding is crucial - without it, model can\'t distinguish word order',
          'LayerNorm stabilizes training and allows deeper networks (96+ layers in GPT-4)',
          'Total parameters in embedding layer: vocab_size × embedding_dim (80M+ for large models)',
          'Embeddings are reused across all layers - same embedding matrix used throughout'
        ]
      },
      realWorldExample: `GPT-4 uses 1,600D embeddings. Total embedding parameters: 80M. Embeddings capture semantic meaning: "king" - "man" + "woman" ≈ "queen". This mathematical relationship emerges from training on billions of tokens.`
    },
    {
      id: 'attention',
      name: 'Multi-Head Self-Attention',
      description: 'Each token attends to all other tokens to understand contextual relationships',
      icon: <Eye className="h-5 w-5" />,
      duration: 1800,
      details: [
        'Query, Key, Value matrices computed (Q, K, V)',
        'Attention scores: softmax(QK^T / √d_k)',
        'Multi-head parallel processing (12-96 heads)',
        'Attention weights applied to Values'
      ],
      color: 'from-amber-500 to-amber-600',
      subSteps: [
        {
          name: 'Q, K, V Projection',
          description: 'Project embeddings into Query, Key, Value spaces using learned weight matrices',
          technicalDetail: 'For each head: Q = XW_Q, K = XW_K, V = XW_V. Weight matrices: [d_model × d_k]. Typically d_k = d_model/num_heads.',
          duration: 400,
          metrics: [
            { label: 'Num Heads', value: '96' },
            { label: 'Head Dim', value: '128' }
          ]
        },
        {
          name: 'Attention Score Computation',
          description: 'Calculate how much each token should attend to every other token',
          technicalDetail: 'Score_ij = (Q_i · K_j) / √d_k. Dot product measures similarity. Scale by √d_k prevents softmax saturation.',
          duration: 500,
          metrics: [
            { label: 'Operations', value: `${tokens.length}² × 96 heads` },
            { label: 'Complexity', value: 'O(n²)' }
          ]
        },
        {
          name: 'Causal Masking',
          description: 'Apply mask to prevent attending to future tokens (for autoregressive models)',
          technicalDetail: 'Mask matrix: upper triangle = -∞, lower = 0. After softmax, future tokens have 0 attention weight.',
          duration: 200,
          metrics: [
            { label: 'Type', value: 'Lower Triangle' },
            { label: 'Effect', value: 'No future leakage' }
          ]
        },
        {
          name: 'Softmax Normalization',
          description: 'Convert attention scores to probability distribution summing to 1',
          technicalDetail: 'Softmax(x_i) = exp(x_i) / Σexp(x_j). Ensures all attention weights ∈ [0,1] and sum to 1 per token.',
          duration: 300,
          metrics: [
            { label: 'Output Range', value: '[0, 1]' },
            { label: 'Row Sum', value: '1.0' }
          ]
        },
        {
          name: 'Weighted Value Aggregation',
          description: 'Combine Value vectors weighted by attention scores to create context-aware representation',
          technicalDetail: 'Output_i = Σ(Attention_ij × V_j). Each token becomes weighted average of all Values based on relevance.',
          duration: 400,
          metrics: [
            { label: 'Aggregation', value: 'Weighted sum' },
            { label: 'Dimensions', value: '128 per head' }
          ]
        }
      ],
      technicalInfo: {
        title: 'Self-Attention Mechanism',
        content: [
          'Attention allows each token to "look at" and gather information from all other tokens',
          'Multi-head attention processes different aspects in parallel: syntax, semantics, relationships',
          'Computational complexity: O(n²×d) where n=sequence length, d=dimension. Quadratic in length!',
          'Each attention head can specialize: some track syntax, others track semantic similarity',
          'Attention weights are interpretable - can visualize what the model "focuses on"',
          'Modern optimizations: Flash Attention reduces memory from O(n²) to O(n)',
          'GPT-4 uses 96 attention heads across multiple layers'
        ]
      },
      realWorldExample: `In "The cat sat on the mat", when processing "sat", attention heavily weights "cat" (subject) and "mat" (object). Attention head 3 might focus on subject-verb, head 7 on verb-object. Total: 96 heads × ${tokens.length}² attention scores computed per layer.`
    },
    {
      id: 'transformer',
      name: 'Transformer Layers (12-96 layers)',
      description: 'Deep neural network processes embeddings through multiple transformer blocks',
      icon: <Layers className="h-5 w-5" />,
      duration: 2400,
      details: [
        'Feed-forward networks (FFN): d_model → 4×d_model → d_model',
        'Residual connections: output = input + layer(input)',
        'Layer normalization after each sub-layer',
        'Repeated for 12-96 transformer blocks'
      ],
      color: 'from-red-500 to-red-600',
      subSteps: [
        {
          name: 'Multi-Head Attention Sub-Layer',
          description: 'Self-attention mechanism processes token relationships (described above)',
          technicalDetail: 'Already computed in attention stage. Each layer has independent attention parameters.',
          duration: 600,
          metrics: [
            { label: 'Layer', value: '1/96' },
            { label: 'Heads', value: '96' }
          ]
        },
        {
          name: 'Add & Norm (Post-Attention)',
          description: 'Add residual connection and apply layer normalization',
          technicalDetail: 'x_out = LayerNorm(x_in + MultiHeadAttention(x_in)). Residual helps gradient flow in deep networks.',
          duration: 200,
          metrics: [
            { label: 'Operation', value: 'x + Attn(x)' },
            { label: 'Normalized', value: 'Yes' }
          ]
        },
        {
          name: 'Feed-Forward Network',
          description: 'Two-layer MLP with expansion: d_model → 4×d_model → d_model',
          technicalDetail: 'FFN(x) = max(0, xW₁ + b₁)W₂ + b₂. GELU activation. Expands to 4× then projects back. Most parameters here!',
          duration: 800,
          metrics: [
            { label: 'Hidden Size', value: '6,400 (4×1,600)' },
            { label: 'Parameters', value: '~20M per layer' }
          ]
        },
        {
          name: 'Add & Norm (Post-FFN)',
          description: 'Second residual connection and normalization',
          technicalDetail: 'x_out = LayerNorm(x_in + FFN(x_in)). Double residual connection pattern in each transformer block.',
          duration: 200,
          metrics: [
            { label: 'Operation', value: 'x + FFN(x)' },
            { label: 'Normalized', value: 'Yes' }
          ]
        },
        {
          name: 'Layer Iteration',
          description: 'Repeat entire transformer block for all 96 layers',
          technicalDetail: `Stack 96 identical layers. Each has ~1.7B parameters. Total model: ~1.7B × 96 ≈ 163B params. Layer ${Math.min(currentStage * 12, 96)}/96 active.`,
          duration: 600,
          metrics: [
            { label: 'Total Layers', value: '96' },
            { label: 'Params/Layer', value: '1.7B' }
          ]
        }
      ],
      technicalInfo: {
        title: 'Transformer Architecture Deep Dive',
        content: [
          'Each layer refines representations: early layers learn syntax, later layers learn semantics',
          'Feed-forward network is where most parameters live: ~70% of total model parameters',
          'Residual connections allow training very deep networks (96+ layers) by preventing gradient vanishing',
          'Layer normalization keeps activations stable across all layers',
          'Modern models use Pre-LN (normalize before sub-layer) vs Post-LN for better training',
          'GPT-4: 96 layers × 1.7B params/layer = ~163B parameters total',
          'Inference requires processing all layers sequentially - parallelizable across batch/tokens but not layers'
        ]
      },
      realWorldExample: `GPT-4 with 96 transformer layers processes each token through 96 attention + FFN cycles. Total compute: ~163B parameter operations per token. For 100 tokens output: 16.3 trillion operations. This takes ~1-2 seconds on modern GPUs.`
    },
    {
      id: 'context',
      name: 'Context Integration & Memory',
      description: 'Integrate conversation history, retrieval-augmented generation (RAG), and long-term memory',
      icon: <Database className="h-5 w-5" />,
      duration: 1100,
      details: [
        'Conversation history concatenation',
        'Context window management (sliding or truncation)',
        'RAG: semantic search over knowledge base',
        'Cross-attention to retrieved documents'
      ],
      color: 'from-indigo-500 to-indigo-600',
      subSteps: [
        {
          name: 'History Retrieval',
          description: 'Fetch previous conversation turns from session storage',
          technicalDetail: 'Redis/Memory cache lookup. Session ID → conversation array. Typically last 10-20 turns kept in context.',
          duration: 150,
          metrics: [
            { label: 'History Turns', value: '5' },
            { label: 'Cache Hit', value: '100%' }
          ]
        },
        {
          name: 'Context Window Truncation',
          description: 'Fit conversation within model\'s maximum context length (8K-100K tokens)',
          technicalDetail: `Model max: 8,192 tokens. Current: ${tokens.length} prompt + 1,500 history + 2,000 system = ${tokens.length + 3500} total. Truncate oldest messages if needed.`,
          duration: 200,
          metrics: [
            { label: 'Window Size', value: '8,192' },
            { label: 'Usage', value: `${Math.min(100, ((tokens.length + 3500) / 8192) * 100).toFixed(0)}%` }
          ]
        },
        {
          name: 'RAG: Embedding Query',
          description: 'Convert current query to embedding vector for semantic search',
          technicalDetail: 'Use text-embedding-ada-002 or similar. Query → 1536D vector. Enables finding relevant documents by cosine similarity.',
          duration: 250,
          metrics: [
            { label: 'Embedding Model', value: 'text-embedding-3' },
            { label: 'Dimensions', value: '1536' }
          ]
        },
        {
          name: 'Vector Database Search',
          description: 'Search vector DB (Pinecone/Weaviate) for top-k most relevant documents',
          technicalDetail: 'Approximate nearest neighbor search (HNSW algorithm). Find top-5 documents with cosine similarity > 0.75.',
          duration: 300,
          metrics: [
            { label: 'Top-K', value: '5' },
            { label: 'Avg Similarity', value: '0.83' }
          ]
        },
        {
          name: 'Context Augmentation',
          description: 'Prepend retrieved documents to prompt as additional context',
          technicalDetail: 'Format: "Relevant context:\\n[Doc1]\\n[Doc2]\\n\\nUser question: [query]". Adds 500-2000 tokens of context.',
          duration: 200,
          metrics: [
            { label: 'Docs Added', value: '3' },
            { label: 'Tokens Added', value: '1,247' }
          ]
        }
      ],
      technicalInfo: {
        title: 'Context & Memory Systems',
        content: [
          'Context window is finite: GPT-4=8K, GPT-4-32K=32K, Claude=100K, Gemini=1M tokens',
          'Sliding window: Keep most recent N tokens, discard oldest when limit reached',
          'RAG (Retrieval-Augmented Generation): Fetch relevant docs from external KB before generation',
          'Vector embeddings enable semantic search: "renewable energy" finds "solar power", "wind turbines"',
          'Cross-attention allows model to selectively attend to retrieved documents',
          'Memory systems: short-term (conversation), long-term (vector DB), working (current context)',
          'Cost tradeoff: larger context = more accurate but slower and more expensive'
        ]
      },
      realWorldExample: `For customer support bot: User asks "battery problem". RAG searches 10K support docs, finds 5 most relevant articles about battery issues. These get prepended to prompt, giving model up-to-date specific knowledge beyond training data.`
    },
    {
      id: 'generation',
      name: 'Autoregressive Token Generation',
      description: 'Generate output tokens one-by-one using sampling strategies (greedy, beam search, nucleus)',
      icon: <Cpu className="h-5 w-5" />,
      duration: 2000,
      details: [
        'Autoregressive: predict next token from previous tokens',
        'Temperature scaling (0.0-2.0) controls randomness',
        'Top-p (nucleus) sampling for quality-randomness balance',
        'Repetition penalty prevents loops'
      ],
      color: 'from-cyan-500 to-cyan-600',
      subSteps: [
        {
          name: 'Next Token Prediction',
          description: 'Model outputs probability distribution over entire vocabulary (50K+ tokens)',
          technicalDetail: 'Softmax over logits: P(token_i) = exp(logit_i) / Σexp(logit_j). Each token gets probability 0-1, sum=1.',
          duration: 400,
          metrics: [
            { label: 'Vocab Size', value: '50,257' },
            { label: 'Distribution', value: 'Softmax' }
          ]
        },
        {
          name: 'Temperature Scaling',
          description: 'Adjust probability distribution sharpness: low temp = focused, high = creative',
          technicalDetail: 'logits = logits / temperature. T=0.1 → near-deterministic. T=1.0 → original. T=2.0 → very random. T=0.7 typical for chatbots.',
          duration: 150,
          metrics: [
            { label: 'Temperature', value: '0.7' },
            { label: 'Effect', value: 'Balanced' }
          ]
        },
        {
          name: 'Top-p (Nucleus) Sampling',
          description: 'Sample from smallest set of tokens whose cumulative probability exceeds p',
          technicalDetail: 'p=0.9: Pick smallest set of tokens covering 90% probability mass. Excludes low-probability outliers. Better than top-k.',
          duration: 200,
          metrics: [
            { label: 'Top-p', value: '0.9' },
            { label: 'Candidates', value: '~50 tokens' }
          ]
        },
        {
          name: 'Token Sampling',
          description: 'Sample one token from filtered distribution using weighted random selection',
          technicalDetail: 'Multinomial sampling: token ~ P(token|context). Higher probability tokens more likely but not guaranteed.',
          duration: 150,
          metrics: [
            { label: 'Method', value: 'Multinomial' },
            { label: 'Selected Token', value: 'Renewable' }
          ]
        },
        {
          name: 'Repetition Penalty',
          description: 'Reduce probability of recently generated tokens to prevent loops',
          technicalDetail: 'If token appeared in last 64 tokens: P(token) = P(token) / penalty (typically 1.2). Prevents "the the the..." loops.',
          duration: 150,
          metrics: [
            { label: 'Penalty', value: '1.2' },
            { label: 'Window', value: '64 tokens' }
          ]
        },
        {
          name: 'Stop Condition Check',
          description: 'Check if EOS token generated or max length reached',
          technicalDetail: `Stop if: (1) EOS token sampled, (2) max_tokens reached (2048), (3) user stop sequence detected. Current: token 1/${2048}.`,
          duration: 100,
          metrics: [
            { label: 'Max Tokens', value: '2,048' },
            { label: 'EOS Detected', value: 'No' }
          ]
        },
        {
          name: 'Autoregressive Loop',
          description: 'Feed generated token back as input, repeat entire process for next token',
          technicalDetail: 'Each new token requires full forward pass through all 96 layers. Generate until EOS or max_tokens. This is why generation is slow.',
          duration: 850,
          metrics: [
            { label: 'Tokens/sec', value: '~30' },
            { label: 'Total Compute', value: tokens.length + ' forward passes' }
          ]
        }
      ],
      technicalInfo: {
        title: 'Text Generation Strategies',
        content: [
          'Autoregressive: each token depends on all previous tokens. No parallelization across output sequence.',
          'Greedy decoding: always pick highest probability token. Deterministic but often repetitive.',
          'Beam search: maintain top-k sequences, pick best overall. Better quality but k× slower.',
          'Nucleus (top-p) sampling: dynamic vocabulary size based on probability mass. Best balance.',
          'Temperature: T→0 = deterministic, T=1 = original distribution, T→∞ = uniform random',
          'Typical generation: 20-50 tokens/second on modern GPUs (A100). Slower for longer contexts.',
          'Speculative decoding: draft with small model, verify with large model. 2-3× speedup.'
        ]
      },
      realWorldExample: `Generating 500 tokens at 30 tok/s takes ~17 seconds. Each token requires processing through all 96 layers. With temperature=0.7 and top-p=0.9, output is creative but coherent. Higher temp → more creative/random, lower → more factual/conservative.`
    },
    {
      id: 'output',
      name: 'Detokenization & Post-Processing',
      description: 'Convert token IDs back to text, format output, apply safety filters',
      icon: <Sparkles className="h-5 w-5" />,
      duration: 600,
      details: [
        'Token ID → text string conversion',
        'Special token removal ([EOS], [PAD])',
        'Whitespace reconstruction',
        'Safety filter & content moderation'
      ],
      color: 'from-pink-500 to-pink-600',
      subSteps: [
        {
          name: 'Token ID Decoding',
          description: 'Map each token ID back to its string representation using vocabulary',
          technicalDetail: 'Reverse lookup: token_id → token_string. Hash table O(1). Example: 48493 → "renewable", 2928 → "energy".',
          duration: 150,
          metrics: [
            { label: 'Tokens Decoded', value: '150' },
            { label: 'Lookup Time', value: '<1ms' }
          ]
        },
        {
          name: 'Subword Merging',
          description: 'Concatenate subword tokens back into full words',
          technicalDetail: 'Remove special markers (Ġ for space in GPT, ## for continuation in BERT). ["ren", "ew", "able"] → "renewable".',
          duration: 100,
          metrics: [
            { label: 'Merges', value: '43' },
            { label: 'Words Formed', value: '127' }
          ]
        },
        {
          name: 'Special Token Removal',
          description: 'Strip control tokens that shouldn\'t appear in final output',
          technicalDetail: 'Remove: [CLS], [SEP], [PAD], [EOS], [UNK]. These are model-internal only, not shown to user.',
          duration: 50,
          metrics: [
            { label: 'Removed', value: '4 tokens' },
            { label: 'Type', value: '[EOS], [PAD]' }
          ]
        },
        {
          name: 'Whitespace Reconstruction',
          description: 'Restore proper spacing between words and punctuation',
          technicalDetail: 'BPE encodes spaces as Ġ. Decode: "ĠThe" → " The". Handle punctuation: no space before period/comma.',
          duration: 100,
          metrics: [
            { label: 'Spaces Added', value: '126' },
            { label: 'Format', value: 'Correct' }
          ]
        },
        {
          name: 'Content Moderation',
          description: 'Apply safety filters to detect harmful, toxic, or policy-violating content',
          technicalDetail: 'Run text through moderation classifier (separate lightweight model). Check for: hate speech, violence, sexual content, PII.',
          duration: 150,
          metrics: [
            { label: 'Safety Score', value: '0.98' },
            { label: 'Flags', value: 'None' }
          ]
        },
        {
          name: 'Response Formatting',
          description: 'Apply final formatting: markdown, code blocks, citations, metadata',
          technicalDetail: 'Parse ```code blocks```, **bold**, *italics*. Add metadata: token count, latency, model version, finish reason.',
          duration: 50,
          metrics: [
            { label: 'Format', value: 'Markdown' },
            { label: 'Finish', value: 'stop' }
          ]
        }
      ],
      technicalInfo: {
        title: 'Output Post-Processing Pipeline',
        content: [
          'Detokenization is mostly deterministic but can lose some formatting (extra spaces, etc.)',
          'Content moderation runs on every output to ensure policy compliance',
          'Safety filters check for: hate speech, self-harm, sexual content, violence, PII leakage',
          'Finish reasons: "stop" (EOS), "length" (max tokens), "content_filter" (flagged)',
          'Metadata attached: prompt_tokens, completion_tokens, total_tokens, model, latency',
          'Streaming: send tokens as generated rather than waiting for full completion',
          'Cost calculation: (prompt_tokens × $0.01/1K) + (completion_tokens × $0.03/1K)'
        ]
      },
      realWorldExample: `Final output: "Renewable energy reduces carbon emissions by up to 80% compared to fossil fuels." Safety score: 0.98/1.0 (safe). Total: 142 prompt + 150 completion = 292 tokens. Cost: $0.0014 + $0.0045 = $0.0059. Latency: 2.3s.`
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
    <div className="space-y-6">
      {/* Hero Section */}
      <GlassmorphicTheme variant="hero" className="p-6 rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-purple-600" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                AI Prompt Processing Visualizer
              </h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Deep dive into every microsecond of AI processing. Visualize tokenization, attention mechanisms, neural network layers, and response generation in real-time.
            </p>
          </div>
        </div>
      </GlassmorphicTheme>

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
                  {/* Stage Header */}
                  <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20 p-6 rounded-lg border-2 border-primary/20">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${stages[currentStage]?.color} text-white shadow-lg`}>
                        {stages[currentStage]?.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-2">{stages[currentStage]?.name}</h3>
                        <p className="text-muted-foreground text-lg mb-4">{stages[currentStage]?.description}</p>
                        <div className="grid grid-cols-2 gap-3">
                          {stages[currentStage]?.details.map((detail, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{detail}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Sub-Steps */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <GitBranch className="h-5 w-5" />
                      Step-by-Step Breakdown
                    </h4>
                    <div className="space-y-3">
                      {stages[currentStage]?.subSteps.map((subStep, idx) => (
                        <TooltipProvider key={idx}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Card className="hover:shadow-md transition-shadow cursor-help border-l-4" style={{
                                borderLeftColor: `hsl(var(--primary))`
                              }}>
                                <CardHeader className="pb-3">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <CardTitle className="text-base flex items-center gap-2">
                                        <Badge variant="outline" className="font-mono">{idx + 1}</Badge>
                                        {subStep.name}
                                        <Info className="h-4 w-4 text-muted-foreground" />
                                      </CardTitle>
                                      <CardDescription className="mt-1">{subStep.description}</CardDescription>
                                    </div>
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                      <Timer className="h-3 w-3" />
                                      {subStep.duration}ms
                                    </Badge>
                                  </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                  <div className="bg-muted/50 p-3 rounded-md text-xs font-mono text-muted-foreground">
                                    {subStep.technicalDetail}
                                  </div>
                                  {subStep.metrics && subStep.metrics.length > 0 && (
                                    <div className="grid grid-cols-2 gap-2 mt-3">
                                      {subStep.metrics.map((metric, mIdx) => (
                                        <div key={mIdx} className="flex items-center justify-between bg-background/50 p-2 rounded">
                                          <span className="text-xs text-muted-foreground">{metric.label}:</span>
                                          <span className="text-xs font-semibold">{metric.value}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-sm">
                              <p className="text-xs">{subStep.technicalDetail}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  </div>

                  {/* Technical Deep Dive */}
                  <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Binary className="h-5 w-5" />
                        {stages[currentStage]?.technicalInfo.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {stages[currentStage]?.technicalInfo.content.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Real-World Example */}
                  <Card className="border-2 border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
                        <Sparkles className="h-5 w-5" />
                        Real-World Example
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-amber-900/80 dark:text-amber-100/80 leading-relaxed">
                        {stages[currentStage]?.realWorldExample}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="text-center">
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center gap-2">
                          <Hash className="h-8 w-8 text-blue-600" />
                          <div className="text-3xl font-bold text-blue-600">{tokens.length}</div>
                          <div className="text-sm text-muted-foreground">Tokens Generated</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="text-center">
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center gap-2">
                          <Gauge className="h-8 w-8 text-green-600" />
                          <div className="text-3xl font-bold text-green-600">{Math.round(progress)}%</div>
                          <div className="text-sm text-muted-foreground">Stage Progress</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="text-center">
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center gap-2">
                          <Activity className="h-8 w-8 text-purple-600" />
                          <div className="text-3xl font-bold text-purple-600">{currentStage + 1}/8</div>
                          <div className="text-sm text-muted-foreground">Pipeline Stage</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="text-center">
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center gap-2">
                          <Timer className="h-8 w-8 text-amber-600" />
                          <div className="text-3xl font-bold text-amber-600">
                            {(stages.slice(0, currentStage + 1).reduce((sum, s) => sum + s.duration, 0) / 1000).toFixed(1)}s
                          </div>
                          <div className="text-sm text-muted-foreground">Elapsed Time</div>
                        </div>
                      </CardContent>
                    </Card>
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