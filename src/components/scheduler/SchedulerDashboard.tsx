
import React, { useEffect } from "react";
import DragDropContext from "./DragDropContext";
import AutoScheduleConfigPanel from "./AutoScheduleConfigPanel";
import AutoScheduleResults from "./AutoScheduleResults";
import SchedulerErrorHandler from "./SchedulerErrorHandler";
import SchedulerMetrics from "./SchedulerMetrics";
import KeyboardShortcutHelp from "@/components/scheduler/KeyboardShortcutHelp";
import UnifiedSchedulingInterface from "./UnifiedSchedulingInterface";
import SchedulerHeader from "./SchedulerHeader";
import SchedulerTabs from "./SchedulerTabs";
import { useSchedulerDashboardController } from "@/hooks/useSchedulerDashboardController";

/**
 * Main dashboard component for the Scheduler Module
 * Integrates all scheduler functionality into a unified interface
 */
const SchedulerDashboard: React.FC = () => {
  // Use our custom hook to manage all state and logic
  const {
    // Date navigation
    currentDate,
    navigateDay,
    
    // Cache management
    handleRefreshAll,
    
    // Error handling
    errorLogs,
    handleResolveError,
    handleClearErrors,
    
    // Task selection
    selectedTask,
    setSelectedTask,
    activeTab,
    setActiveTab,
    onTaskSelect,
    
    // Recommendations
    recommendations,
    showRecommendations,
    setShowRecommendations,
    selectedTaskRecommendations,
    isGeneratingRecommendations,
    handleGenerateRecommendations,
    onRecommendationApplied,
    
    // Auto-scheduling
    autoScheduleResults,
    setAutoScheduleResults,
    isAutoScheduling,
    showConfigPanel,
    setShowConfigPanel,
    handleAutoSchedule,
    
    // Local state
    schedulingMode,
    setSchedulingMode,
    showMetrics,
    setShowMetrics,
    showKeyboardHelp,
    setShowKeyboardHelp,
    page,
    setPage,
    pageSize,
    setPageSize
  } = useSchedulerDashboardController();

  // When auto-scheduling results are available, show them in the UI
  useEffect(() => {
    if (autoScheduleResults && autoScheduleResults.tasksScheduled > 0) {
      // Switch to the schedule tab to see newly scheduled tasks
      setActiveTab("schedule");
    }
  }, [autoScheduleResults, setActiveTab]);

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
        <SchedulerTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedTask={selectedTask}
          currentDate={currentDate}
          showRecommendations={showRecommendations}
          selectedTaskRecommendations={selectedTaskRecommendations}
          onRecommendationApplied={onRecommendationApplied}
          setShowRecommendations={setShowRecommendations}
          onTaskSelect={onTaskSelect}
          tasksWithRecommendations={Object.keys(recommendations)}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
        
        <KeyboardShortcutHelp
          isOpen={showKeyboardHelp}
          onOpenChange={setShowKeyboardHelp}
        />
      </div>
    </DragDropContext>
  );
};

export default SchedulerDashboard;
