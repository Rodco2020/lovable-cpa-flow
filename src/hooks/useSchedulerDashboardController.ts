
import { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useDateNavigator } from '@/components/scheduler/DateNavigator';
import { useCacheManager } from '@/components/scheduler/CacheManager';
import { useErrorManager } from '@/components/scheduler/ErrorManager';
import { useTaskSelectionManager } from '@/components/scheduler/TaskSelectionManager';
import { useRecommendationsManager } from '@/components/scheduler/RecommendationsManager';
import { useAutoScheduleManager } from '@/components/scheduler/AutoScheduleManager';
import { useSchedulerKeyboardShortcuts } from '@/hooks/useSchedulerKeyboardShortcuts';
import { useAppEvent } from '@/hooks/useAppEvent';
import { toast } from '@/services/toastService';
import { TaskInstance } from '@/types/task';
import { SchedulingMode } from '@/components/scheduler/UnifiedSchedulingInterface';

/**
 * Custom hook that combines all scheduler dashboard functionality
 * This reduces the complexity of the SchedulerDashboard component
 * by moving state management and business logic to this hook
 */
export const useSchedulerDashboardController = () => {
  // Date navigation
  const { currentDate, navigateDay } = useDateNavigator();

  // Cache management
  const { handleRefreshAll } = useCacheManager();

  // Error handling
  const { errorLogs, handleResolveError, handleClearErrors } = useErrorManager();

  // Task selection
  const { 
    selectedTask, setSelectedTask, activeTab, setActiveTab, handleTaskSelect 
  } = useTaskSelectionManager();

  // Recommendations management
  const {
    recommendations, setRecommendations, showRecommendations, setShowRecommendations,
    selectedTaskRecommendations, setSelectedTaskRecommendations, isGeneratingRecommendations,
    generateRecommendations, handleRecommendationApplied
  } = useRecommendationsManager();

  // Auto-scheduling
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

    return newRecommendations;
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
  
  return {
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
  };
};
