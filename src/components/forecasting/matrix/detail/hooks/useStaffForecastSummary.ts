import { useState, useEffect, useMemo } from 'react';
import { StaffUtilizationData, MonthInfo } from '@/types/demand';
import { ForecastData } from '@/types/forecasting';
import { RecurringTaskDB } from '@/types/task';
import { StaffForecastSummaryService } from '@/services/forecasting/detail/staffForecastSummaryService';

interface UseStaffForecastSummaryOptions {
  tasks: any[]; // Task data from DetailMatrixData
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
 * Integrates with existing filter system and provides staff utilization calculations
 */
export const useStaffForecastSummary = ({
  tasks,
  months,
  selectedSkills,
  selectedClients,
  selectedPreferredStaff,
  enabled = true
}: UseStaffForecastSummaryOptions): UseStaffForecastSummaryResult => {
  const [utilizationData, setUtilizationData] = useState<StaffUtilizationData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter tasks based on current filter selections
  const filteredTasks = useMemo(() => {
    if (!tasks || !enabled) return [];

    return tasks.filter(task => {
      // Skills filter
      if (selectedSkills.length > 0 && !selectedSkills.includes(task.skillRequired)) {
        return false;
      }

      // Clients filter
      if (selectedClients.length > 0 && !selectedClients.includes(task.clientId)) {
        return false;
      }

      // Preferred Staff filter
      if (selectedPreferredStaff.length > 0) {
        const staffFilters = selectedPreferredStaff.filter(Boolean);
        if (staffFilters.length > 0 && !staffFilters.includes(task.preferredStaffId)) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, selectedSkills, selectedClients, selectedPreferredStaff, enabled]);

  // Stabilize dependencies to prevent re-render loops
  const stableRecurringTasks = useMemo(() => {
    return filteredTasks.map(task => {
      // PHASE 4: Verify Staff Forecast Summary Hook - Add validation logging
      const estimatedHours = (() => {
        const hours = task.monthlyHours || 0;
        
        // Log Ana's tasks to verify the fix
        if (task.preferredStaffName?.includes('Ana Florian') && task.taskName.includes('Monthly Bookkeeping')) {
          console.log(`🎯 [STAFF SUMMARY VALIDATION] Ana's task: ${task.taskName}`, {
            monthlyHours: task.monthlyHours,  // Should be 1.0 for monthly bookkeeping
            totalHours: task.totalHours,      // Should be 12+ for yearly total
            using: hours                      // Should use monthlyHours (1.0)
          });
        }
        
        // Safety check - per-occurrence hours should never be > 100
        if (hours > 100) {
          console.error(`❌ [ERROR] Task ${task.taskName} has invalid monthlyHours: ${hours}`);
          return 1; // Fallback to 1 hour
        }
        
        return hours || 1; // Default to 1 if still 0
      })();

      return {
        id: task.id,
        name: task.taskName,
        client_id: task.clientId,
        estimated_hours: estimatedHours, // Use the validated hours
        recurrence_type: task.recurrencePattern?.toLowerCase() || 'monthly',
        preferred_staff_id: task.preferredStaffId || null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        template_id: task.id,
        due_date: null,
        recurrence_interval: 1,
        weekdays: null,
        day_of_month: null,
        month_of_year: null,
        end_date: null,
        custom_offset_days: null,
        last_generated_date: null,
        weekdays_for_daily: null,
        notes: null,
        description: task.description || null,
        required_skills: [task.skillRequired],
        priority: task.priority || 'medium',
        category: task.category || 'general',
        status: 'Unscheduled' as const
      };
    }) as unknown as RecurringTaskDB[];
  }, [JSON.stringify(filteredTasks?.map(t => t.id))]);

  const stableForecastPeriods = useMemo(() => {
    return months.map(month => ({
      id: month.key,
      period: month.label,
      label: month.label,
      startDate: month.startDate || new Date(),
      endDate: month.endDate || new Date(),
      type: 'virtual' as const,
      demand: 0,
      capacity: 0
    })) as unknown as ForecastData[];
  }, [JSON.stringify(months)]);

  // Calculate staff utilization with optimized dependencies and timeout
  useEffect(() => {
    if (!enabled || stableRecurringTasks.length === 0 || months.length === 0) {
      setUtilizationData([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    const calculateUtilization = async () => {
      setIsLoading(true);
      setError(null);

      // Add 30-second overall timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        setIsLoading(false);
        console.error('Staff utilization calculation timed out after 30 seconds');
        setError('Calculation timed out. Please try again.');
      }, 30000);

      try {
        console.log('🚀 [STAFF FORECAST HOOK] Calculating staff utilization:', {
          taskCount: stableRecurringTasks.length,
          monthCount: months.length,
          filters: {
            skills: selectedSkills.length,
            clients: selectedClients.length,
            staff: selectedPreferredStaff.filter(Boolean).length
          }
        });

        const result = await StaffForecastSummaryService.calculateStaffUtilization(
          stableForecastPeriods,
          stableRecurringTasks,
          months
        );

        setUtilizationData(result);
        setError(null);

        console.log('✅ [STAFF FORECAST HOOK] Utilization calculation complete:', {
          staffCount: result.length,
          totalStaff: result.filter(s => s.staffId !== 'unassigned').length,
          unassignedTasks: result.find(s => s.staffId === 'unassigned')?.totalHours || 0
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
    stableRecurringTasks.length, // Use length instead of full array
    months.length,
    selectedSkills.length,
    selectedClients.length,
    selectedPreferredStaff.filter(Boolean).length
  ]);

  // Add cleanup on unmount
  useEffect(() => {
    return () => {
      // Cancel any pending calculations on unmount
      setIsLoading(false);
    };
  }, []);

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
