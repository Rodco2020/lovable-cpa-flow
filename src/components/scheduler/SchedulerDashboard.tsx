import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UnscheduledTaskList from "@/components/scheduler/UnscheduledTaskList";
import StaffScheduleView from "@/components/scheduler/StaffScheduleView";
import { useAppEvent } from "@/hooks/useAppEvent";
import { toast } from "@/services/toastService";
import DragDropContext from "./DragDropContext";
import RecommendationPanel from "./RecommendationPanel";
import { Separator } from "@/components/ui/separator";
import AutoScheduleConfigPanel from "./AutoScheduleConfigPanel";
import AutoScheduleResults from "./AutoScheduleResults";
import SchedulerErrorHandler from "./SchedulerErrorHandler";
import SchedulerMetrics from "./SchedulerMetrics";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useSchedulerKeyboardShortcuts } from "@/hooks/useSchedulerKeyboardShortcuts";
import KeyboardShortcutHelp from "@/components/scheduler/KeyboardShortcutHelp";
import UnifiedSchedulingInterface, { SchedulingMode } from "./UnifiedSchedulingInterface";
import SchedulerHeader from "./SchedulerHeader";
import { useRecommendationsManager } from "./RecommendationsManager";
import { useAutoScheduleManager } from "./AutoScheduleManager";
import { useErrorManager } from "./ErrorManager";
import { useTaskSelectionManager } from "./TaskSelectionManager";
import { useCacheManager } from "./CacheManager";
import { useDateNavigator } from "./DateNavigator";
import { TaskInstance } from "@/types/task";

/**
 * Main dashboard component for the Scheduler Module
 * Integrates all scheduler functionality into a unified interface
 */
const SchedulerDashboard: React.FC = () => {
  // Custom hooks for managing different aspects of the scheduler
  const { currentDate, navigateDay } = useDateNavigator();
  const { handleRefreshAll } = useCacheManager();
  const { errorLogs, handleResolveError, handleClearErrors } = useErrorManager();
  const { 
    selectedTask, setSelectedTask, activeTab, setActiveTab, handleTaskSelect 
  } = useTaskSelectionManager();
  const {
    recommendations, setRecommendations, showRecommendations, setShowRecommendations,
    selectedTaskRecommendations, setSelectedTaskRecommendations, isGeneratingRecommendations,
    generateRecommendations, handleRecommendationApplied
  } = useRecommendationsManager();
  const {
    autoScheduleResults, setAutoScheduleResults, isAutoScheduling,
    showConfigPanel, setShowConfigPanel, handleAutoSchedule
  } = useAutoScheduleManager();
  
  // Local state
  const [schedulingMode, setSchedulingMode] = useLocalStorage<SchedulingMode>(
    'preferred-scheduling-mode', 'manual'
  );
  const [showMetrics, setShowMetrics] = useLocalStorage('show-scheduling-metrics', false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useLocalStorage('task-list-page-size', 10);
  const [lastAvailabilityEventTime, setLastAvailabilityEventTime] = useState<number>(0);
  const AVAILABILITY_EVENT_COOLDOWN = 3000; // 3 seconds minimum between handling availability events

  // Initialize keyboard shortcuts
  const { showHelpOverlay } = useSchedulerKeyboardShortcuts({
    onRefresh: handleRefreshAll,
    onNextDay: () => navigateDay('next'),
    onPrevDay: () => navigateDay('prev'),
    onToggleMode: setSchedulingMode,
    onShowHelp: () => setShowKeyboardHelp(true),
    enabled: true,
  });

  // Handle task selection
  const onTaskSelect = (task: TaskInstance) => {
    handleTaskSelect(task, recommendations, setSelectedTaskRecommendations, setShowRecommendations);
  };

  // Handle recommendations generation
  const handleGenerateRecommendations = async () => {
    const newRecommendations = await generateRecommendations();
    
    // If no task is selected but we have recommendations, auto-select the first task
    if (!selectedTask && Object.keys(newRecommendations).length > 0) {
      const firstTaskId = Object.keys(newRecommendations)[0];
      
      // Set selected task recommendations
      setSelectedTaskRecommendations(newRecommendations[firstTaskId]);
      setShowRecommendations(true);
      
      // Switch to schedule tab
      setActiveTab("schedule");
    }
  };

  // Handle recommendation application
  const onRecommendationApplied = () => {
    handleRecommendationApplied(selectedTask);
    setSelectedTask(null);
  };

  // Listen for availability template changes to update scheduler
  useAppEvent("availability.template.changed", (event) => {
    const now = Date.now();
    
    // Prevent rapid successive event handling
    if (now - lastAvailabilityEventTime < AVAILABILITY_EVENT_COOLDOWN) {
      console.log('[Availability] Event handling throttled');
      return;
    }
    
    setLastAvailabilityEventTime(now);
    
    toast.info("Availability Updated", "Staff availability has changed. Scheduler updated.");
    
    // Clear caches to ensure fresh data is fetched
    handleRefreshAll();
  }, [lastAvailabilityEventTime, handleRefreshAll]);

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
        <SchedulerHeader 
          title="Staff Scheduler"
          subtitle="Assign tasks to staff and manage schedules"
          currentDate={currentDate}
          onPrevDay={() => navigateDay('prev')}
          onNextDay={() => navigateDay('next')}
          onRefreshAll={handleRefreshAll}
          onToggleMetrics={() => setShowMetrics(!showMetrics)}
          showMetrics={showMetrics}
          onShowKeyboardHelp={() => setShowKeyboardHelp(true)}
        />

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
                  onTaskSelect={onTaskSelect} 
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
        
        <KeyboardShortcutHelp
          isOpen={showKeyboardHelp}
          onOpenChange={setShowKeyboardHelp}
        />
      </div>
    </DragDropContext>
  );
};

export default SchedulerDashboard;
