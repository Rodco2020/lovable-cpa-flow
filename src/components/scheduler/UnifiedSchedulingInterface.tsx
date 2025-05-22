
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Sparkles, Play, Settings } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { StaffTaskRecommendation } from "@/services/schedulerService";
import { TaskInstance } from "@/types/task";
import { AutoScheduleResult } from "@/services/autoSchedulerService";

export type SchedulingMode = 'manual' | 'hybrid' | 'automatic';

interface UnifiedSchedulingInterfaceProps {
  onModeChange: (mode: SchedulingMode) => void;
  currentMode: SchedulingMode;
  selectedTask: TaskInstance | null;
  isGeneratingRecommendations: boolean;
  isAutoScheduling: boolean;
  onGenerateRecommendations: () => void;
  onToggleConfigPanel: () => void;
  showConfigPanel: boolean;
  autoScheduleResults: AutoScheduleResult | null;
  recommendationsCount: number;
}

const UnifiedSchedulingInterface: React.FC<UnifiedSchedulingInterfaceProps> = ({
  onModeChange,
  currentMode,
  selectedTask,
  isGeneratingRecommendations,
  isAutoScheduling,
  onGenerateRecommendations,
  onToggleConfigPanel,
  showConfigPanel,
  autoScheduleResults,
  recommendationsCount
}) => {
  // Use localStorage to persist the user's preferred mode
  const [persistedMode, setPersistedMode] = useLocalStorage<SchedulingMode>(
    'preferred-scheduling-mode',
    'manual'
  );

  // Handle mode change with persistence
  const handleModeChange = (mode: SchedulingMode) => {
    setPersistedMode(mode);
    onModeChange(mode);
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <Tabs value={currentMode} onValueChange={(value) => handleModeChange(value as SchedulingMode)} className="w-full">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-medium mb-1">Scheduler Controls</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Choose your preferred scheduling method
              </p>
            </div>
            
            <TabsList>
              <TabsTrigger value="manual" className="data-[state=active]:bg-blue-50">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  Manual
                </div>
              </TabsTrigger>
              <TabsTrigger value="hybrid" className="data-[state=active]:bg-blue-50">
                <div className="flex items-center">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Hybrid
                  {recommendationsCount > 0 && (
                    <Badge variant="secondary" className="ml-2">{recommendationsCount}</Badge>
                  )}
                </div>
              </TabsTrigger>
              <TabsTrigger value="automatic" className="data-[state=active]:bg-blue-50">
                <div className="flex items-center">
                  <Play className="mr-2 h-4 w-4" />
                  Automatic
                </div>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="mt-4">
            {currentMode === "hybrid" && (
              <div className="space-y-4">
                <p className="text-sm">
                  Hybrid mode suggests optimal staff-task matches based on skills and availability, but lets you 
                  review and confirm each assignment.
                </p>
                
                {selectedTask && (
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
                )}
                
                <Button
                  onClick={onGenerateRecommendations}
                  disabled={isGeneratingRecommendations}
                  className="w-full"
                >
                  {isGeneratingRecommendations ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating Recommendations...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Sparkles className="mr-2 h-4 w-4" /> 
                      {selectedTask 
                        ? "Find Optimal Staff Match" 
                        : "Generate Recommendations for All Tasks"}
                    </div>
                  )}
                </Button>
              </div>
            )}
            
            {currentMode === "automatic" && (
              <div className="space-y-4">
                <p className="text-sm mb-4">
                  Automatic mode assigns multiple tasks at once based on your configured rules and priorities, without requiring manual confirmation.
                </p>
                
                {autoScheduleResults && (
                  <div className="bg-green-50 p-3 rounded-md mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Last Auto-Schedule Results</h4>
                      <Badge variant="outline" className="bg-green-100">
                        {autoScheduleResults.tasksScheduled}/{autoScheduleResults.totalTasksProcessed} Tasks
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Successfully scheduled {autoScheduleResults.tasksScheduled} tasks. 
                      {autoScheduleResults.errors.length > 0 && ` Encountered ${autoScheduleResults.errors.length} errors.`}
                    </p>
                  </div>
                )}
                
                <div className="flex justify-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant={showConfigPanel ? "outline" : "default"} 
                          onClick={onToggleConfigPanel}
                          className="flex items-center"
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          {showConfigPanel ? "Hide Configuration" : "Show Configuration"}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Configure auto-scheduling parameters</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                {isAutoScheduling && (
                  <div className="py-8 flex flex-col items-center">
                    <Skeleton className="h-12 w-12 rounded-full bg-blue-200" />
                    <p className="mt-4 text-sm font-medium text-blue-800">Auto-scheduling in progress...</p>
                    <p className="text-xs text-muted-foreground mt-1">This may take a moment</p>
                  </div>
                )}
              </div>
            )}
            
            {currentMode === "manual" && (
              <div className="p-4 bg-slate-50 rounded-md">
                <p className="text-sm">
                  Manual mode gives you full control over task assignments. Drag unscheduled tasks from the list onto staff calendars.
                </p>
                <ul className="mt-3 space-y-2 text-sm">
                  <li className="flex items-center">
                    <span className="inline-block w-2 h-2 mr-2 rounded-full bg-blue-500"></span>
                    Select tasks from the unscheduled list
                  </li>
                  <li className="flex items-center">
                    <span className="inline-block w-2 h-2 mr-2 rounded-full bg-blue-500"></span>
                    Drag and drop onto available time slots
                  </li>
                  <li className="flex items-center">
                    <span className="inline-block w-2 h-2 mr-2 rounded-full bg-blue-500"></span>
                    Review conflicts and adjust as needed
                  </li>
                </ul>
              </div>
            )}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default UnifiedSchedulingInterface;
