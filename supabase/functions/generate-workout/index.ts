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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
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

    if (workoutsError) throw workoutsError

    // Calculate averages
    const avgDistance = workouts.reduce((sum, w) => sum + Number(w.distance), 0) / workouts.length
    const avgDuration = workouts.reduce((sum, w) => sum + w.duration, 0) / workouts.length

    // Generate recommendation based on recent performance
    const recommendation = generateRecommendation(workouts, avgDistance, avgDuration)

    return new Response(
      JSON.stringify(recommendation),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
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
  const lastWorkoutDate = new Date(workouts[0]?.date || new Date())
  const today = new Date()
  const daysSinceLastWorkout = Math.floor((today.getTime() - lastWorkoutDate.getTime()) / (1000 * 60 * 60 * 24))

  if (daysSinceLastWorkout < 1) {
    return {
      type: "Rest",
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

  const workoutIndex = workouts.length % workoutTypes.length
  const selectedWorkout = workoutTypes[workoutIndex]

  return {
    type: selectedWorkout.type,
    recommendation: selectedWorkout.description,
    distance: Math.round(avgDistance * selectedWorkout.distanceMultiplier * 10) / 10,
    duration: Math.round(avgDuration * selectedWorkout.durationMultiplier)
  }
}