-- Insert initial learning paths with content
INSERT INTO public.learning_paths (id, title, description, level, role, duration, color_gradient, icon_name) VALUES
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'AI Fundamentals', 'Build a strong foundation in generative AI concepts, models, and applications', 'beginner', 'all', '4 weeks', 'from-blue-500 to-cyan-500', 'Brain'),
('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'Designing & Customizing AI Agents at Scale', 'Master the art of building, deploying, and managing AI agents in production', 'advanced', 'technical', '6 weeks', 'from-purple-500 to-pink-500', 'Code'),
('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'Managing AI Workloads', 'Advanced expertise in optimizing, monitoring, and managing AI infrastructure', 'advanced', 'technical', '5 weeks', 'from-orange-500 to-red-500', 'Zap'),
('d4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', 'AI for Creativity & Productivity', 'Unleash your creativity and boost productivity with generative AI tools', 'beginner', 'business', '3 weeks', 'from-green-500 to-emerald-500', 'Sparkles'),
('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', 'AI Strategy for Business Leaders', 'Develop organizational AI strategies and drive business transformation', 'intermediate', 'business', '4 weeks', 'from-indigo-500 to-blue-500', 'TrendingUp'),
('f6a7b8c9-d0e1-4f5a-3b4c-5d6e7f8a9b0c', 'Advanced Prompt Engineering', 'Master advanced techniques for controlling and optimizing AI model outputs', 'intermediate', 'technical', '4 weeks', 'from-violet-500 to-purple-500', 'Target');

-- Insert modules for AI Fundamentals path
INSERT INTO public.modules (learning_path_id, title, description, type, duration, order_index, content) VALUES
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Introduction to Generative AI', 'Understand what generative AI is and how it differs from traditional AI', 'video', '45 min', 1, '{"video_url": "https://www.youtube.com/watch?v=zizonToFXDs", "transcript": "Introduction to the fundamentals of generative AI...", "key_takeaways": ["Definition of generative AI", "Differences from traditional ML", "Real-world applications"]}'),
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Large Language Models Explained', 'Deep dive into LLMs, transformers, and how they work', 'article', '30 min', 2, '{"article_content": "## Understanding Large Language Models\n\nLarge Language Models (LLMs) are...", "resources": ["Attention is All You Need paper", "GPT architecture guide"]}'),
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Prompt Engineering Basics', 'Learn how to craft effective prompts for AI models', 'hands-on', '1 hour', 3, '{"exercises": [{"title": "Writing Your First Prompt", "description": "Practice basic prompt structure", "sample_prompts": ["Write a professional email about...", "Create a summary of..."]}]}'),
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Knowledge Check', 'Test your understanding of AI fundamentals', 'quiz', '15 min', 4, '{"questions": [{"question": "What is the primary difference between generative AI and traditional ML?", "options": ["Generative AI creates new content", "Traditional ML is faster", "Generative AI requires less data", "No difference"], "correct": 0}]}');

-- Insert modules for Agent Design path
INSERT INTO public.modules (learning_path_id, title, description, type, duration, order_index, content) VALUES
('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'Agent Architecture Patterns', 'Learn common patterns for building reliable AI agents', 'video', '1 hour', 1, '{"video_url": "https://www.youtube.com/watch?v=example", "topics": ["ReACT pattern", "Chain-of-Thought", "Tool use architectures"]}'),
('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'Multi-Agent Systems', 'Design systems where multiple agents collaborate', 'article', '45 min', 2, '{"article_content": "## Building Multi-Agent Systems\n\nWhen multiple AI agents need to work together..."}'),
('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'Building Your First Agent', 'Hands-on lab to create a functional AI agent', 'hands-on', '2 hours', 3, '{"lab_instructions": "In this lab, you will build a customer service agent...", "starter_code": "import openai..."}'),
('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'Scaling Agent Deployments', 'Best practices for deploying agents at enterprise scale', 'video', '1 hour', 4, '{"video_url": "https://www.youtube.com/watch?v=example2", "topics": ["Load balancing", "Monitoring", "Cost optimization"]}');

-- Insert modules for AI Workloads path
INSERT INTO public.modules (learning_path_id, title, description, type, duration, order_index, content) VALUES
('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'AI Infrastructure Optimization', 'Optimize GPU usage and reduce costs in AI workloads', 'video', '50 min', 1, '{"video_url": "https://www.youtube.com/watch?v=example3"}'),
('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'Token Usage & Cost Management', 'Monitor and control AI API costs effectively', 'hands-on', '1.5 hours', 2, '{"exercises": [{"title": "Set up cost monitoring", "tools": ["Tokenomy Dashboard", "CloudWatch"]}]}'),
('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'Performance Monitoring', 'Set up comprehensive monitoring for AI systems', 'article', '40 min', 3, '{"article_content": "## Monitoring AI Performance\n\nKey metrics to track..."}'),
('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'Scaling Best Practices', 'Handle high-volume AI workloads efficiently', 'video', '1 hour', 4, '{"video_url": "https://www.youtube.com/watch?v=example4"}');

-- Insert modules for Creativity path
INSERT INTO public.modules (learning_path_id, title, description, type, duration, order_index, content) VALUES
('d4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', 'AI-Powered Content Creation', 'Create compelling content with AI assistance', 'video', '35 min', 1, '{"video_url": "https://www.youtube.com/watch?v=example5"}'),
('d4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', 'Automating Workflows with AI', 'Streamline repetitive tasks using AI tools', 'hands-on', '1 hour', 2, '{"exercises": [{"title": "Automate email responses", "description": "Build an AI email assistant"}]}'),
('d4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', 'Creative Use Cases', 'Explore innovative applications of generative AI', 'article', '25 min', 3, '{"examples": ["AI for design", "Music generation", "Video creation"]}'),
('d4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', 'Best Practices & Ethics', 'Responsible AI use in creative work', 'video', '30 min', 4, '{"topics": ["Attribution", "Copyright", "Ethical considerations"]}');

-- Insert modules for Business Strategy path
INSERT INTO public.modules (learning_path_id, title, description, type, duration, order_index, content) VALUES
('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', 'AI Business Value Assessment', 'Identify high-impact AI opportunities in your organization', 'video', '45 min', 1, '{"framework": "AI opportunity canvas"}'),
('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', 'Building an AI Roadmap', 'Create a strategic plan for AI adoption', 'article', '50 min', 2, '{"template": "6-month AI transformation roadmap"}'),
('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', 'ROI Calculation for AI Projects', 'Measure and communicate AI business impact', 'hands-on', '1 hour', 3, '{"calculator": "AI ROI calculator template"}'),
('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', 'Change Management for AI', 'Lead successful AI transformation initiatives', 'video', '40 min', 4, '{"case_studies": ["Fortune 500 AI adoption", "Startup AI scaling"]}');

-- Insert modules for Prompt Engineering path
INSERT INTO public.modules (learning_path_id, title, description, type, duration, order_index, content) VALUES
('f6a7b8c9-d0e1-4f5a-3b4c-5d6e7f8a9b0c', 'Prompt Design Patterns', 'Learn proven patterns for effective prompts', 'article', '40 min', 1, '{"patterns": ["Zero-shot", "Few-shot", "Chain-of-thought"]}'),
('f6a7b8c9-d0e1-4f5a-3b4c-5d6e7f8a9b0c', 'Chain-of-Thought Prompting', 'Guide AI through complex reasoning tasks', 'hands-on', '1.5 hours', 2, '{"examples": ["Math problem solving", "Code debugging", "Analysis tasks"]}'),
('f6a7b8c9-d0e1-4f5a-3b4c-5d6e7f8a9b0c', 'Few-Shot Learning Techniques', 'Optimize model performance with examples', 'video', '45 min', 3, '{"demonstrations": "Live few-shot optimization"}'),
('f6a7b8c9-d0e1-4f5a-3b4c-5d6e7f8a9b0c', 'Prompt Optimization Lab', 'Practice optimizing prompts for different use cases', 'hands-on', '2 hours', 4, '{"challenges": ["Optimize for accuracy", "Reduce token usage", "Improve consistency"]}');