
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UnscheduledTaskList from "@/components/scheduler/UnscheduledTaskList";
import StaffScheduleView from "@/components/scheduler/StaffScheduleView";
import { TaskInstance } from "@/types/task";
import { format, addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { useAppEvent } from "@/hooks/useAppEvent";
import { toast } from "@/components/ui/use-toast";
import DragDropContext from "./DragDropContext";
import RecommendationPanel from "./RecommendationPanel";
import { StaffTaskRecommendation, generateBatchRecommendations } from "@/services/schedulerService";
import { Separator } from "@/components/ui/separator";
import { AutoScheduleResult, autoScheduleTasks } from "@/services/autoSchedulerService";
import UnifiedSchedulingInterface, { SchedulingMode } from "./UnifiedSchedulingInterface";
import AutoScheduleConfigPanel from "./AutoScheduleConfigPanel";
import AutoScheduleResults from "./AutoScheduleResults";
import SchedulerErrorHandler, { ErrorLogEntry } from "./SchedulerErrorHandler";
import { getErrorLogs, resolveError, clearAllErrors, clearResolvedErrors } from "@/services/errorLoggingService";
import SchedulerMetrics from "./SchedulerMetrics";
import { clearAllCaches, clearExpiredCaches } from "@/services/schedulerCacheService";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const SchedulerDashboard: React.FC = () => {
  // State for scheduling
  const [selectedTask, setSelectedTask] = useState<TaskInstance | null>(null);
  const [activeTab, setActiveTab] = useState("unscheduled");
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Get preferred mode from localStorage or default to manual
  const [schedulingMode, setSchedulingMode] = useLocalStorage<SchedulingMode>(
    'preferred-scheduling-mode',
    'manual'
  );
  
  // Recommendations state
  const [recommendations, setRecommendations] = useState<Record<string, StaffTaskRecommendation[]>>({});
  const [showRecommendations, setShowRecommendations] = useState<boolean>(false);
  const [selectedTaskRecommendations, setSelectedTaskRecommendations] = useState<StaffTaskRecommendation[]>([]);
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);
  
  // Auto-scheduling state
  const [autoScheduleResults, setAutoScheduleResults] = useState<AutoScheduleResult | null>(null);
  const [isAutoScheduling, setIsAutoScheduling] = useState(false);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  
  // Error handling state
  const [errorLogs, setErrorLogs] = useState<ErrorLogEntry[]>([]);
  
  // Show metrics toggle
  const [showMetrics, setShowMetrics] = useLocalStorage('show-scheduling-metrics', false);
  
  // Pagination state for task list
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useLocalStorage('task-list-page-size', 10);
  
  // Load initial error logs
  useEffect(() => {
    const logs = getErrorLogs();
    setErrorLogs(logs as ErrorLogEntry[]);
    
    // Set up an interval to refresh error logs
    const intervalId = setInterval(() => {
      const freshLogs = getErrorLogs();
      setErrorLogs(freshLogs as ErrorLogEntry[]);
    }, 10000); // Every 10 seconds
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Also periodically clean expired cache entries
  useEffect(() => {
    const intervalId = setInterval(() => {
      clearExpiredCaches();
    }, 60000); // Every minute
    
    return () => clearInterval(intervalId);
  }, []);

  // Handle task selection
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
  const handleGenerateRecommendations = async () => {
    try {
      setIsGeneratingRecommendations(true);
      
      // Get today's date formatted as YYYY-MM-DD
      const today = format(new Date(), "yyyy-MM-dd");
      
      // Generate batch recommendations
      const newRecommendations = await generateBatchRecommendations(today, 10);
      
      // Update recommendations state
      setRecommendations(newRecommendations);
      
      // If we have a selected task and recommendations for it, update the recommendations panel
      if (selectedTask && newRecommendations[selectedTask.id]) {
        setSelectedTaskRecommendations(newRecommendations[selectedTask.id]);
        setShowRecommendations(true);
      }
      
      // Show toast message with count of recommendations
      const taskCount = Object.keys(newRecommendations).length;
      if (taskCount > 0) {
        toast({
          title: "Recommendations Generated",
          description: `Found optimal matches for ${taskCount} tasks.`,
        });
        
        // If no task is selected but we have recommendations, auto-select the first task
        if (!selectedTask && Object.keys(newRecommendations).length > 0) {
          const firstTaskId = Object.keys(newRecommendations)[0];
          
          // Set selected task recommendations
          setSelectedTaskRecommendations(newRecommendations[firstTaskId]);
          setShowRecommendations(true);
          
          // Switch to schedule tab
          setActiveTab("schedule");
        }
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
      setIsGeneratingRecommendations(false);
    }
  };

  // Run automatic scheduling
  const handleAutoSchedule = async (config: any) => {
    try {
      setIsAutoScheduling(true);
      setShowConfigPanel(false);
      
      // Run the auto-scheduler
      const result = await autoScheduleTasks(config);
      
      // Store and display results
      setAutoScheduleResults(result);
      
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

  // Handle recommendation application
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
  
  // Error handling functions
  const handleResolveError = (errorId: string) => {
    resolveError(errorId);
    // Refresh error logs
    setErrorLogs(getErrorLogs() as ErrorLogEntry[]);
  };
  
  const handleClearErrors = () => {
    clearResolvedErrors();
    // Refresh error logs
    setErrorLogs(getErrorLogs() as ErrorLogEntry[]);
  };
  
  // Callback to refresh all data
  const handleRefreshAll = useCallback(() => {
    // Clear all caches to force fresh data fetch
    clearAllCaches();
    
    // Show toast
    toast({
      title: "Data Refreshed",
      description: "All cached data has been cleared and will be refreshed.",
    });
  }, []);

  // Listen for availability template changes to update scheduler
  useAppEvent("availability.template.changed", (event) => {
    const { staffId } = event.payload;
    
    toast({
      title: "Availability Updated",
      description: `Staff availability has changed. Scheduler updated.`,
    });
    
    // Clear caches to ensure fresh data is fetched
    clearAllCaches();
  }, []);

  // When auto-scheduling results are available, show them in the UI
  useEffect(() => {
    if (autoScheduleResults && autoScheduleResults.tasksScheduled > 0) {
      // Switch to the schedule tab to see newly scheduled tasks
      setActiveTab("schedule");
    }
  }, [autoScheduleResults]);

  return (
    <DragDropContext>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Staff Scheduler</h1>
            <p className="text-muted-foreground">
              Assign tasks to staff and manage schedules
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateDay('prev')}
              className="h-8 w-8"
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
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefreshAll}
              title="Refresh all data"
              className="h-8 w-8 ml-2"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost"
              size="sm"
              onClick={() => setShowMetrics(!showMetrics)}
              className="ml-2"
            >
              {showMetrics ? 'Hide Metrics' : 'Show Metrics'}
            </Button>
          </div>
        </div>

        {/* Error handler for displaying scheduling issues */}
        <SchedulerErrorHandler 
          errors={errorLogs}
          onResolve={handleResolveError}
          onClear={handleClearErrors}
        />
        
        {/* Scheduling metrics (if enabled) */}
        {showMetrics && <SchedulerMetrics />}

        {/* Unified scheduling interface for mode switching */}
        <UnifiedSchedulingInterface
          onModeChange={setSchedulingMode}
          currentMode={schedulingMode}
          selectedTask={selectedTask}
          isGeneratingRecommendations={isGeneratingRecommendations}
          isAutoScheduling={isAutoScheduling}
          onGenerateRecommendations={handleGenerateRecommendations}
          onToggleConfigPanel={() => setShowConfigPanel(!showConfigPanel)}
          showConfigPanel={showConfigPanel}
          autoScheduleResults={autoScheduleResults}
          recommendationsCount={Object.keys(recommendations).length}
        />
        
        {/* Auto-scheduling configuration panel (only shown when in automatic mode) */}
        {schedulingMode === 'automatic' && showConfigPanel && (
          <AutoScheduleConfigPanel
            onSchedule={handleAutoSchedule}
            isScheduling={isAutoScheduling}
          />
        )}
        
        {/* Auto-scheduling results display */}
        {autoScheduleResults && (
          <AutoScheduleResults
            result={autoScheduleResults}
            onClose={() => setAutoScheduleResults(null)}
          />
        )}

        {/* Main tabs for unscheduled tasks and schedule view */}
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
                  onTaskSelect={handleTaskSelect} 
                  tasksWithRecommendations={Object.keys(recommendations)}
                  page={page}
                  pageSize={pageSize}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
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
