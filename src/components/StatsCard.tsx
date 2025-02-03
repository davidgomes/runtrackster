import { Card } from "@/components/ui/card";
import { Activity } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  trend?: string;
}

const StatsCard = ({ title, value, trend }: StatsCardProps) => {
  return (
    <Card className="p-6 bg-gradient-to-br from-running-500 to-running-600">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm">{title}</p>
          <p className="text-white text-2xl font-bold">{value}</p>
          {trend && (
            <p className="text-white/90 text-sm mt-1">
              {trend} vs last week
            </p>
          )}
        </div>
        <Activity className="w-8 h-8 text-white/80" />
      </div>
    </Card>
  );
};

export default StatsCard;