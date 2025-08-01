import { ClientRevenueCalculator } from '../matrixTransformer/clientRevenueCalculator';
import { getSkillFeeRatesMap, getDefaultFeeRates } from '@/services/skills/feeRateService';

/**
 * Task interface for revenue calculations
 */
export interface Task {
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
  monthlyDistribution?: Record<string, number>; // New aggregated format (optional for backward compatibility)
  totalHours?: number; // Sum of all monthly hours - main field for revenue calculations (optional for backward compatibility)
  recurringTaskId?: string; // For unique identification (optional for backward compatibility)
  totalExpectedRevenue?: number;
  expectedHourlyRate?: number;
  totalSuggestedRevenue?: number;
  expectedLessSuggested?: number;
}

/**
 * Task revenue calculation result
 */
export interface TaskRevenueResult {
  totalHours: number;
  totalExpectedRevenue: number;
  expectedHourlyRate: number;
  totalSuggestedRevenue: number;
  expectedLessSuggested: number;
  skillFeeRate: number;
  apportionmentPercentage: number;
}

/**
 * Aggregated client data for revenue calculations
 */
export interface ClientRevenueData {
  clientName: string;
  clientId: string;
  totalHours: number;
  expectedMonthlyRevenue: number;
  totalExpectedRevenue: number; // Over the calculation period
}

/**
 * Detail Task Revenue Calculator - Phase 2
 * 
 * Calculates individual task revenue using apportionment methodology:
 * - Distributes client expected revenue proportionally based on task hours
 * - Compares against skill-based suggested revenue rates
 * - Provides detailed breakdown for profitability analysis
 */
export class DetailTaskRevenueCalculator {
  
  /**
   * Calculate revenue for a single task using apportionment method
   * 
   * @param task - The task to calculate revenue for
   * @param clientTotalHours - Total hours for this client across all tasks
   * @param clientExpectedRevenue - Client's total expected revenue for the period
   * @param skillFeeRate - Fee rate for the required skill
   * @returns TaskRevenueResult with detailed revenue breakdown
   */
  static calculateTaskRevenue(
    task: Task,
    clientTotalHours: number,
    clientExpectedRevenue: number,
    skillFeeRate: number
  ): TaskRevenueResult {
    // Enhanced validation with detailed error handling
    if (!task || typeof task.monthlyHours !== 'number') {
      console.error(`[DETAIL TASK REVENUE] Invalid task:`, { task });
      throw new Error('Invalid task or missing monthlyHours');
    }
    
    // Handle missing or zero client data gracefully
    if (clientTotalHours <= 0) {
      console.warn(`[DETAIL TASK REVENUE] Zero client hours for ${task.clientName} - using zero revenue`);
      return this.createZeroRevenueResult(task, skillFeeRate);
    }

    if (clientExpectedRevenue < 0) {
      console.warn(`[DETAIL TASK REVENUE] Negative client revenue for ${task.clientName} - using zero`);
      clientExpectedRevenue = 0;
    }

    // Handle missing skill fee rate
    if (skillFeeRate <= 0) {
      console.warn(`[DETAIL TASK REVENUE] Missing or zero skill fee rate for ${task.skillRequired} - using default $75`);
      skillFeeRate = 75.00; // Default fallback rate
    }

    const taskHours = task.totalHours || task.monthlyHours;
    
    // Prevent division by zero and handle edge cases
    if (taskHours <= 0) {
      console.warn(`[DETAIL TASK REVENUE] Zero task hours for ${task.taskName} - using zero revenue`);
      return this.createZeroRevenueResult(task, skillFeeRate);
    }
    
    // Apportionment calculation with safe math
    const apportionmentPercentage = Math.min(taskHours / clientTotalHours, 1.0); // Cap at 100%
    const totalExpectedRevenue = Math.max(apportionmentPercentage * clientExpectedRevenue, 0);
    const expectedHourlyRate = totalExpectedRevenue / taskHours; // Safe division - taskHours > 0 guaranteed
    const totalSuggestedRevenue = Math.max(taskHours * skillFeeRate, 0);
    const expectedLessSuggested = totalExpectedRevenue - totalSuggestedRevenue;
    
    // Enhanced logging with error detection
    const hasWarnings = clientExpectedRevenue === 0 || skillFeeRate === 75.00 || apportionmentPercentage > 0.8;
    const logLevel = hasWarnings ? '⚠️' : '💰';
    
    console.log(`${logLevel} [DETAIL TASK REVENUE] ${task.taskName} (${task.clientName}):`, {
      taskHours,
      apportionmentPercentage: `${(apportionmentPercentage * 100).toFixed(2)}%`,
      totalExpectedRevenue: `$${totalExpectedRevenue.toFixed(2)}`,
      expectedHourlyRate: `$${expectedHourlyRate.toFixed(2)}/hr`,
      totalSuggestedRevenue: `$${totalSuggestedRevenue.toFixed(2)}`,
      expectedLessSuggested: `$${expectedLessSuggested.toFixed(2)}`,
      warnings: {
        zeroClientRevenue: clientExpectedRevenue === 0,
        defaultSkillRate: skillFeeRate === 75.00,
        highApportionment: apportionmentPercentage > 0.8
      }
    });

    return {
      totalHours: taskHours,
      totalExpectedRevenue,
      expectedHourlyRate,
      totalSuggestedRevenue,
      expectedLessSuggested,
      skillFeeRate,
      apportionmentPercentage
    };
  }

  /**
   * Calculate revenue for multiple tasks efficiently
   * 
   * @param tasks - Array of tasks to calculate revenue for
   * @param clientRevenueData - Map of client revenue data
   * @param skillFeeRates - Map of skill names to fee rates
   * @returns Map of task IDs to revenue results
   */
  static async calculateBulkTaskRevenue(
    tasks: Task[],
    clientRevenueData: Map<string, ClientRevenueData>,
    skillFeeRates?: Map<string, number>
  ): Promise<Map<string, TaskRevenueResult>> {
    console.log(`💰 [BULK TASK REVENUE] Processing ${tasks.length} tasks`);
    
    // Get skill fee rates if not provided
    let feeRatesMap = skillFeeRates;
    if (!feeRatesMap) {
      try {
        feeRatesMap = await getSkillFeeRatesMap();
      } catch (error) {
        console.warn('Failed to fetch skill fee rates, using defaults:', error);
        const defaultRates = getDefaultFeeRates();
        feeRatesMap = new Map(Object.entries(defaultRates));
      }
    }

    const results = new Map<string, TaskRevenueResult>();
    let processedCount = 0;
    let errorCount = 0;

    for (const task of tasks) {
      try {
        // DIAGNOSTIC LOG #5: Check client matching in task loop
        const clientData = clientRevenueData.get(task.clientName);
        if (task.taskName.includes('Ana') || task.clientName.includes('Ana') || task.clientName.includes('Florian')) {
          console.log(`🔍 [DIAGNOSTIC TASK] Ana Florian task processing:`, {
            taskName: task.taskName,
            taskClientName: task.clientName,
            taskClientId: task.clientId,
            clientDataFound: !!clientData,
            availableClientNames: Array.from(clientRevenueData.keys()),
            clientDataDetails: clientData ? {
              totalHours: clientData.totalHours,
              totalExpectedRevenue: clientData.totalExpectedRevenue
            } : null
          });
        }
        
        if (!clientData) {
          console.warn(`[BULK TASK REVENUE] No client data for ${task.clientName} - using zero revenue for task ${task.taskName}`);
          const fallbackSkillRate = feeRatesMap.get(task.skillRequired) || 75.00;
          results.set(task.id, this.createZeroRevenueResult(task, fallbackSkillRate));
          continue;
        }

        const skillFeeRate = feeRatesMap.get(task.skillRequired);
        if (!skillFeeRate || skillFeeRate <= 0) {
          console.warn(`[BULK TASK REVENUE] Missing skill fee rate for ${task.skillRequired} - using default $75`);
        }
        const finalSkillRate = skillFeeRate && skillFeeRate > 0 ? skillFeeRate : 75.00;
        
        const revenueResult = this.calculateTaskRevenue(
          task,
          clientData.totalHours,
          clientData.totalExpectedRevenue,
          finalSkillRate
        );

        results.set(task.id, revenueResult);
        processedCount++;

      } catch (error) {
        console.error(`[BULK TASK REVENUE] Error processing task ${task.id} (${task.taskName}):`, error);
        const fallbackSkillRate = feeRatesMap.get(task.skillRequired) || 75.00;
        results.set(task.id, this.createZeroRevenueResult(task, fallbackSkillRate));
        errorCount++;
      }
    }

    console.log(`💰 [BULK TASK REVENUE] Complete: ${processedCount} processed, ${errorCount} errors`);
    return results;
  }

  /**
   * Build client revenue data from client information and time period
   * 
   * @param clients - Array of client data with expected monthly revenue
   * @param tasks - Array of tasks to calculate total hours per client
   * @param monthCount - Number of months in the calculation period
   * @returns Map of client names to aggregated revenue data
   */
  static buildClientRevenueData(
    clients: Array<{ id: string; legal_name: string; expected_monthly_revenue: number }>,
    tasks: Task[],
    monthCount: number = 1
  ): Map<string, ClientRevenueData> {
    console.log(`📊 [CLIENT REVENUE DATA] Building data for ${clients.length} clients over ${monthCount} months`);
    
    const clientRevenueData = new Map<string, ClientRevenueData>();
    
    // Initialize client data
    clients.forEach(client => {
      if (client.legal_name && typeof client.expected_monthly_revenue === 'number') {
        clientRevenueData.set(client.legal_name, {
          clientName: client.legal_name,
          clientId: client.id,
          totalHours: 0,
          expectedMonthlyRevenue: client.expected_monthly_revenue,
          totalExpectedRevenue: client.expected_monthly_revenue * monthCount
        });
      }
    });

    // Aggregate task hours per client
    tasks.forEach(task => {
      const clientData = clientRevenueData.get(task.clientName);
      if (clientData) {
        const taskHours = task.totalHours || task.monthlyHours || 0;
        clientData.totalHours += taskHours;
      }
    });

    // Log results
    clientRevenueData.forEach((data, clientName) => {
      console.log(`📊 [CLIENT REVENUE DATA] ${clientName}: ${data.totalHours}h, $${data.expectedMonthlyRevenue}/month × ${monthCount} = $${data.totalExpectedRevenue}`);
    });

    return clientRevenueData;
  }

  /**
   * Generate summary statistics for task revenue calculations
   * 
   * @param revenueResults - Map of task revenue results
   * @returns Summary statistics object
   */
  static generateRevenueSummary(
    revenueResults: Map<string, TaskRevenueResult>
  ): {
    totalTasks: number;
    totalHours: number;
    totalExpectedRevenue: number;
    totalSuggestedRevenue: number;
    totalExpectedLessSuggested: number;
    averageExpectedHourlyRate: number;
    profitableTasks: number;
    unprofitableTasks: number;
  } {
    const results = Array.from(revenueResults.values());
    
    const summary = {
      totalTasks: results.length,
      totalHours: results.reduce((sum, r) => sum + r.totalHours, 0),
      totalExpectedRevenue: results.reduce((sum, r) => sum + r.totalExpectedRevenue, 0),
      totalSuggestedRevenue: results.reduce((sum, r) => sum + r.totalSuggestedRevenue, 0),
      totalExpectedLessSuggested: results.reduce((sum, r) => sum + r.expectedLessSuggested, 0),
      averageExpectedHourlyRate: 0,
      profitableTasks: results.filter(r => r.expectedLessSuggested > 0).length,
      unprofitableTasks: results.filter(r => r.expectedLessSuggested < 0).length
    };

    summary.averageExpectedHourlyRate = summary.totalHours > 0 
      ? summary.totalExpectedRevenue / summary.totalHours 
      : 0;

    console.log('📈 [REVENUE SUMMARY]', {
      tasks: summary.totalTasks,
      hours: `${summary.totalHours.toFixed(1)}h`,
      expectedRevenue: `$${summary.totalExpectedRevenue.toLocaleString()}`,
      suggestedRevenue: `$${summary.totalSuggestedRevenue.toLocaleString()}`,
      difference: `$${summary.totalExpectedLessSuggested.toLocaleString()}`,
      avgRate: `$${summary.averageExpectedHourlyRate.toFixed(2)}/hr`,
      profitable: `${summary.profitableTasks}/${summary.totalTasks}`
    });

    return summary;
  }

  /**
   * Create a zero revenue result for error cases
   * 
   * @param task - The task object
   * @param skillFeeRate - The skill fee rate (may be 0 if unknown)
   * @returns TaskRevenueResult with zero values
   */
  private static createZeroRevenueResult(task: Task, skillFeeRate: number): TaskRevenueResult {
    return {
      totalHours: task.totalHours || task.monthlyHours || 0,
      totalExpectedRevenue: 0,
      expectedHourlyRate: 0,
      totalSuggestedRevenue: 0,
      expectedLessSuggested: 0,
      skillFeeRate,
      apportionmentPercentage: 0
    };
  }

  /**
   * Validate task revenue calculation inputs
   * 
   * @param task - Task to validate
   * @param clientTotalHours - Client total hours
   * @param clientExpectedRevenue - Client expected revenue
   * @param skillFeeRate - Skill fee rate
   * @throws Error if validation fails
   */
  private static validateInputs(
    task: Task,
    clientTotalHours: number,
    clientExpectedRevenue: number,
    skillFeeRate: number
  ): void {
    if (!task) {
      throw new Error('Task is required');
    }
    
    if (!task.taskName || !task.clientName) {
      throw new Error('Task must have name and client name');
    }
    
    if (typeof clientTotalHours !== 'number' || clientTotalHours < 0) {
      throw new Error('Client total hours must be a non-negative number');
    }
    
    if (typeof clientExpectedRevenue !== 'number' || clientExpectedRevenue < 0) {
      throw new Error('Client expected revenue must be a non-negative number');
    }
    
    if (typeof skillFeeRate !== 'number' || skillFeeRate < 0) {
      throw new Error('Skill fee rate must be a non-negative number');
    }
  }
}