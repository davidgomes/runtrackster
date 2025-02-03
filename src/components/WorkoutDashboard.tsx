import { useState } from "react";
import AddWorkoutForm from "./AddWorkoutForm";
import StatsCard from "./StatsCard";
import WeeklyChart from "./WeeklyChart";
import WorkoutCard from "./WorkoutCard";

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
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  const handleAddWorkout = (formData: any) => {
    const pace = calculatePace(
      parseFloat(formData.distance),
      parseFloat(formData.duration)
    );
    
    const newWorkout = {
      id: Date.now(),
      date: new Date(formData.date).toLocaleDateString(),
      distance: parseFloat(formData.distance),
      duration: `${formData.duration} min`,
      pace,
    };

    setWorkouts([newWorkout, ...workouts]);
  };

  const totalDistance = workouts.reduce((sum, workout) => sum + workout.distance, 0);
  const averagePace = workouts.length
    ? calculatePace(
        totalDistance,
        workouts.reduce(
          (sum, workout) => sum + parseFloat(workout.duration),
          0
        )
      )
    : "0:00";

  const chartData = [
    { name: "Mon", distance: 5 },
    { name: "Tue", distance: 7 },
    { name: "Wed", distance: 3 },
    { name: "Thu", distance: 8 },
    { name: "Fri", distance: 4 },
    { name: "Sat", distance: 10 },
    { name: "Sun", distance: 6 },
  ];

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
          <WeeklyChart data={chartData} />
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