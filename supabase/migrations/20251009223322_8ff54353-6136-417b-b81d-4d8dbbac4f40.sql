-- Insert sample community posts with quality content
INSERT INTO community_posts (id, user_id, category_id, title, content, slug, post_type, status, view_count, comment_count, upvote_count, downvote_count, vote_score, tags, created_at)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM auth.users LIMIT 1),
  c.id,
  post.title,
  post.content,
  post.slug,
  'discussion',
  'published',
  post.views,
  post.comments,
  post.upvotes,
  post.downvotes,
  post.upvotes - post.downvotes,
  post.tags,
  NOW() - (post.days_ago || ' days')::interval
FROM community_categories c
CROSS JOIN LATERAL (
  VALUES
    ('ai-models', 'GPT-4 vs Claude 3.5 Sonnet: Real-world Token Efficiency Comparison', 'gpt-4-vs-claude-comparison',
     'After running 10,000 production queries through both models here are my findings. Key Metrics: GPT-4 Avg 2847 tokens per response at $0.0284 per query. Claude 3.5 Avg 2103 tokens per response at $0.0189 per query. Quality Assessment: Claude 3.5 produced more concise responses 26% fewer tokens while maintaining quality. For our use case customer support accuracy was comparable at 94% vs 95%. Cost Savings: Switching saved us $1850 per month on our $6200 AI budget a 30% reduction. Recommendation: For cost sensitive applications where slight verbosity is not critical Claude 3.5 is the clear winner.', 
     243, 18, 42, 3, ARRAY['comparison', 'cost-optimization', 'gpt-4', 'claude'], 5),
    
    ('ai-models', 'Gemini 2.5 Flash: Hidden Gem for High-Volume Applications?', 'gemini-flash-hidden-gem',
     'Been testing Google Gemini 2.5 Flash for our chatbot 500K plus queries per month and the results are impressive. Performance: 40% faster response time vs GPT-3.5. 480 trillion tokens per month capacity means zero rate limiting. $1.25 input and $5 output per million tokens. Real Numbers: Our monthly cost dropped from $12400 GPT-3.5 to $4100 Gemini Flash that is 67% savings. Caveats: Slightly less creative for marketing copy. Documentation could be better. Regional availability still limited. Who else is using Gemini at scale? Would love to compare notes!',
     156, 12, 28, 2, ARRAY['gemini', 'cost-reduction', 'high-volume'], 3),
    
    ('token-calculator', 'How I Reduced Token Count by 40% Without Losing Quality', 'reduce-token-count-40-percent',
     'Sharing my proven techniques for token optimization. 1. Prompt Compression 15% reduction. Before Please analyze the following customer feedback and provide a detailed summary. After Analyze and summarize this feedback. 2. Context Pruning 20% reduction. Only include relevant context. I built a semantic filter that scores relevance anything below 0.7 similarity gets cut. 3. Response Formatting 5% reduction. Request JSON over verbose text when possible. Results: Token count 4200 to 2520 per request. Cost savings $3400 per month. Quality score 4.2 out of 5 to 4.1 out of 5 minimal impact. Happy to share my code if there is interest!',
     389, 24, 67, 1, ARRAY['optimization', 'tutorial', 'cost-savings'], 2),
    
    ('token-calculator', 'Token Estimation Calculator: I Built This Tool Need Feedback', 'token-estimation-tool-feedback',
     'Hey community! I created a pre-flight token estimator to avoid surprise bills. Features: Estimates tokens before API call. Multi model support GPT-4 Claude Llama. Historical accuracy tracking. Cost projections. Accuracy: Currently hitting 92% accuracy plus or minus 8% variance across 5000 test queries. Open Questions: Should I add streaming support? Best way to handle context window limits? Interest in open sourcing? Looking for beta testers!',
     178, 31, 45, 0, ARRAY['tools', 'beta', 'token-estimation'], 7),
    
    ('general', 'Our Team Cut AI Costs by $15K/Month - Complete Strategy', 'cut-ai-costs-15k-strategy',
     'After 6 months of optimization we reduced our monthly AI spend from $28K to $13K. Everything we did. Phase 1 Audit Month 1: Discovered 30% of queries were duplicates. Implemented aggressive caching $4K savings. Phase 2 Model Selection Month 2-3: Switched non critical paths to cheaper models. GPT-4 only for complex reasoning $5K savings. Phase 3 Prompt Engineering Month 4-5: Reduced avg tokens from 3200 to 1900. Better few shot examples $4K savings. Phase 4 Infrastructure Month 6: Load balancing across providers. Fallback strategies $2K savings. Tools we used: Tokenomy for forecasting. Custom monitoring dashboard. Automated A/B testing. AMA about implementation!',
     521, 47, 89, 4, ARRAY['case-study', 'cost-optimization', 'strategy'], 4),
    
    ('memory-management', 'Understanding Context Window Limits: A Practical Guide', 'context-window-limits-guide',
     'Context windows are one of the most misunderstood aspects of LLMs. Let me break it down. What is it? The maximum tokens input plus output a model can handle in one request. Common Limits: GPT-4 8K 32K 128K variants. Claude 3.5 200K tokens. Gemini 1M plus tokens. Real world Example: We hit limits when summarizing legal docs avg 45K tokens. Solution: Chunking with overlap 5K chunks 500 token overlap. Hierarchical summarization. Final consolidation pass. Cost Impact: Processing a 45K token doc Direct if possible $0.45. Chunked approach $0.67. Trade off 48% higher cost but more reliable results. Pro tip Use token estimation before processing to avoid failures!',
     287, 19, 52, 2, ARRAY['memory', 'context-window', 'tutorial'], 6),
    
    ('speed-optimization', 'Parallel Processing: How We Cut Response Time from 8s to 1.2s', 'parallel-processing-speed-optimization',
     'Our API was too slow 8-12 seconds per request. How we fixed it. Problem: Sequential processing of multiple LLM calls totaling 10 seconds. Solution: Parallel execution where possible reduced it to 5 seconds 50% faster. Further optimization: Streaming for generation step. Response sent as tokens arrive. Perceived latency 1.2 seconds to first token. Tech Stack: Node.js worker threads. Promise.all for parallel calls. SSE for streaming. Code snippets available if helpful!',
     334, 28, 71, 1, ARRAY['performance', 'latency', 'parallel-processing'], 8),
    
    ('help-support', 'Getting Rate Limit Exceeded - How to Handle?', 'rate-limit-exceeded-help',
     'I am building a customer service bot and constantly hitting rate limits during peak hours 9am-5pm EST. Current setup: OpenAI GPT-4. About 200 requests per minute during peak. Tier 2 account. What I have tried: Exponential backoff helps but delays responses. Request queuing users wait 30 plus seconds. Questions: Should I upgrade to Tier 3? Better to distribute across multiple API keys? Alternative providers with higher limits? This is costing us customer satisfaction. Any advice appreciated!',
     145, 15, 23, 0, ARRAY['help', 'rate-limits', 'openai'], 1),
    
    ('help-support', 'Token Counter Giving Wrong Numbers - Bug or User Error?', 'token-counter-wrong-numbers',
     'Using the token calculator tool but getting inconsistent results. Example: Text Analyze customer sentiment. Calculator 4 tokens. Actual from API 6 tokens. Impact: Our budget forecasts are off by 20-30%. Details: Model GPT-4. Using tiktoken library. Tried both cl100k base and p50k base encodings. Question: Am I doing something wrong? Is there a better way to estimate tokens pre call? This is critical for our cost controls. Thanks in advance!',
     98, 11, 18, 1, ARRAY['help', 'tokens', 'bug-report'], 2),
    
    ('developer-tools', 'Open Source LLM Observability Stack I Built', 'open-source-llm-observability',
     'Built a complete observability solution for LLM applications. Now open source! Features: Token usage tracking. Cost analytics per endpoint. Latency monitoring. Error rate tracking. Prompt versioning. A/B test dashboard. Tech Stack: TypeScript and Node.js. PostgreSQL Supabase. Grafana for viz. OpenTelemetry integration. Why I built it: Existing solutions were too expensive at scale $500 plus per month. This costs about $20 per month on Supabase. Metrics we track: 2M plus requests per month. Sub 100ms overhead. Saved $8K by identifying wasteful prompts. Looking for contributors!',
     412, 36, 94, 2, ARRAY['open-source', 'observability', 'tools'], 9),
    
    ('energy-efficiency', 'Carbon Footprint of AI: Our Company Analysis', 'carbon-footprint-ai-analysis',
     'We calculated the environmental impact of our AI usage. Results were eye opening. Annual Stats: 50M tokens processed. Est 2400 kWh consumed. About 1200 kg CO2 equivalent. Same as driving 3000 miles. Model Efficiency: Most efficient per 1M tokens: Llama 3 40 kWh. Claude 3.5 48 kWh. GPT-4 65 kWh. What we changed: Switched 60% of traffic to Llama 3. Reduced carbon footprint by 35%. Bonus Saved $4K per month. Offsetting: Partnering with Stripe Climate to offset remaining emissions. Anyone else tracking their AI carbon footprint?',
     265, 22, 58, 5, ARRAY['sustainability', 'energy', 'environment'], 10),
    
    ('showcase', 'Built an AI Legal Assistant - $50K ARR in 3 Months', 'ai-legal-assistant-50k-arr',
     'Sharing my journey building an AI powered legal research tool. The Product: Natural language legal research. Summarizes case law in seconds. Cites sources automatically. Tech Stack: Claude 3.5 for analysis. GPT-4 for final output. Custom RAG pipeline. 500K plus legal docs indexed. Token Economics: Avg query 15K tokens. Cost $0.21 per search. Price $2.50 per search. Margin 92%. Growth: Month 1 50 users $2K MRR. Month 2 180 users $8K MRR. Month 3 420 users $18K MRR. Key Lessons: Lawyers will pay for time savings. Accuracy greater than speed in this market. Token optimization matters. Happy to answer questions!',
     448, 53, 102, 1, ARRAY['showcase', 'startup', 'success-story'], 11)
) AS post(category_slug, title, slug, content, views, comments, upvotes, downvotes, tags, days_ago)
WHERE c.slug = post.category_slug;

-- Insert sample comments
INSERT INTO community_comments (id, post_id, user_id, content, vote_score, upvote_count, created_at)
SELECT 
  gen_random_uuid(),
  p.id,
  (SELECT id FROM auth.users LIMIT 1),
  comment.content,
  comment.upvotes - comment.downvotes,
  comment.upvotes,
  NOW() - (comment.hours_ago || ' hours')::interval
FROM community_posts p
CROSS JOIN LATERAL (
  VALUES
    ('This is incredibly helpful! I was just about to run a similar comparison. Did you notice any difference in hallucination rates?', 8, 0, 12),
    ('Great analysis. Claude 3.5 also handles code generation better in my experience. Have you tested that?', 12, 0, 8),
    ('The cost savings are significant. Currently on GPT-4 and this might convince me to switch.', 5, 0, 6),
    ('Thanks for sharing! What was your evaluation methodology for the accuracy comparison?', 15, 1, 4),
    ('Implementing this tomorrow! Did you see any performance difference in multi-turn conversations?', 6, 0, 10)
) AS comment(content, upvotes, downvotes, hours_ago)
LIMIT 50;

-- Update category post counts
UPDATE community_categories c
SET post_count = (
  SELECT COUNT(*) 
  FROM community_posts p 
  WHERE p.category_id = c.id AND p.status = 'published'
);