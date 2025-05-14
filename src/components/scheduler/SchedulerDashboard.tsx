
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UnscheduledTaskList from "@/components/scheduler/UnscheduledTaskList";
import StaffScheduleView from "@/components/scheduler/StaffScheduleView";
import { TaskInstance } from "@/types/task";

const SchedulerDashboard: React.FC = () => {
  const [selectedTask, setSelectedTask] = useState<TaskInstance | null>(null);
  const [activeTab, setActiveTab] = useState("unscheduled");

  const handleTaskSelect = (task: TaskInstance) => {
    setSelectedTask(task);
    setActiveTab("schedule");
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Scheduler</h1>
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
              <StaffScheduleView selectedTask={selectedTask} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SchedulerDashboard;
