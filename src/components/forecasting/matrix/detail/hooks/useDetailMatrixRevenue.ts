import { useState, useEffect, useMemo } from 'react';
import { DetailTaskRevenueCalculator, TaskRevenueResult } from '@/services/forecasting/demand/calculators/detailTaskRevenueCalculator';
import { getAllClients } from '@/services/clientService';
import { getSkillFeeRatesMap } from '@/services/skills/feeRateService';

/**
 * Task interface for revenue calculations
 */
interface Task {
  id: string;
  taskName: string;
  clientName: string;
  clientId: string;
  skillRequired: string;
  monthlyHours: number;
  month: string;
  monthLabel: string;
  recurrencePattern: string;
  priority: string;
  category: string;
  monthlyDistribution?: Record<string, number>;
  totalHours?: number;
  recurringTaskId?: string;
  preferredStaffId?: string | null;
  preferredStaffName?: string;
}

interface UseDetailMatrixRevenueProps {
  /**
   * Tasks to calculate revenue for - should be tasksForRevenue (client + date filtered only)
   */
  tasks: Task[];
  /**
   * Array of months for period calculation
   */
  months: Array<{ key: string; label: string }>;
  /**
   * Whether revenue calculation is enabled (for detail-forecast-matrix view)
   */
  enabled: boolean;
}

interface UseDetailMatrixRevenueResult {
  /**
   * Map of task IDs to revenue calculation results
   */
  revenueData: Map<string, TaskRevenueResult>;
  /**
   * Loading state for revenue calculations
   */
  isLoading: boolean;
  /**
   * Error message if revenue calculation fails
   */
  error: string | null;
  /**
   * Trigger manual recalculation
   */
  recalculate: () => Promise<void>;
}

/**
 * Detail Matrix Revenue Hook - Phase 2 Extraction
 * 
 * Handles all revenue calculation logic for the detail matrix:
 * - Fetches client data and skill fee rates
 * - Calculates apportioned revenue for each task
 * - Manages loading and error states
 * - Uses tasksForRevenue (client + date filtered) for accurate calculations
 */
export const useDetailMatrixRevenue = ({
  tasks,
  months,
  enabled
}: UseDetailMatrixRevenueProps): UseDetailMatrixRevenueResult => {
  
  // Revenue calculation state
  const [revenueData, setRevenueData] = useState<Map<string, TaskRevenueResult>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize calculation dependencies to prevent unnecessary recalculations
  const calculationDeps = useMemo(() => ({
    taskCount: tasks.length,
    taskIds: tasks.map(t => t.id).sort().join(','),
    monthCount: months.length,
    enabled
  }), [tasks, months, enabled]);

  /**
   * Perform revenue calculation
   */
  const calculateRevenue = async () => {
    if (!enabled || !tasks || tasks.length === 0) {
      setRevenueData(new Map());
      return;
    }

    console.log(`💰 [REVENUE HOOK] Starting calculation for ${tasks.length} tasks over ${months.length} months`);
    
    setIsLoading(true);
    setError(null);

    try {
      // Fetch client data with expected monthly revenue
      const clientsData = await getAllClients();
      console.log(`💰 [REVENUE HOOK] Fetched ${clientsData.length} clients`);

      // Get skill fee rates
      const skillFeeRates = await getSkillFeeRatesMap();
      console.log(`💰 [REVENUE HOOK] Fetched ${skillFeeRates.size} skill fee rates`);

      // Calculate the month count for the period
      const monthCount = months.length || 12;

      // Build client revenue data using tasksForRevenue (already filtered correctly)
      const clientRevenueData = DetailTaskRevenueCalculator.buildClientRevenueData(
        clientsData.map(client => ({
          id: client.id,
          legal_name: client.legalName,
          expected_monthly_revenue: client.expectedMonthlyRevenue
        })),
        tasks, // This is tasksForRevenue - client + date filtered only
        monthCount
      );

      console.log(`💰 [REVENUE HOOK] Built revenue data for ${clientRevenueData.size} clients`);

      // Calculate revenue for all tasks using the filtered task set
      const taskRevenueResults = await DetailTaskRevenueCalculator.calculateBulkTaskRevenue(
        tasks, // This is tasksForRevenue - the correct dataset for calculations
        clientRevenueData,
        skillFeeRates
      );

      console.log(`💰 [REVENUE HOOK] Calculated revenue for ${taskRevenueResults.size} tasks`);

      setRevenueData(taskRevenueResults);
      setError(null);

    } catch (err) {
      console.error('💰 [REVENUE HOOK] Revenue calculation error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Revenue calculation failed';
      setError(errorMessage);
      setRevenueData(new Map()); // Clear any partial results
      
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to trigger calculation when dependencies change
  useEffect(() => {
    if (calculationDeps.enabled && calculationDeps.taskCount > 0) {
      calculateRevenue();
    } else {
      // Clear data when disabled or no tasks
      setRevenueData(new Map());
      setError(null);
      setIsLoading(false);
    }
  }, [
    calculationDeps.enabled,
    calculationDeps.taskCount,
    calculationDeps.taskIds,
    calculationDeps.monthCount
  ]);

  return {
    revenueData,
    isLoading,
    error,
    recalculate: calculateRevenue
  };
};