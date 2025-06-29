
import { DemandMatrixData, DemandDataPoint, SkillSummaryItem, ClientTaskDemand } from '@/types/demand';
import { PreferredStaffFilterStrategy } from './preferredStaffFilterStrategy';

/**
 * Integration Test Service for Demand Matrix Filtering
 * 
 * Provides comprehensive testing capabilities for demand matrix filtering operations,
 * including performance testing, data validation, and end-to-end workflow validation.
 */
export class IntegrationTestService {
  /**
   * Create a comprehensive test dataset for integration testing
   */
  static createComprehensiveTestDataset(): DemandMatrixData {
    const testTaskBreakdown: ClientTaskDemand[] = [
      {
        clientId: 'client-1',
        clientName: 'Test Client A',
        recurringTaskId: 'task-1',
        taskName: 'Tax Preparation',
        skillType: 'Tax Preparation',
        estimatedHours: 10,
        monthlyHours: 10,
        preferredStaffId: 'staff-1',
        preferredStaffName: 'John Doe',
        recurrencePattern: {
          type: 'Monthly',
          interval: 1,
          frequency: 1
        }
      },
      {
        clientId: 'client-2',
        clientName: 'Test Client B',
        recurringTaskId: 'task-2',
        taskName: 'Bookkeeping',
        skillType: 'Bookkeeping',
        estimatedHours: 8,
        monthlyHours: 8,
        preferredStaffId: 'staff-2',
        preferredStaffName: 'Jane Smith',
        recurrencePattern: {
          type: 'Monthly',
          interval: 1,
          frequency: 1
        }
      }
    ];

    const testDataPoints: DemandDataPoint[] = [
      {
        skillType: 'Tax Preparation',
        month: '2024-01',
        monthLabel: 'Jan 2024',
        demandHours: 40,
        totalHours: 40, // Add required property
        taskCount: 5,
        clientCount: 3,
        taskBreakdown: [
          {
            clientId: 'client-1',
            clientName: 'Test Client A',
            recurringTaskId: 'task-1',
            taskName: 'Tax Preparation',
            skillType: 'Tax Preparation',
            estimatedHours: 10,
            monthlyHours: 10,
            preferredStaffId: 'staff-1',
            preferredStaffName: 'John Doe',
            recurrencePattern: {
              type: 'Monthly',
              interval: 1,
              frequency: 1
            }
          }
        ]
      },
      {
        skillType: 'Bookkeeping',
        month: '2024-01',
        monthLabel: 'Jan 2024',
        demandHours: 32,
        totalHours: 32, // Add required property
        taskCount: 4,
        clientCount: 2,
        taskBreakdown: [
          {
            clientId: 'client-2',
            clientName: 'Test Client B',
            recurringTaskId: 'task-2',
            taskName: 'Bookkeeping',
            skillType: 'Bookkeeping',
            estimatedHours: 8,
            monthlyHours: 8,
            preferredStaffId: 'staff-2',
            preferredStaffName: 'Jane Smith',
            recurrencePattern: {
              type: 'Monthly',
              interval: 1,
              frequency: 1
            }
          }
        ]
      }
    ];

    const skillSummary: Record<string, SkillSummaryItem> = {
      'Tax Preparation': {
        demandHours: 40, // Add required property
        totalHours: 40,
        taskCount: 5,
        clientCount: 3
      },
      'Bookkeeping': {
        demandHours: 32, // Add required property
        totalHours: 32,
        taskCount: 4,
        clientCount: 2
      }
    };

    return {
      months: [
        { key: '2024-01', label: 'Jan 2024' },
        { key: '2024-02', label: 'Feb 2024' }
      ],
      skills: ['Tax Preparation', 'Bookkeeping'],
      dataPoints: testDataPoints,
      totalDemand: 72,
      totalTasks: 9,
      totalClients: 5,
      skillSummary,
      clientTotals: new Map([
        ['client-1', 40],
        ['client-2', 32]
      ]),
      aggregationStrategy: 'skill-based'
    };
  }

  /**
   * Run comprehensive integration tests for preferred staff filtering
   */
  static async runPreferredStaffFilteringTests(): Promise<{
    success: boolean;
    results: Array<{
      testName: string;
      passed: boolean;
      details: string;
    }>;
  }> {
    const results: Array<{
      testName: string;
      passed: boolean;
      details: string;
    }> = [];

    // Test 1: Basic filtering functionality
    try {
      const testData = this.createComprehensiveTestDataset();
      const filterStrategy = new PreferredStaffFilterStrategy();
      
      const filteredData = filterStrategy.apply(testData, {
        preferredStaff: ['staff-1']
      });

      const passed = filteredData.dataPoints.length > 0;
      results.push({
        testName: 'Basic Filtering Functionality',
        passed,
        details: passed ? 'Successfully filtered data by preferred staff' : 'Failed to filter data'
      });
    } catch (error) {
      results.push({
        testName: 'Basic Filtering Functionality',
        passed: false,
        details: `Error: ${error}`
      });
    }

    // Test 2: Empty filter handling
    try {
      const testData = this.createComprehensiveTestDataset();
      const filterStrategy = new PreferredStaffFilterStrategy();
      
      const filteredData = filterStrategy.apply(testData, {
        preferredStaff: []
      });

      const passed = filteredData.dataPoints.length === testData.dataPoints.length;
      results.push({
        testName: 'Empty Filter Handling',
        passed,
        details: passed ? 'Correctly handled empty filter' : 'Failed to handle empty filter'
      });
    } catch (error) {
      results.push({
        testName: 'Empty Filter Handling',
        passed: false,
        details: `Error: ${error}`
      });
    }

    // Test 3: Performance testing
    try {
      const testData = this.createComprehensiveTestDataset();
      const filterStrategy = new PreferredStaffFilterStrategy();
      
      const startTime = performance.now();
      const filteredData = filterStrategy.apply(testData, {
        preferredStaff: ['staff-1', 'staff-2']
      });
      const endTime = performance.now();
      
      const processingTime = endTime - startTime;
      const passed = processingTime < 100; // Should complete within 100ms
      
      results.push({
        testName: 'Performance Testing',
        passed,
        details: `Processing time: ${processingTime.toFixed(2)}ms`
      });
    } catch (error) {
      results.push({
        testName: 'Performance Testing',
        passed: false,
        details: `Error: ${error}`
      });
    }

    const allPassed = results.every(result => result.passed);
    
    return {
      success: allPassed,
      results
    };
  }

  /**
   * Validate data integrity after filtering operations
   */
  static validateDataIntegrity(originalData: DemandMatrixData, filteredData: DemandMatrixData): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // Check if totals are consistent
    const filteredTotalDemand = filteredData.dataPoints.reduce((sum, dp) => sum + dp.demandHours, 0);
    if (filteredData.totalDemand !== filteredTotalDemand) {
      issues.push('Total demand mismatch between summary and data points');
    }

    // Check if skill summary is consistent
    const calculatedSkillSummary: Record<string, { demandHours: number; totalHours: number; taskCount: number; clientCount: number }> = {};
    filteredData.dataPoints.forEach(dp => {
      if (!calculatedSkillSummary[dp.skillType]) {
        calculatedSkillSummary[dp.skillType] = { demandHours: 0, totalHours: 0, taskCount: 0, clientCount: 0 };
      }
      calculatedSkillSummary[dp.skillType].demandHours += dp.demandHours;
      calculatedSkillSummary[dp.skillType].totalHours += dp.totalHours;
      calculatedSkillSummary[dp.skillType].taskCount += dp.taskCount;
      calculatedSkillSummary[dp.skillType].clientCount += dp.clientCount;
    });

    // Validate each skill in the summary
    Object.keys(calculatedSkillSummary).forEach(skill => {
      const summaryItem = filteredData.skillSummary[skill];
      const calculated = calculatedSkillSummary[skill];
      
      if (!summaryItem || summaryItem.demandHours !== calculated.demandHours) {
        issues.push(`Skill summary mismatch for ${skill}: demand hours`);
      }
    });

    return {
      isValid: issues.length === 0,
      issues
    };
  }
}
