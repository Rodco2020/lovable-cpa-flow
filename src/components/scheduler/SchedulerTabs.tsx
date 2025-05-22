
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UnscheduledTaskList from "@/components/scheduler/UnscheduledTaskList";
import StaffScheduleView from "@/components/scheduler/StaffScheduleView";
import RecommendationPanel from "./RecommendationPanel";
import { Separator } from "@/components/ui/separator";
import { TaskInstance } from "@/types/task";

interface SchedulerTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedTask: TaskInstance | null;
  currentDate: Date;
  showRecommendations: boolean;
  selectedTaskRecommendations: any[];
  onRecommendationApplied: () => void;
  setShowRecommendations: (show: boolean) => void;
  onTaskSelect: (task: TaskInstance) => void;
  tasksWithRecommendations: string[];
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

/**
 * Component that renders the main tabs for unscheduled tasks and staff schedule
 */
const SchedulerTabs: React.FC<SchedulerTabsProps> = ({
  activeTab,
  setActiveTab,
  selectedTask,
  currentDate,
  showRecommendations,
  selectedTaskRecommendations,
  onRecommendationApplied,
  setShowRecommendations,
  onTaskSelect,
  tasksWithRecommendations,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange
}) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <div className="flex items-center justify-between">
        <TabsList className="grid grid-cols-2 w-[400px]">
          <TabsTrigger value="unscheduled">Unscheduled Tasks</TabsTrigger>
          <TabsTrigger value="schedule">Staff Schedule</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="unscheduled" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Unscheduled Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <UnscheduledTaskList 
              onTaskSelect={onTaskSelect} 
              tasksWithRecommendations={tasksWithRecommendations}
              page={page}
              pageSize={pageSize}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
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
                  onRecommendationApplied={onRecommendationApplied}
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
  );
};

export default SchedulerTabs;
