-- Get the first module ID from each learning path
DO $$ 
DECLARE
  prompt_module_id UUID;
  python_module_id UUID;
  agents_module_id UUID;
BEGIN
  -- Get module IDs for exercises
  SELECT id INTO prompt_module_id FROM modules WHERE learning_path_id IN (SELECT id FROM learning_paths WHERE title LIKE '%Prompt%') ORDER BY order_index LIMIT 1;
  SELECT id INTO python_module_id FROM modules WHERE learning_path_id IN (SELECT id FROM learning_paths WHERE title LIKE '%Python%') ORDER BY order_index LIMIT 1;
  SELECT id INTO agents_module_id FROM modules WHERE learning_path_id IN (SELECT id FROM learning_paths WHERE title LIKE '%Agents%') ORDER BY order_index LIMIT 1;

  -- Insert sample coding exercises
  IF prompt_module_id IS NOT NULL THEN
    INSERT INTO coding_exercises (module_id, title, description, starter_code, solution_code, difficulty, test_cases) VALUES
    (prompt_module_id, 'Build a Simple AI Function', 
     'Create a function that formats a prompt for an AI model', 
     'function formatPrompt(userInput) {\n  // Your code here\n  return ;\n}',
     'function formatPrompt(userInput) {\n  return `You are a helpful assistant. User question: ${userInput}`;\n}',
     'beginner',
     '[
       {"input": "\"What is AI?\"", "expected": "\"You are a helpful assistant. User question: What is AI?\"", "description": "Format basic question"},
       {"input": "\"Tell me about machine learning\"", "expected": "\"You are a helpful assistant. User question: Tell me about machine learning\"", "description": "Format longer question"}
     ]'::jsonb);
  END IF;

  IF python_module_id IS NOT NULL THEN
    INSERT INTO coding_exercises (module_id, title, description, starter_code, solution_code, difficulty, test_cases) VALUES
    (python_module_id, 'Calculate Token Count', 
     'Create a function that estimates token count by splitting on whitespace', 
     'function estimateTokens(text) {\n  // Your code here\n  return 0;\n}',
     'function estimateTokens(text) {\n  return text.trim().split(/\\s+/).length;\n}',
     'beginner',
     '[
       {"input": "\"Hello world\"", "expected": "2", "description": "Count simple phrase"},
       {"input": "\"The quick brown fox jumps\"", "expected": "5", "description": "Count multiple words"}
     ]'::jsonb);
  END IF;

  IF agents_module_id IS NOT NULL THEN
    INSERT INTO coding_exercises (module_id, title, description, starter_code, solution_code, difficulty, test_cases) VALUES
    (agents_module_id, 'Parse Agent Response', 
     'Create a function that extracts JSON data from an agent response', 
     'function parseAgentResponse(response) {\n  // Your code here\n  return {};\n}',
     'function parseAgentResponse(response) {\n  const match = response.match(/\\{[^}]+\\}/);\n  return match ? JSON.parse(match[0]) : {};\n}',
     'intermediate',
     '[
       {"input": "\"Here is the data: {\\\"status\\\": \\\"success\\\"}\"", "expected": "{\\\"status\\\": \\\"success\\\"}", "description": "Extract JSON from text"},
       {"input": "\"Result: {\\\"count\\\": 42}\"", "expected": "{\\\"count\\\": 42}", "description": "Extract different JSON"}
     ]'::jsonb);
  END IF;
END $$;