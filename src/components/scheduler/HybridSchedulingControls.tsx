
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Play } from "lucide-react";
import { StaffTaskRecommendation, generateBatchRecommendations } from "@/services/schedulerService";
import { autoScheduleTasks, AutoScheduleConfig, AutoScheduleResult } from "@/services/autoSchedulerService";
import { TaskInstance } from "@/types/task";
import AutoScheduleConfigPanel from "./AutoScheduleConfigPanel";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import AutoScheduleResults from "./AutoScheduleResults";

interface HybridSchedulingControlsProps {
  onRecommendationsGenerated: (recommendations: Record<string, StaffTaskRecommendation[]>) => void;
  selectedTask: TaskInstance | null;
}

type SchedulingMode = "hybrid" | "automatic";

const HybridSchedulingControls: React.FC<HybridSchedulingControlsProps> = ({
  onRecommendationsGenerated,
  selectedTask
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAutoScheduling, setIsAutoScheduling] = useState(false);
  const [mode, setMode] = useState<SchedulingMode>("hybrid");
  const [autoScheduleResult, setAutoScheduleResult] = useState<AutoScheduleResult | null>(null);

  // Generate recommendations for tasks
  const handleGenerateRecommendations = async () => {
    try {
      setIsGenerating(true);
      
      // Get today's date formatted as YYYY-MM-DD
      const today = format(new Date(), "yyyy-MM-dd");
      
      // Generate batch recommendations
      const recommendations = await generateBatchRecommendations(today, 10);
      
      // Notify parent component about the recommendations
      onRecommendationsGenerated(recommendations);
      
      // Show toast message with count of recommendations
      const taskCount = Object.keys(recommendations).length;
      if (taskCount > 0) {
        toast({
          title: "Recommendations Generated",
          description: `Found optimal matches for ${taskCount} tasks.`,
        });
      } else {
        toast({
          title: "No Recommendations",
          description: "Could not find suitable matches for any tasks.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to generate recommendations:", error);
      toast({
        title: "Error",
        description: "Failed to generate scheduling recommendations.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Run automatic scheduling
  const handleAutoSchedule = async (config: AutoScheduleConfig) => {
    try {
      setIsAutoScheduling(true);
      
      // Run the auto-scheduler
      const result = await autoScheduleTasks(config);
      
      // Store and display results
      setAutoScheduleResult(result);
      
      // Show toast with summary
      if (result.tasksScheduled > 0) {
        toast({
          title: "Automatic Scheduling Complete",
          description: `Successfully scheduled ${result.tasksScheduled} of ${result.totalTasksProcessed} tasks.`,
        });
      } else {
        toast({
          title: "Auto-Scheduling Result",
          description: "No tasks could be scheduled automatically. Check the detailed results.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Auto-scheduling failed:", error);
      toast({
        title: "Error",
        description: "Automatic scheduling failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAutoScheduling(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <Tabs value={mode} onValueChange={(value) => setMode(value as SchedulingMode)} className="w-full">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-medium mb-1">Intelligent Scheduling</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Let the system intelligently assign tasks to the most suitable staff members
              </p>
            </div>
            
            <TabsList>
              <TabsTrigger value="hybrid" className="data-[state=active]:bg-blue-50">
                <div className="flex items-center">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Hybrid Mode
                </div>
              </TabsTrigger>
              <TabsTrigger value="automatic" className="data-[state=active]:bg-blue-50">
                <div className="flex items-center">
                  <Play className="mr-2 h-4 w-4" />
                  Automatic Mode
                </div>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="mt-4">
            {mode === "hybrid" ? (
              <div className="space-y-4">
                <p className="text-sm">
                  Hybrid mode suggests optimal staff-task matches based on skills and availability, but lets you 
                  review and confirm each assignment.
                </p>
                
                {selectedTask ? (
                  <div className="bg-blue-50 p-3 rounded-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Selected Task: {selectedTask.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Find the best staff member for this specific task
                        </p>
                      </div>
                      <Badge variant="secondary">Task Selected</Badge>
                    </div>
                  </div>
                ) : null}
                
                <Button
                  onClick={handleGenerateRecommendations}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating Recommendations...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" /> 
                      {selectedTask 
                        ? "Find Optimal Staff Match" 
                        : "Generate Recommendations for All Tasks"}
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm mb-4">
                  Automatic mode assigns multiple tasks at once based on your configured rules and priorities, without requiring manual confirmation.
                </p>
                
                {autoScheduleResult && (
                  <AutoScheduleResults 
                    result={autoScheduleResult}
                    onClose={() => setAutoScheduleResult(null)}
                  />
                )}
                
                <AutoScheduleConfigPanel 
                  onSchedule={handleAutoSchedule}
                  isScheduling={isAutoScheduling}
                />
              </div>
            )}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default HybridSchedulingControls;
