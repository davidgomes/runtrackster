import { Calendar, Clock, ArrowUp } from "lucide-react";
import { Card } from "@/components/ui/card";

interface WorkoutCardProps {
  date: string;
  distance: number;
  duration: string;
  pace: string;
}

const WorkoutCard = ({ date, distance, duration, pace }: WorkoutCardProps) => {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-running-600" />
          <span className="font-medium">{date}</span>
        </div>
        <ArrowUp className="w-5 h-5 text-running-600" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-gray-500">Distance</p>
          <p className="text-xl font-bold">{distance}km</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Duration</p>
          <p className="text-xl font-bold">{duration}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Pace</p>
          <p className="text-xl font-bold">{pace}/km</p>
        </div>
      </div>
    </Card>
  );
};

export default WorkoutCard;