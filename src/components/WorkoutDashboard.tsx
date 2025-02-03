import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import AddWorkoutForm from "./AddWorkoutForm";
import StatsCard from "./StatsCard";
import WeeklyChart from "./WeeklyChart";
import WorkoutCard from "./WorkoutCard";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface Workout {
  id: number;
  date: string;
  distance: number;
  duration: string;
  pace: string;
}

const calculatePace = (distance: number, duration: number) => {
  const paceInMinutes = duration / distance;
  const minutes = Math.floor(paceInMinutes);
  const seconds = Math.round((paceInMinutes - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const WorkoutDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [weeklyData, setWeeklyData] = useState<{ name: string; distance: number }[]>([]);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please log in to view your workouts",
          variant: "destructive",
        });
        navigate("/auth");
      }
    };
    
    checkAuth();
  }, [navigate, toast]);

  // Subscribe to auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Fetch workouts on component mount
  useEffect(() => {
    fetchWorkouts();
  }, []);

  // Process workouts data for weekly chart
  useEffect(() => {
    const processWeeklyData = () => {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const weekData = days.map(day => ({ name: day, distance: 0 }));
      
      workouts.forEach(workout => {
        const date = new Date(workout.date);
        const dayIndex = date.getDay();
        weekData[dayIndex].distance += workout.distance;
      });
      
      // Reorder array to start with Monday
      const mondayFirst = [...weekData.slice(1), weekData[0]];
      setWeeklyData(mondayFirst);
    };

    processWeeklyData();
  }, [workouts]);

  const fetchWorkouts = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Get the date for 7 days ago
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .gte('date', sevenDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching workouts:', error);
        toast({
          title: "Error",
          description: "Failed to load workouts",
          variant: "destructive",
        });
        return;
      }

      const formattedWorkouts = data.map(workout => ({
        id: workout.id,
        date: new Date(workout.date).toLocaleDateString(),
        distance: Number(workout.distance),
        duration: `${workout.duration} min`,
        pace: workout.pace
      }));

      setWorkouts(formattedWorkouts);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load workouts",
        variant: "destructive",
      });
    }
  };

  const handleAddWorkout = async (formData: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Error",
          description: "You must be logged in to add workouts",
          variant: "destructive",
        });
        return;
      }

      const pace = calculatePace(
        parseFloat(formData.distance),
        parseFloat(formData.duration)
      );
      
      const { error } = await supabase
        .from('workouts')
        .insert([
          {
            date: formData.date,
            distance: parseFloat(formData.distance),
            duration: parseInt(formData.duration),
            pace,
            user_id: session.user.id
          }
        ]);

      if (error) {
        console.error('Error inserting workout:', error);
        toast({
          title: "Error",
          description: "Failed to add workout",
          variant: "destructive",
        });
        return;
      }

      fetchWorkouts(); // Refresh the workouts list
      toast({
        title: "Success",
        description: "Workout added successfully!",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to add workout",
        variant: "destructive",
      });
    }
  };

  const totalDistance = workouts.reduce((sum, workout) => sum + workout.distance, 0);
  const averagePace = workouts.length
    ? calculatePace(
        totalDistance,
        workouts.reduce(
          (sum, workout) => sum + parseInt(workout.duration),
          0
        )
      )
    : "0:00";

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Running Tracker</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="Total Distance"
          value={`${totalDistance.toFixed(1)} km`}
          trend="+2.5 km"
        />
        <StatsCard
          title="Average Pace"
          value={`${averagePace}/km`}
          trend="30s faster"
        />
        <StatsCard
          title="Workouts"
          value={workouts.length.toString()}
          trend="+2 runs"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <WeeklyChart data={weeklyData} />
        </div>
        <div>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Add Workout</h3>
            <AddWorkoutForm onSubmit={handleAddWorkout} />
          </Card>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Recent Workouts</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workouts.map((workout) => (
          <WorkoutCard key={workout.id} {...workout} />
        ))}
      </div>
    </div>
  );
};

export default WorkoutDashboard;