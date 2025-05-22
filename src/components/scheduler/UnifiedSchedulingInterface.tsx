
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Sparkles, Play, Settings, HelpCircle } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { StaffTaskRecommendation } from "@/services/schedulerService";
import { TaskInstance } from "@/types/task";
import { AutoScheduleResult } from "@/services/autoSchedulerService";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import KeyboardShortcutHelp from './KeyboardShortcutHelp';

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

/**
 * UnifiedSchedulingInterface provides a single interface to switch between and manage 
 * the three scheduling modes: manual, hybrid, and automatic.
 * 
 * Each mode has its own distinct UI elements and controls.
 */
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
  
  // State for showing help dialog
  const [showModeHelp, setShowModeHelp] = useState(false);

  // Handle mode change with persistence
  const handleModeChange = (mode: SchedulingMode) => {
    setPersistedMode(mode);
    onModeChange(mode);
  };

  return (
    <>
      <Card className="mb-6">
        <CardContent className="p-4">
          <Tabs value={currentMode} onValueChange={(value) => handleModeChange(value as SchedulingMode)} className="w-full">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium">Scheduler Controls</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={() => setShowModeHelp(true)}
                        aria-label="Show scheduling mode information"
                      >
                        <HelpCircle className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Learn about the different scheduling modes</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground mr-2 hidden sm:block">
                  Choose your preferred scheduling method
                </p>
                <TabsList>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger 
                          value="manual" 
                          className="data-[state=active]:bg-blue-50"
                          aria-label="Manual scheduling mode"
                        >
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4" />
                            Manual
                          </div>
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Drag and drop tasks to staff calendars</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger 
                          value="hybrid" 
                          className="data-[state=active]:bg-blue-50"
                          aria-label="Hybrid scheduling mode"
                        >
                          <div className="flex items-center">
                            <Sparkles className="mr-2 h-4 w-4" />
                            Hybrid
                            {recommendationsCount > 0 && (
                              <Badge variant="secondary" className="ml-2">{recommendationsCount}</Badge>
                            )}
                          </div>
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Get AI recommendations with human oversight</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger 
                          value="automatic" 
                          className="data-[state=active]:bg-blue-50"
                          aria-label="Automatic scheduling mode"
                        >
                          <div className="flex items-center">
                            <Play className="mr-2 h-4 w-4" />
                            Automatic
                          </div>
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Automatically assign tasks based on rules</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TabsList>
                
                <KeyboardShortcutHelp />
              </div>
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
                    aria-label={selectedTask ? "Find optimal staff match for selected task" : "Generate recommendations for all tasks"}
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
                            aria-expanded={showConfigPanel}
                            aria-controls="auto-schedule-config-panel"
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
                    <div className="py-8 flex flex-col items-center" aria-live="polite">
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
                  
                  <div className="mt-4 p-3 bg-blue-50 rounded-md">
                    <p className="text-xs text-blue-700">
                      <span className="font-medium">Pro tip:</span> Use keyboard shortcuts to speed up your workflow. Press <kbd className="px-1 bg-white rounded border">?</kbd> to see available shortcuts.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Help dialog for scheduling modes */}
      <Dialog open={showModeHelp} onOpenChange={setShowModeHelp}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Scheduling Modes</DialogTitle>
            <DialogDescription>
              Choose the right scheduling mode for your workflow needs
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 pt-4">
            <div className="flex space-x-4 border-b pb-4">
              <div className="bg-blue-50 p-2 rounded-full h-fit">
                <Calendar className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h3 className="text-base font-medium">Manual Mode</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Drag and drop tasks directly onto staff calendars. Best for precise control and special cases.
                </p>
                <ul className="text-sm list-disc pl-5 mt-2 space-y-1">
                  <li>Full control over assignments</li>
                  <li>Visual time slot selection</li>
                  <li>Immediate feedback on conflicts</li>
                </ul>
              </div>
            </div>
            
            <div className="flex space-x-4 border-b pb-4">
              <div className="bg-purple-50 p-2 rounded-full h-fit">
                <Sparkles className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <h3 className="text-base font-medium">Hybrid Mode</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Get AI-powered staff recommendations with human oversight. Good balance of efficiency and control.
                </p>
                <ul className="text-sm list-disc pl-5 mt-2 space-y-1">
                  <li>Smart matching algorithms</li>
                  <li>Final approval on all assignments</li>
                  <li>Ranked recommendations with match quality</li>
                </ul>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <div className="bg-green-50 p-2 rounded-full h-fit">
                <Play className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <h3 className="text-base font-medium">Automatic Mode</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Batch-assign tasks automatically based on configurable rules. Best for high-volume routine tasks.
                </p>
                <ul className="text-sm list-disc pl-5 mt-2 space-y-1">
                  <li>Configure scheduling priorities</li>
                  <li>Process many tasks at once</li>
                  <li>Detailed results and error reports</li>
                </ul>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UnifiedSchedulingInterface;
