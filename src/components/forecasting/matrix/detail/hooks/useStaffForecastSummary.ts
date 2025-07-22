
import { useState, useEffect, useMemo } from 'react';
import { StaffUtilizationData, MonthInfo } from '@/types/demand';
import { RecurringTaskDB, RecurringTask } from '@/types/task';
import { StaffForecastSummaryService } from '@/services/forecasting/detail/staffForecastSummaryService';
import { getAllRecurringTasks } from '@/services/clientTask/getAllRecurringTasks';
import { mapRecurringTaskToDatabase } from '@/services/clientTask/mappers';

interface UseStaffForecastSummaryOptions {
  months: MonthInfo[];
  selectedSkills: string[];
  selectedClients: string[];
  selectedPreferredStaff: (string | number | null | undefined)[];
  enabled?: boolean;
}

interface UseStaffForecastSummaryResult {
  utilizationData: StaffUtilizationData[];
  isLoading: boolean;
  error: string | null;
  firmTotals: {
    totalDemand: number;
    totalCapacity: number;
    overallUtilization: number;
    totalRevenue: number;
    totalGap: number;
  };
}

/**
 * Hook for Staff Forecast Summary data
 * 
 * Fetches raw recurring tasks directly from database and applies consistent filtering
 */
export const useStaffForecastSummary = ({
  months,
  selectedSkills,
  selectedClients,
  selectedPreferredStaff,
  enabled = true
}: UseStaffForecastSummaryOptions): UseStaffForecastSummaryResult => {
  const [utilizationData, setUtilizationData] = useState<StaffUtilizationData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawTasks, setRawTasks] = useState<RecurringTask[]>([]);

  // Fetch raw recurring tasks from database
  useEffect(() => {
    if (!enabled || months.length === 0) {
      setRawTasks([]);
      return;
    }

    const fetchRawTasks = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log('🔍 [STAFF FORECAST HOOK] Fetching raw recurring tasks from database...');
        
        const tasks = await getAllRecurringTasks(true); // Only active tasks
        
        console.log('✅ [STAFF FORECAST HOOK] Raw tasks fetched:', {
          totalTasks: tasks.length,
          sampleTask: tasks[0] ? {
            id: tasks[0].id,
            name: tasks[0].name,
            estimatedHours: tasks[0].estimatedHours,
            recurrenceType: tasks[0].recurrencePattern?.type,
            preferredStaffId: tasks[0].preferredStaffId
          } : null
        });

        setRawTasks(tasks);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch recurring tasks';
        console.error('❌ [STAFF FORECAST HOOK] Error fetching raw tasks:', err);
        setError(errorMessage);
        setRawTasks([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRawTasks();
  }, [enabled, months.length]);

  // Apply consistent filtering logic (same as Detail Matrix)
  const filteredTasks = useMemo(() => {
    if (!rawTasks.length) return [];

    return rawTasks.filter(task => {
      // Skills filter - check if task's required skills match selected skills
      if (selectedSkills.length > 0) {
        const taskSkills = task.requiredSkills || [];
        const hasMatchingSkill = taskSkills.some(skill => selectedSkills.includes(skill));
        if (!hasMatchingSkill) {
          return false;
        }
      }

      // Clients filter - check if task's client is in selected clients
      if (selectedClients.length > 0 && !selectedClients.includes(task.clientId)) {
        return false;
      }

      // Preferred Staff filter - check if task's preferred staff is in selected staff
      if (selectedPreferredStaff.length > 0) {
        const staffFilters = selectedPreferredStaff.filter(Boolean);
        if (staffFilters.length > 0) {
          const taskStaffId = task.preferredStaffId;
          if (!taskStaffId || !staffFilters.includes(taskStaffId)) {
            return false;
          }
        }
      }

      return true;
    });
  }, [rawTasks, selectedSkills, selectedClients, selectedPreferredStaff]);

  // Convert filtered RecurringTask[] to RecurringTaskDB[] format expected by service
  const convertedTasks = useMemo(() => {
    return filteredTasks.map(task => mapRecurringTaskToDatabase(task));
  }, [filteredTasks]);

  // Generate forecast periods matching the months array
  const stableForecastPeriods = useMemo(() => {
    return months.map(month => ({
      id: month.key,
      period: month.label,
      label: month.label,
      startDate: month.startDate || new Date(),
      endDate: month.endDate || new Date(),
      type: 'virtual' as const,
      demand: [] as Array<{ skill: string; hours: number }>, // Empty skills array for now
      capacity: [] as Array<{ skill: string; hours: number }>
    }));
  }, [months]);

  // Calculate staff utilization with raw tasks
  useEffect(() => {
    if (!enabled || convertedTasks.length === 0 || months.length === 0) {
      setUtilizationData([]);
      setError(null);
      return;
    }

    const calculateUtilization = async () => {
      setIsLoading(true);
      setError(null);

      // Add timeout protection
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        setIsLoading(false);
        console.error('Staff utilization calculation timed out after 30 seconds');
        setError('Calculation timed out. Please try again.');
      }, 30000);

      try {
        console.log('🚀 [STAFF FORECAST HOOK] Calculating staff utilization from raw tasks:', {
          rawTaskCount: convertedTasks.length,
          monthCount: months.length,
          filters: {
            skills: selectedSkills.length,
            clients: selectedClients.length,
            staff: selectedPreferredStaff.filter(Boolean).length
          },
          sampleTask: convertedTasks[0] ? {
            id: convertedTasks[0].id,
            name: convertedTasks[0].name,
            estimatedHours: convertedTasks[0].estimated_hours,
            recurrenceType: convertedTasks[0].recurrence_type,
            preferredStaffId: convertedTasks[0].preferred_staff_id
          } : null
        });

        const result = await StaffForecastSummaryService.calculateStaffUtilization(
          stableForecastPeriods,
          convertedTasks,
          months
        );

        setUtilizationData(result);
        setError(null);

        console.log('✅ [STAFF FORECAST HOOK] Utilization calculation complete:', {
          staffCount: result.length,
          totalStaff: result.filter(s => s.staffId !== 'unassigned').length,
          unassignedTasks: result.find(s => s.staffId === 'unassigned')?.totalHours || 0,
          anaFlorian: result.find(s => s.staffName.includes('Ana Florian'))?.totalHours || 0
        });

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error('❌ [STAFF FORECAST HOOK] Calculation failed:', err);
        setError(errorMessage);
        setUtilizationData([]);
      } finally {
        clearTimeout(timeoutId);
        setIsLoading(false);
      }
    };

    calculateUtilization();
  }, [
    enabled,
    convertedTasks.length,
    months.length,
    selectedSkills.length,
    selectedClients.length,
    selectedPreferredStaff.filter(Boolean).length
  ]);

  // Calculate firm totals
  const firmTotals = useMemo(() => {
    if (utilizationData.length === 0) {
      return {
        totalDemand: 0,
        totalCapacity: 0,
        overallUtilization: 0,
        totalRevenue: 0,
        totalGap: 0
      };
    }

    return StaffForecastSummaryService.calculateFirmWideTotals(utilizationData);
  }, [utilizationData]);

  return {
    utilizationData,
    isLoading,
    error,
    firmTotals
  };
};
