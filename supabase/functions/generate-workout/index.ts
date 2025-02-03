import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Workout {
  distance: number;
  duration: number;
  date: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Generating workout recommendation...');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    )

    // Get authorization header from request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Get user's recent workouts
    const { data: workouts, error: workoutsError } = await supabaseClient
      .from('workouts')
      .select('distance, duration, date')
      .order('date', { ascending: false })
      .limit(5)

    if (workoutsError) {
      console.error('Error fetching workouts:', workoutsError);
      throw workoutsError;
    }

    console.log('Recent workouts:', workouts);

    // Calculate averages
    const avgDistance = workouts.length > 0 
      ? workouts.reduce((sum, w) => sum + Number(w.distance), 0) / workouts.length 
      : 5; // Default to 5km if no workouts
    const avgDuration = workouts.length > 0
      ? workouts.reduce((sum, w) => sum + w.duration, 0) / workouts.length
      : 30; // Default to 30 minutes if no workouts

    // Generate recommendation based on recent performance
    const recommendation = generateRecommendation(workouts, avgDistance, avgDuration);
    console.log('Generated recommendation:', recommendation);

    return new Response(
      JSON.stringify(recommendation),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in generate-workout function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

function generateRecommendation(workouts: Workout[], avgDistance: number, avgDuration: number) {
  // Determine if user needs a rest day
  const lastWorkoutDate = workouts[0]?.date ? new Date(workouts[0].date) : new Date(0);
  const today = new Date();
  const daysSinceLastWorkout = Math.floor((today.getTime() - lastWorkoutDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysSinceLastWorkout < 1) {
    return {
      type: "Rest Day",
      recommendation: "Take a rest day to recover and prevent injury.",
      distance: 0,
      duration: 0
    }
  }

  // Alternate between different types of workouts
  const workoutTypes = [
    {
      type: "Easy Run",
      distanceMultiplier: 0.8,
      durationMultiplier: 1.1,
      description: "Focus on maintaining a comfortable pace"
    },
    {
      type: "Long Run",
      distanceMultiplier: 1.3,
      durationMultiplier: 1.4,
      description: "Build endurance with a longer distance"
    },
    {
      type: "Speed Work",
      distanceMultiplier: 0.7,
      durationMultiplier: 0.8,
      description: "Include intervals at a faster pace"
    }
  ]

  const workoutIndex = workouts.length % workoutTypes.length;
  const selectedWorkout = workoutTypes[workoutIndex];

  return {
    type: selectedWorkout.type,
    recommendation: selectedWorkout.description,
    distance: Math.round(avgDistance * selectedWorkout.distanceMultiplier * 10) / 10,
    duration: Math.round(avgDuration * selectedWorkout.durationMultiplier)
  }
}