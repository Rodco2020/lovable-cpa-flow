
import React, { useState } from 'react';
import { AutoScheduleResult, autoScheduleTasks } from '@/services/autoSchedulerService';
import { toast } from '@/components/ui/use-toast';

/**
 * Hook for managing auto-scheduling functionality
 */
export const useAutoScheduleManager = () => {
  const [autoScheduleResults, setAutoScheduleResults] = useState<AutoScheduleResult | null>(null);
  const [isAutoScheduling, setIsAutoScheduling] = useState(false);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  
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
      
      return result;
    } catch (error) {
      console.error("Auto-scheduling failed:", error);
      toast({
        title: "Error",
        description: "Automatic scheduling failed. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsAutoScheduling(false);
    }
  };
  
  return {
    autoScheduleResults,
    setAutoScheduleResults,
    isAutoScheduling,
    setIsAutoScheduling,
    showConfigPanel,
    setShowConfigPanel,
    handleAutoSchedule
  };
};
