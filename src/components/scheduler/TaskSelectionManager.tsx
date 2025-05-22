
import React, { useState } from 'react';
import { TaskInstance } from '@/types/task';
import { StaffTaskRecommendation } from '@/services/schedulerService';

/**
 * Hook for managing task selection in the scheduler
 */
export const useTaskSelectionManager = () => {
  const [selectedTask, setSelectedTask] = useState<TaskInstance | null>(null);
  const [activeTab, setActiveTab] = useState("unscheduled");
  
  // Handle task selection
  const handleTaskSelect = (
    task: TaskInstance,
    recommendations: Record<string, StaffTaskRecommendation[]>,
    setSelectedTaskRecommendations: (recs: StaffTaskRecommendation[]) => void,
    setShowRecommendations: (show: boolean) => void
  ) => {
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
  
  return {
    selectedTask,
    setSelectedTask,
    activeTab, 
    setActiveTab,
    handleTaskSelect
  };
};
