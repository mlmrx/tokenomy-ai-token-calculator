-- Fix security warnings by setting proper search_path on functions

ALTER FUNCTION update_post_comment_count() SET search_path = public;
ALTER FUNCTION update_category_post_count() SET search_path = public;  
ALTER FUNCTION update_vote_counts() SET search_path = public;
ALTER FUNCTION refresh_leaderboard_aggregates() SET search_path = public;
ALTER FUNCTION has_role(uuid, user_role) SET search_path = public;
ALTER FUNCTION generate_api_key() SET search_path = public;
ALTER FUNCTION handle_new_user() SET search_path = public;
ALTER FUNCTION audit_configuration_changes() SET search_path = public;