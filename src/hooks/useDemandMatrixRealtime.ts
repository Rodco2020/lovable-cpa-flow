
import { useEffect, useCallback } from 'react';
import eventService from '@/services/eventService';
import { DemandMatrixService } from '@/services/forecasting/demandMatrixService';
import { useToast } from '@/components/ui/use-toast';

interface UseDemandMatrixRealtimeProps {
  onDataChange: () => void;
  isEnabled?: boolean;
}

/**
 * Hook for real-time demand matrix updates
 * Listens to relevant events and triggers data refreshes
 */
export const useDemandMatrixRealtime = ({
  onDataChange,
  isEnabled = true
}: UseDemandMatrixRealtimeProps) => {
  const { toast } = useToast();

  const handleTaskEvent = useCallback((event: any) => {
    console.log('Demand matrix: Task event received', event.type, event.payload);
    
    // Clear cache to ensure fresh data
    DemandMatrixService.clearCache();
    
    // Trigger data refresh
    onDataChange();
    
    // Show subtle notification
    toast({
      title: "Demand data updated",
      description: "Task changes detected, matrix refreshed",
      duration: 3000
    });
  }, [onDataChange, toast]);

  const handleClientEvent = useCallback((event: any) => {
    console.log('Demand matrix: Client event received', event.type, event.payload);
    
    // Clear cache and refresh for client changes
    DemandMatrixService.clearCache();
    onDataChange();
    
    toast({
      title: "Client data updated",
      description: "Client changes may affect demand forecasts",
      duration: 3000
    });
  }, [onDataChange, toast]);

  const handleForecastEvent = useCallback((event: any) => {
    console.log('Demand matrix: Forecast recalculation triggered', event.payload);
    
    // Force refresh for forecast recalculations
    DemandMatrixService.clearCache();
    onDataChange();
  }, [onDataChange]);

  useEffect(() => {
    if (!isEnabled) return;

    console.log('Setting up demand matrix real-time listeners');

    // Subscribe to task-related events
    const taskSubscriptions = [
      eventService.subscribe('task.scheduled', handleTaskEvent),
      eventService.subscribe('task.unscheduled', handleTaskEvent),
      eventService.subscribe('task.completed', handleTaskEvent)
    ];

    // Subscribe to forecast events
    const forecastSubscription = eventService.subscribe('forecast.recalculated', handleForecastEvent);

    // Return cleanup function
    return () => {
      console.log('Cleaning up demand matrix real-time listeners');
      taskSubscriptions.forEach(unsubscribe => unsubscribe());
      forecastSubscription();
    };
  }, [isEnabled, handleTaskEvent, handleClientEvent, handleForecastEvent]);

  return {
    // Expose manual refresh capability
    refreshData: useCallback(() => {
      DemandMatrixService.clearCache();
      onDataChange();
    }, [onDataChange])
  };
};
