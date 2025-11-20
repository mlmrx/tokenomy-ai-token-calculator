-- Create project_submissions table
CREATE TABLE public.project_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  code_content TEXT NOT NULL,
  demo_url TEXT,
  github_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'needs_improvement')),
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create peer_reviews table
CREATE TABLE public.peer_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.project_submissions(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT NOT NULL,
  helpful_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create coding_exercises table
CREATE TABLE public.coding_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  starter_code TEXT NOT NULL,
  solution_code TEXT,
  test_cases JSONB NOT NULL DEFAULT '[]'::jsonb,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_code_attempts table
CREATE TABLE public.user_code_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  exercise_id UUID NOT NULL REFERENCES public.coding_exercises(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  passed BOOLEAN NOT NULL DEFAULT false,
  tests_passed INTEGER NOT NULL DEFAULT 0,
  total_tests INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coding_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_code_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_submissions
CREATE POLICY "Users can view all submissions"
  ON public.project_submissions FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own submissions"
  ON public.project_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own submissions"
  ON public.project_submissions FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for peer_reviews
CREATE POLICY "Users can view all reviews"
  ON public.peer_reviews FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON public.peer_reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update their own reviews"
  ON public.peer_reviews FOR UPDATE
  USING (auth.uid() = reviewer_id);

-- RLS Policies for coding_exercises
CREATE POLICY "Everyone can view coding exercises"
  ON public.coding_exercises FOR SELECT
  USING (true);

-- RLS Policies for user_code_attempts
CREATE POLICY "Users can view their own attempts"
  ON public.user_code_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own attempts"
  ON public.user_code_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_project_submissions_user_id ON public.project_submissions(user_id);
CREATE INDEX idx_project_submissions_module_id ON public.project_submissions(module_id);
CREATE INDEX idx_peer_reviews_submission_id ON public.peer_reviews(submission_id);
CREATE INDEX idx_peer_reviews_reviewer_id ON public.peer_reviews(reviewer_id);
CREATE INDEX idx_coding_exercises_module_id ON public.coding_exercises(module_id);
CREATE INDEX idx_user_code_attempts_user_id ON public.user_code_attempts(user_id);
CREATE INDEX idx_user_code_attempts_exercise_id ON public.user_code_attempts(exercise_id);

-- Create triggers for updated_at
CREATE TRIGGER update_project_submissions_updated_at
  BEFORE UPDATE ON public.project_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_peer_reviews_updated_at
  BEFORE UPDATE ON public.peer_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();