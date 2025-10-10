// Prompt library templates and optimizations
export interface PromptTemplate {
  id: string;
  category: string;
  title: string;
  description: string;
  template: string;
  variables: string[];
  avgInputTokens: number;
  avgOutputTokens: number;
  estimatedCost: number; // per request at GPT-4 pricing
  tags: string[];
  optimizationTips: string[];
  useCase: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

export const promptTemplates: PromptTemplate[] = [
  {
    id: "customer-support",
    category: "Customer Support",
    title: "Customer Query Response",
    description: "Professional customer support response template",
    template: `You are a helpful customer support agent for {company_name}. 
A customer has asked: "{customer_query}"

Respond professionally and helpfully. Include:
1. Acknowledgment of their concern
2. Clear solution or next steps
3. Offer additional assistance

Tone: {tone}`,
    variables: ["company_name", "customer_query", "tone"],
    avgInputTokens: 120,
    avgOutputTokens: 200,
    estimatedCost: 0.005,
    tags: ["support", "customer service", "professional"],
    optimizationTips: [
      "Keep tone instruction minimal",
      "Use structured output for consistency",
      "Consider caching company policies in context"
    ],
    useCase: "Automated customer support responses",
    difficulty: "Beginner"
  },
  {
    id: "code-review",
    category: "Development",
    title: "Code Review Assistant",
    description: "Comprehensive code review with best practices",
    template: `Review this {language} code for:
- Bugs and potential errors
- Performance issues
- Security vulnerabilities
- Best practices adherence

Code:
\`\`\`{language}
{code}
\`\`\`

Provide:
1. Summary (2-3 lines)
2. Critical issues
3. Suggestions for improvement`,
    variables: ["language", "code"],
    avgInputTokens: 800,
    avgOutputTokens: 400,
    estimatedCost: 0.02,
    tags: ["coding", "review", "development"],
    optimizationTips: [
      "Limit code chunk size to reduce tokens",
      "Use specific review criteria to focus output",
      "Consider cheaper models for initial screening"
    ],
    useCase: "Automated code review in CI/CD",
    difficulty: "Intermediate"
  },
  {
    id: "content-summarization",
    category: "Content",
    title: "Document Summarizer",
    description: "Concise document summarization with key points",
    template: `Summarize this document in {length} words or less.

Focus on:
- Main points and conclusions
- Key data and statistics
- Actionable insights

Document:
{document_text}

Output format: {format}`,
    variables: ["length", "document_text", "format"],
    avgInputTokens: 2000,
    avgOutputTokens: 300,
    estimatedCost: 0.025,
    tags: ["summarization", "content", "analysis"],
    optimizationTips: [
      "Specify exact word count to control output length",
      "Use structured format (bullet points) for shorter responses",
      "Batch multiple documents for efficiency"
    ],
    useCase: "Document processing and analysis",
    difficulty: "Beginner"
  },
  {
    id: "data-extraction",
    category: "Data Processing",
    title: "Structured Data Extractor",
    description: "Extract structured data from unstructured text",
    template: `Extract the following information from the text and return as JSON:

Required fields: {fields}

Text:
{text}

Return only valid JSON with no additional explanation.`,
    variables: ["fields", "text"],
    avgInputTokens: 500,
    avgOutputTokens: 150,
    estimatedCost: 0.01,
    tags: ["extraction", "data", "json"],
    optimizationTips: [
      "Use JSON mode if available to ensure valid output",
      "Specify exact schema to reduce parsing errors",
      "Consider function calling for structured extraction"
    ],
    useCase: "Data extraction from documents and emails",
    difficulty: "Intermediate"
  },
  {
    id: "sentiment-analysis",
    category: "Analysis",
    title: "Sentiment Analyzer",
    description: "Analyze sentiment with confidence scores",
    template: `Analyze the sentiment of this text:
"{text}"

Provide:
1. Overall sentiment (positive/negative/neutral)
2. Confidence score (0-100%)
3. Key emotional indicators
4. Brief reasoning

Be concise and factual.`,
    variables: ["text"],
    avgInputTokens: 150,
    avgOutputTokens: 100,
    estimatedCost: 0.003,
    tags: ["sentiment", "analysis", "classification"],
    optimizationTips: [
      "Use smaller models (GPT-3.5, Claude Haiku) for cost savings",
      "Batch multiple texts in one request",
      "Consider fine-tuned model for specific domain"
    ],
    useCase: "Social media monitoring and feedback analysis",
    difficulty: "Beginner"
  },
  {
    id: "content-generation",
    category: "Content",
    title: "Marketing Copy Generator",
    description: "Generate compelling marketing copy",
    template: `Create {content_type} for:
Product: {product_name}
Target audience: {audience}
Tone: {tone}
Key benefits: {benefits}

Requirements:
- Length: {length} words
- Include call-to-action
- Highlight unique value proposition

Format: {format}`,
    variables: ["content_type", "product_name", "audience", "tone", "benefits", "length", "format"],
    avgInputTokens: 200,
    avgOutputTokens: 400,
    estimatedCost: 0.008,
    tags: ["marketing", "content", "copywriting"],
    optimizationTips: [
      "Provide clear constraints to avoid over-generation",
      "Use examples for consistent style",
      "Cache brand voice guidelines"
    ],
    useCase: "Automated marketing content creation",
    difficulty: "Intermediate"
  },
  {
    id: "translation",
    category: "Language",
    title: "Context-Aware Translator",
    description: "Professional translation with context preservation",
    template: `Translate the following from {source_lang} to {target_lang}.

Maintain:
- Professional tone
- Technical terminology accuracy
- Cultural context appropriateness

Text:
{text}

Additional context: {context}

Provide only the translation, no explanations.`,
    variables: ["source_lang", "target_lang", "text", "context"],
    avgInputTokens: 300,
    avgOutputTokens: 350,
    estimatedCost: 0.01,
    tags: ["translation", "language", "localization"],
    optimizationTips: [
      "Batch similar content for consistency",
      "Use glossary for technical terms",
      "Consider specialized translation models"
    ],
    useCase: "Content localization and international support",
    difficulty: "Beginner"
  },
  {
    id: "rag-query",
    category: "Retrieval",
    title: "RAG-Optimized Query",
    description: "Query with retrieved context for accurate answers",
    template: `Answer this question using ONLY the provided context. If the context doesn't contain the answer, say "I don't have enough information."

Question: {question}

Context:
{retrieved_context}

Instructions:
- Cite specific parts of context
- Be precise and factual
- Acknowledge limitations

Answer format: {format}`,
    variables: ["question", "retrieved_context", "format"],
    avgInputTokens: 1500,
    avgOutputTokens: 250,
    estimatedCost: 0.02,
    tags: ["rag", "retrieval", "qa"],
    optimizationTips: [
      "Optimize retrieval to reduce context size",
      "Use reranking before sending to LLM",
      "Consider smaller models for simple queries"
    ],
    useCase: "Knowledge base Q&A systems",
    difficulty: "Advanced"
  },
  {
    id: "classification",
    category: "Classification",
    title: "Multi-Class Classifier",
    description: "Classify content into predefined categories",
    template: `Classify this text into ONE of these categories:
{categories}

Text: "{text}"

Rules:
- Return ONLY the category name
- If unclear, return "Uncategorized"
- No additional explanation

Category:`,
    variables: ["categories", "text"],
    avgInputTokens: 120,
    avgOutputTokens: 10,
    estimatedCost: 0.002,
    tags: ["classification", "categorization"],
    optimizationTips: [
      "Use cheapest models - this is simple task",
      "Batch hundreds of items per request",
      "Consider fine-tuning for domain-specific classification"
    ],
    useCase: "Content categorization and routing",
    difficulty: "Beginner"
  },
  {
    id: "creative-writing",
    category: "Creative",
    title: "Story Generator",
    description: "Generate creative narrative content",
    template: `Write a {genre} story with these elements:
- Setting: {setting}
- Characters: {characters}
- Theme: {theme}
- Length: {length} words

Style: {style}
Tone: {tone}

Requirements:
- Engaging opening
- Clear character development
- Satisfying conclusion`,
    variables: ["genre", "setting", "characters", "theme", "length", "style", "tone"],
    avgInputTokens: 180,
    avgOutputTokens: 800,
    estimatedCost: 0.028,
    tags: ["creative", "writing", "storytelling"],
    optimizationTips: [
      "Use high-quality models for creative tasks",
      "Provide examples for consistent style",
      "Consider streaming for better UX"
    ],
    useCase: "Content creation and creative automation",
    difficulty: "Advanced"
  }
];

export const promptCategories = [
  "All Categories",
  "Customer Support",
  "Development",
  "Content",
  "Data Processing",
  "Analysis",
  "Language",
  "Retrieval",
  "Classification",
  "Creative"
];

export const optimizationStrategies = [
  {
    title: "Token Reduction",
    description: "Reduce input/output tokens by 30-50%",
    techniques: [
      "Remove unnecessary context and examples",
      "Use abbreviations consistently",
      "Specify exact output format and length",
      "Remove redundant instructions"
    ]
  },
  {
    title: "Model Selection",
    description: "Choose the right model for each task",
    techniques: [
      "Use GPT-3.5/Claude Haiku for simple tasks",
      "Reserve GPT-4/Opus for complex reasoning",
      "Test multiple models to find sweet spot",
      "Consider task-specific fine-tuned models"
    ]
  },
  {
    title: "Batch Processing",
    description: "Process multiple items efficiently",
    techniques: [
      "Combine multiple items in single request",
      "Use structured output formats (JSON arrays)",
      "Implement smart batching logic",
      "Balance batch size vs latency needs"
    ]
  },
  {
    title: "Caching & Reuse",
    description: "Cache expensive computations",
    techniques: [
      "Cache system prompts and context",
      "Reuse embeddings for RAG",
      "Store common responses",
      "Implement semantic deduplication"
    ]
  }
];
