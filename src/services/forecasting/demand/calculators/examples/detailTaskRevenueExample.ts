/**
 * Detail Task Revenue Calculator - Integration Example
 * 
 * Demonstrates how to use the new DetailTaskRevenueCalculator with existing services
 */

import { DetailTaskRevenueCalculator, Task, ClientRevenueData } from '../detailTaskRevenueCalculator';
import { ClientRevenueCalculator } from '../../matrixTransformer/clientRevenueCalculator';
import { getSkillFeeRatesMap, getDefaultFeeRates } from '@/services/skills/feeRateService';

/**
 * Example: Calculate revenue for all detail tasks using integrated services
 */
export async function calculateDetailTaskRevenueExample() {
  console.log('🎯 [EXAMPLE] Starting Detail Task Revenue Calculation');

  // 1. Sample task data (would come from detail matrix data)
  const tasks: Task[] = [
    {
      id: 'task-1',
      taskName: 'Monthly Tax Return Prep',
      clientName: 'ABC Corporation',
      clientId: 'client-1',
      skillRequired: 'CPA',
      monthlyHours: 12,
      month: '2024-01',
      monthLabel: 'January 2024',
      recurrencePattern: 'Monthly',
      priority: 'High',
      category: 'Tax',
      totalHours: 12
    },
    {
      id: 'task-2',
      taskName: 'Payroll Processing',
      clientName: 'ABC Corporation',
      clientId: 'client-1',  
      skillRequired: 'Senior',
      monthlyHours: 8,
      month: '2024-01',
      monthLabel: 'January 2024',
      recurrencePattern: 'Monthly',
      priority: 'Medium',
      category: 'Payroll',
      totalHours: 8
    },
    {
      id: 'task-3',
      taskName: 'Financial Statements',
      clientName: 'XYZ Holdings',
      clientId: 'client-2',
      skillRequired: 'CPA',
      monthlyHours: 16,
      month: '2024-01',
      monthLabel: 'January 2024',
      recurrencePattern: 'Monthly',
      priority: 'High',
      category: 'Financial',
      totalHours: 16
    }
  ];

  // 2. Client data with expected monthly revenue
  const clients = [
    { id: 'client-1', legal_name: 'ABC Corporation', expected_monthly_revenue: 8000 },
    { id: 'client-2', legal_name: 'XYZ Holdings', expected_monthly_revenue: 12000 }
  ];

  try {
    // 3. Get skill fee rates from database
    let skillFeeRates: Map<string, number>;
    try {
      skillFeeRates = await getSkillFeeRatesMap();
      console.log('✅ [EXAMPLE] Loaded skill fee rates from database');
    } catch (error) {
      console.warn('⚠️ [EXAMPLE] Using default skill fee rates');
      const defaultRates = getDefaultFeeRates();
      skillFeeRates = new Map(Object.entries(defaultRates));
    }

    // 4. Build client revenue data using the new service
    const monthCount = 1; // Single month calculation
    const clientRevenueData = DetailTaskRevenueCalculator.buildClientRevenueData(
      clients,
      tasks,
      monthCount
    );

    console.log('📊 [EXAMPLE] Client Revenue Data Built:', {
      totalClients: clientRevenueData.size,
      clients: Array.from(clientRevenueData.entries()).map(([name, data]) => ({
        name,
        totalHours: data.totalHours,
        monthlyRevenue: data.expectedMonthlyRevenue,
        totalRevenue: data.totalExpectedRevenue
      }))
    });

    // 5. Calculate revenue for all tasks
    const taskRevenueResults = await DetailTaskRevenueCalculator.calculateBulkTaskRevenue(
      tasks,
      clientRevenueData,
      skillFeeRates
    );

    console.log('💰 [EXAMPLE] Task Revenue Results:', {
      totalTasks: taskRevenueResults.size,
      processed: Array.from(taskRevenueResults.entries()).map(([taskId, result]) => {
        const task = tasks.find(t => t.id === taskId);
        return {
          taskName: task?.taskName,
          clientName: task?.clientName,
          skillRequired: task?.skillRequired,
          hours: result.totalHours,
          expectedRevenue: `$${result.totalExpectedRevenue.toFixed(2)}`,
          suggestedRevenue: `$${result.totalSuggestedRevenue.toFixed(2)}`,
          difference: `$${result.expectedLessSuggested.toFixed(2)}`,
          profitability: result.expectedLessSuggested > 0 ? 'Profitable' : 'Unprofitable'
        };
      })
    });

    // 6. Generate summary statistics
    const summary = DetailTaskRevenueCalculator.generateRevenueSummary(taskRevenueResults);

    console.log('📈 [EXAMPLE] Revenue Summary:', {
      totalTasks: summary.totalTasks,
      totalHours: `${summary.totalHours}h`,
      totalExpectedRevenue: `$${summary.totalExpectedRevenue.toLocaleString()}`,
      totalSuggestedRevenue: `$${summary.totalSuggestedRevenue.toLocaleString()}`,
      totalDifference: `$${summary.totalExpectedLessSuggested.toLocaleString()}`,
      averageRate: `$${summary.averageExpectedHourlyRate.toFixed(2)}/hr`,
      profitableTasks: `${summary.profitableTasks}/${summary.totalTasks}`,
      unprofitableTasks: `${summary.unprofitableTasks}/${summary.totalTasks}`
    });

    // 7. Integration with existing ClientRevenueCalculator
    const clientRevenueMap = ClientRevenueCalculator.buildClientRevenueMap(clients);
    const clientTotals = new Map([
      ['ABC Corporation', 20], // 12 + 8 hours
      ['XYZ Holdings', 16]     // 16 hours
    ]);
    
    // Calculate client-level revenue using existing service
    const clientRevenue = ClientRevenueCalculator.calculateClientRevenue(
      clientTotals,
      clientRevenueMap,
      monthCount
    );

    const clientHourlyRates = ClientRevenueCalculator.calculateClientHourlyRates(
      clientTotals,
      clientRevenue
    );

    console.log('🔗 [EXAMPLE] Integration with ClientRevenueCalculator:', {
      clientRevenue: Array.from(clientRevenue.entries()),
      clientHourlyRates: Array.from(clientHourlyRates.entries()).map(([client, rate]) => 
        [client, `$${rate.toFixed(2)}/hr`]
      )
    });

    return {
      tasks,
      taskRevenueResults,
      summary,
      clientRevenueData,
      skillFeeRates: Array.from(skillFeeRates.entries())
    };

  } catch (error) {
    console.error('❌ [EXAMPLE] Error in detail task revenue calculation:', error);
    throw error;
  }
}

/**
 * Example: Calculate revenue for a single task
 */
export async function calculateSingleTaskRevenueExample() {
  console.log('🎯 [EXAMPLE] Single Task Revenue Calculation');

  const task: Task = {
    id: 'single-task',
    taskName: 'Quarterly Tax Review',
    clientName: 'Sample Client Corp',
    clientId: 'sample-client',
    skillRequired: 'CPA',
    monthlyHours: 20,
    month: '2024-Q1',
    monthLabel: '2024 Q1',
    recurrencePattern: 'Quarterly',
    priority: 'High',
    category: 'Tax',
    totalHours: 20
  };

  try {
    // Client has 50 total hours and $15,000 expected revenue
    const clientTotalHours = 50;
    const clientExpectedRevenue = 15000;
    const skillFeeRate = 250; // CPA rate

    const result = DetailTaskRevenueCalculator.calculateTaskRevenue(
      task,
      clientTotalHours,
      clientExpectedRevenue,
      skillFeeRate
    );

    console.log('💰 [SINGLE TASK EXAMPLE] Revenue Calculation:', {
      taskName: task.taskName,
      taskHours: result.totalHours,
      apportionment: `${(result.apportionmentPercentage * 100).toFixed(1)}%`,
      expectedRevenue: `$${result.totalExpectedRevenue.toFixed(2)}`,
      expectedHourlyRate: `$${result.expectedHourlyRate.toFixed(2)}/hr`,
      suggestedRevenue: `$${result.totalSuggestedRevenue.toFixed(2)}`,
      skillFeeRate: `$${result.skillFeeRate}/hr`,
      profitAnalysis: {
        difference: `$${result.expectedLessSuggested.toFixed(2)}`,
        status: result.expectedLessSuggested > 0 ? 'Profitable' : 'Unprofitable',
        margin: `${((result.expectedLessSuggested / result.totalSuggestedRevenue) * 100).toFixed(1)}%`
      }
    });

    return result;

  } catch (error) {
    console.error('❌ [SINGLE TASK EXAMPLE] Error:', error);
    throw error;
  }
}

/**
 * Example: Handle edge cases and error scenarios
 */
export function handleEdgeCasesExample() {
  console.log('🎯 [EXAMPLE] Edge Case Handling');

  const problematicTask: Task = {
    id: 'edge-case-task',
    taskName: 'Test Task',
    clientName: 'Edge Case Client',
    clientId: 'edge-client',
    skillRequired: 'Unknown Skill',
    monthlyHours: 0, // Zero hours
    month: '2024-01',
    monthLabel: 'January 2024',
    recurrencePattern: 'Monthly',
    priority: 'Low',
    category: 'Test'
  };

  try {
    // Test zero hours scenario
    const result1 = DetailTaskRevenueCalculator.calculateTaskRevenue(
      problematicTask,
      0, // Zero client total hours
      5000,
      100
    );

    console.log('🔍 [EDGE CASE] Zero hours result:', result1);

    // Test negative values (should be handled gracefully)
    const result2 = DetailTaskRevenueCalculator.calculateTaskRevenue(
      { ...problematicTask, totalHours: 10 },
      10,
      -1000, // Negative revenue should be handled
      150
    );

    console.log('🔍 [EDGE CASE] Negative revenue result:', result2);

    return { result1, result2 };

  } catch (error) {
    console.log('🔍 [EDGE CASE] Expected error caught:', error.message);
    return null;
  }
}