-- Add foreign key references to profiles table for project_submissions
ALTER TABLE public.project_submissions
ADD CONSTRAINT project_submissions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key references to profiles table for peer_reviews
ALTER TABLE public.peer_reviews
ADD CONSTRAINT peer_reviews_reviewer_id_fkey 
FOREIGN KEY (reviewer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key references to profiles table for user_code_attempts
ALTER TABLE public.user_code_attempts
ADD CONSTRAINT user_code_attempts_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;