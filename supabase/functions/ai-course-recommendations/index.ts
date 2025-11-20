import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user's enrollments and progress
    const { data: enrollments } = await supabase
      .from('user_enrollments')
      .select(`
        *,
        learning_paths(*)
      `)
      .eq('user_id', user_id);

    // Get all available courses
    const { data: allCourses } = await supabase
      .from('learning_paths')
      .select('*');

    // Get user's completed modules
    const { data: moduleProgress } = await supabase
      .from('module_progress')
      .select('*')
      .eq('user_id', user_id)
      .eq('completed', true);

    // Prepare context for AI
    const enrolledCourseIds = enrollments?.map(e => e.learning_path_id) || [];
    const availableCourses = allCourses?.filter(c => !enrolledCourseIds.includes(c.id)) || [];
    const completedCount = enrollments?.filter(e => e.completed_at).length || 0;
    const completedModulesCount = moduleProgress?.length || 0;

    // Determine user level
    let userLevel = 'beginner';
    if (completedModulesCount > 10) userLevel = 'advanced';
    else if (completedModulesCount > 5) userLevel = 'intermediate';

    // Call Lovable AI for recommendations
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an AI learning advisor. Analyze the user's learning history and recommend 3 relevant courses. 
            Return ONLY a JSON array of recommendations with this exact structure:
            [{"course_id": "uuid", "reason": "brief explanation why this course is recommended"}]`
          },
          {
            role: 'user',
            content: `User Profile:
- Completed ${completedCount} courses
- Completed ${completedModulesCount} modules
- Current level: ${userLevel}
- Enrolled courses: ${enrollments?.map(e => e.learning_paths.title).join(', ') || 'None'}

Available courses to recommend:
${availableCourses.map(c => `- ${c.title} (${c.level}): ${c.description}`).join('\n')}

Recommend 3 courses that would best help this user progress in their AI learning journey.`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      }),
    });

    const aiData = await aiResponse.json();
    const aiRecommendations = JSON.parse(aiData.choices[0].message.content);

    // Enrich recommendations with full course data
    const recommendations = aiRecommendations.map((rec: any) => {
      const course = availableCourses.find(c => c.id === rec.course_id);
      return course ? { ...course, reason: rec.reason } : null;
    }).filter(Boolean).slice(0, 3);

    return new Response(
      JSON.stringify({ recommendations }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message, recommendations: [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
