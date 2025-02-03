import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

interface WorkoutFormData {
  date: string;
  distance: string;
  duration: string;
}

interface AddWorkoutFormProps {
  onSubmit: (workout: WorkoutFormData) => void;
}

const AddWorkoutForm = ({ onSubmit }: AddWorkoutFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<WorkoutFormData>({
    date: new Date().toISOString().split("T")[0],
    distance: "",
    duration: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.distance || !formData.duration) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    onSubmit(formData);
    setFormData({
      date: new Date().toISOString().split("T")[0],
      distance: "",
      duration: "",
    });
    toast({
      title: "Success",
      description: "Workout added successfully!",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="date">Date</Label>
        <Input
          type="date"
          id="date"
          value={formData.date}
          onChange={(e) =>
            setFormData({ ...formData, date: e.target.value })
          }
        />
      </div>
      <div>
        <Label htmlFor="distance">Distance (km)</Label>
        <Input
          type="number"
          id="distance"
          step="0.01"
          value={formData.distance}
          onChange={(e) =>
            setFormData({ ...formData, distance: e.target.value })
          }
        />
      </div>
      <div>
        <Label htmlFor="duration">Duration (minutes)</Label>
        <Input
          type="number"
          id="duration"
          value={formData.duration}
          onChange={(e) =>
            setFormData({ ...formData, duration: e.target.value })
          }
        />
      </div>
      <Button type="submit" className="w-full bg-running-600 hover:bg-running-700">
        Add Workout
      </Button>
    </form>
  );
};

export default AddWorkoutForm;