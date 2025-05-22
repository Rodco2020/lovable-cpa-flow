
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Magic, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { TaskInstance } from '@/types/task';
import { StaffTaskRecommendation, generateBatchRecommendations } from '@/services/schedulerService';

interface HybridSchedulingControlsProps {
  onRecommendationsGenerated: (recommendations: Record<string, StaffTaskRecommendation[]>) => void;
  selectedTask: TaskInstance | null;
  className?: string;
}

const HybridSchedulingControls: React.FC<HybridSchedulingControlsProps> = ({
  onRecommendationsGenerated,
  selectedTask,
  className = ""
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateRecommendations = async () => {
    try {
      setIsLoading(true);
      
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      
      // Generate recommendations for today
      const recommendations = await generateBatchRecommendations(today);
      
      // Check if we have any recommendations
      const recommendationCount = Object.keys(recommendations).length;
      
      if (recommendationCount > 0) {
        toast({
          title: "Recommendations Generated",
          description: `Found optimal assignments for ${recommendationCount} tasks.`,
        });
        
        onRecommendationsGenerated(recommendations);
      } else {
        toast({
          title: "No Recommendations",
          description: "No suitable staff-task matches found for today's schedule.",
        });
      }
    } catch (error) {
      console.error("Error generating recommendations:", error);
      toast({
        title: "Error",
        description: "Failed to generate scheduling recommendations.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-medium">Hybrid Scheduling</h3>
            <p className="text-sm text-muted-foreground">
              Get AI-powered scheduling recommendations
            </p>
          </div>
          
          <Button 
            onClick={handleGenerateRecommendations}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Magic className="h-4 w-4" />
                Suggest Assignments
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HybridSchedulingControls;
