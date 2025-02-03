import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const WorkoutRecommendation = () => {
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<{
    type: string;
    recommendation: string;
    distance: number;
    duration: number;
  } | null>(null);
  const { toast } = useToast();

  const generateRecommendation = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Error",
          description: "You must be logged in to generate recommendations",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('generate-workout', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      setRecommendation(data);
      toast({
        title: "Success",
        description: "Generated your next workout recommendation!",
      });
    } catch (error) {
      console.error('Error generating recommendation:', error);
      toast({
        title: "Error",
        description: "Failed to generate workout recommendation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Workout Recommendation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendation ? (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-running-600">{recommendation.type}</h3>
            <p className="text-muted-foreground">{recommendation.recommendation}</p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm text-muted-foreground">Distance</p>
                <p className="text-lg font-semibold">{recommendation.distance} km</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="text-lg font-semibold">{recommendation.duration} min</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">
            Click the button below to get your next workout recommendation based on your recent activity.
          </p>
        )}
        <Button 
          onClick={generateRecommendation} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Recommendation"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default WorkoutRecommendation;