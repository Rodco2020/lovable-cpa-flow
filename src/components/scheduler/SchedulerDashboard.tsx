
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UnscheduledTaskList from "@/components/scheduler/UnscheduledTaskList";
import StaffScheduleView from "@/components/scheduler/StaffScheduleView";
import { TaskInstance } from "@/types/task";
import { format, addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAppEvent } from "@/hooks/useAppEvent";
import { toast } from "@/components/ui/use-toast";
import DragDropContext from "./DragDropContext";
import HybridSchedulingControls from "./HybridSchedulingControls";
import RecommendationPanel from "./RecommendationPanel";
import { StaffTaskRecommendation } from "@/services/schedulerService";
import { Separator } from "@/components/ui/separator";

// Enum to track the current scheduling mode
enum SchedulingMode {
  MANUAL = 'manual',
  HYBRID = 'hybrid',
}

const SchedulerDashboard: React.FC = () => {
  const [selectedTask, setSelectedTask] = useState<TaskInstance | null>(null);
  const [activeTab, setActiveTab] = useState("unscheduled");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedulingMode, setSchedulingMode] = useState<SchedulingMode>(SchedulingMode.MANUAL);
  const [recommendations, setRecommendations] = useState<Record<string, StaffTaskRecommendation[]>>({});
  const [showRecommendations, setShowRecommendations] = useState<boolean>(false);
  const [selectedTaskRecommendations, setSelectedTaskRecommendations] = useState<StaffTaskRecommendation[]>([]);

  const handleTaskSelect = (task: TaskInstance) => {
    setSelectedTask(task);
    setActiveTab("schedule");
    
    // If we have recommendations for this task, show them
    if (recommendations[task.id]) {
      setSelectedTaskRecommendations(recommendations[task.id]);
      setShowRecommendations(true);
    } else {
      setShowRecommendations(false);
    }
  };

  // Navigate between days
  const navigateDay = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => 
      direction === 'prev' ? addDays(prev, -1) : addDays(prev, 1)
    );
  };

  // Handle recommendations generation
  const handleRecommendationsGenerated = (newRecommendations: Record<string, StaffTaskRecommendation[]>) => {
    setRecommendations(newRecommendations);
    
    // If we have a selected task and recommendations for it, update the recommendations panel
    if (selectedTask && newRecommendations[selectedTask.id]) {
      setSelectedTaskRecommendations(newRecommendations[selectedTask.id]);
      setShowRecommendations(true);
    }
    
    // Switch to hybrid mode
    setSchedulingMode(SchedulingMode.HYBRID);
    
    // If no task is selected but we have recommendations, auto-select the first task
    if (!selectedTask && Object.keys(newRecommendations).length > 0) {
      const firstTaskId = Object.keys(newRecommendations)[0];
      const firstRecommendation = newRecommendations[firstTaskId][0];
      
      // Set selected task recommendations
      setSelectedTaskRecommendations(newRecommendations[firstTaskId]);
      setShowRecommendations(true);
      
      // Switch to schedule tab
      setActiveTab("schedule");
    }
  };

  // Handle recommendation being applied
  const handleRecommendationApplied = () => {
    // Close the recommendations panel
    setShowRecommendations(false);
    
    // Clear the selected task
    setSelectedTask(null);
    
    // Remove this task's recommendations from the list
    if (selectedTask) {
      const updatedRecommendations = { ...recommendations };
      delete updatedRecommendations[selectedTask.id];
      setRecommendations(updatedRecommendations);
    }
    
    // Show toast notification
    toast({
      title: "Task Scheduled",
      description: "The task has been successfully scheduled",
    });
  };

  // Listen for availability template changes to update scheduler
  useAppEvent("availability.template.changed", (event) => {
    const { staffId } = event.payload;
    
    toast({
      title: "Availability Updated",
      description: `Staff availability has changed. Scheduler updated.`,
    });
    
    // In a real implementation, we would update any cached availability data here
  }, []);

  return (
    <DragDropContext>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Scheduler</h1>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateDay('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="bg-slate-100 px-3 py-1.5 rounded font-medium min-w-32 text-center">
              {format(currentDate, "EEEE, MMM d, yyyy")}
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateDay('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="grid grid-cols-2 w-[400px]">
              <TabsTrigger value="unscheduled">Unscheduled Tasks</TabsTrigger>
              <TabsTrigger value="schedule">Staff Schedule</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="unscheduled" className="space-y-6">
            {/* Hybrid Scheduling Controls */}
            <HybridSchedulingControls 
              onRecommendationsGenerated={handleRecommendationsGenerated}
              selectedTask={selectedTask}
            />
            
            <Card>
              <CardHeader>
                <CardTitle>Unscheduled Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <UnscheduledTaskList 
                  onTaskSelect={handleTaskSelect} 
                  tasksWithRecommendations={Object.keys(recommendations)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Staff Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                {showRecommendations && selectedTaskRecommendations.length > 0 ? (
                  <div className="space-y-6">
                    <RecommendationPanel 
                      recommendations={selectedTaskRecommendations}
                      onRecommendationApplied={handleRecommendationApplied}
                      onClose={() => setShowRecommendations(false)}
                    />
                    <Separator />
                  </div>
                ) : null}
                
                <StaffScheduleView 
                  selectedTask={selectedTask} 
                  currentDate={currentDate}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DragDropContext>
  );
};

export default SchedulerDashboard;
