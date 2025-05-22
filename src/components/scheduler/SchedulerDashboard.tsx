
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

const SchedulerDashboard: React.FC = () => {
  const [selectedTask, setSelectedTask] = useState<TaskInstance | null>(null);
  const [activeTab, setActiveTab] = useState("unscheduled");
  const [currentDate, setCurrentDate] = useState(new Date());

  const handleTaskSelect = (task: TaskInstance) => {
    setSelectedTask(task);
    setActiveTab("schedule");
  };

  // Navigate between days
  const navigateDay = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => 
      direction === 'prev' ? addDays(prev, -1) : addDays(prev, 1)
    );
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
          <TabsList className="grid grid-cols-2 w-[400px]">
            <TabsTrigger value="unscheduled">Unscheduled Tasks</TabsTrigger>
            <TabsTrigger value="schedule">Staff Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="unscheduled" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Unscheduled Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <UnscheduledTaskList onTaskSelect={handleTaskSelect} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Staff Schedule</CardTitle>
              </CardHeader>
              <CardContent>
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
