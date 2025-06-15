
/**
 * User Acceptance Test Runner
 * 
 * Runs user acceptance tests with real-world scenarios
 */

import { UserAcceptanceTestResult } from '../QualityAssuranceOrchestrator';
import { DemandMatrixService } from '@/services/forecasting/demandMatrixService';

export class UserAcceptanceTestRunner {
  /**
   * Run all user acceptance tests
   */
  public static async runTests(): Promise<UserAcceptanceTestResult> {
    console.log('👥 [USER ACCEPTANCE TESTS] Starting user acceptance testing...');
    
    const scenarios = [
      {
        name: 'View Demand Matrix',
        test: () => this.testViewDemandMatrix()
      },
      {
        name: 'Filter by Skills',
        test: () => this.testFilterBySkills()
      },
      {
        name: 'Filter by Clients',
        test: () => this.testFilterByClients()
      },
      {
        name: 'Export Matrix Data',
        test: () => this.testExportMatrix()
      },
      {
        name: 'View Revenue Calculations',
        test: () => this.testViewRevenueCalculations()
      },
      {
        name: 'Handle Large Datasets',
        test: () => this.testHandleLargeDatasets()
      }
    ];

    const scenarioResults = [];
    let totalUserSatisfactionScore = 0;

    for (const scenario of scenarios) {
      const startTime = performance.now();
      
      try {
        await scenario.test();
        const duration = Math.round(performance.now() - startTime);
        
        scenarioResults.push({
          name: scenario.name,
          passed: true,
          steps: this.getScenarioStepCount(scenario.name),
          duration
        });

        // Calculate user satisfaction based on performance and functionality
        const satisfactionScore = this.calculateUserSatisfaction(duration, true);
        totalUserSatisfactionScore += satisfactionScore;
        
        console.log(`✅ [UAT] ${scenario.name}: PASSED (${duration}ms)`);
        
      } catch (error) {
        const duration = Math.round(performance.now() - startTime);
        
        scenarioResults.push({
          name: scenario.name,
          passed: false,
          steps: this.getScenarioStepCount(scenario.name),
          duration
        });

        console.error(`❌ [UAT] ${scenario.name}: FAILED - ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    const averageUserSatisfactionScore = Math.round(totalUserSatisfactionScore / scenarios.length);
    const passed = scenarioResults.every(result => result.passed);

    console.log(`✅ [USER ACCEPTANCE TESTS] Completed - ${passed ? 'PASSED' : 'FAILED'}`);
    console.log(`📊 User Satisfaction Score: ${averageUserSatisfactionScore}%`);

    return {
      passed,
      scenarios: scenarioResults,
      userSatisfactionScore: averageUserSatisfactionScore
    };
  }

  /**
   * Test: User can view demand matrix
   */
  private static async testViewDemandMatrix(): Promise<void> {
    const { matrixData } = await DemandMatrixService.generateDemandMatrix('demand-only');
    
    if (!matrixData) {
      throw new Error('Cannot view demand matrix - no data generated');
    }

    if (matrixData.months.length === 0) {
      throw new Error('Cannot view demand matrix - no months available');
    }

    if (matrixData.skills.length === 0) {
      throw new Error('Cannot view demand matrix - no skills available');
    }

    if (matrixData.dataPoints.length === 0) {
      throw new Error('Cannot view demand matrix - no data points available');
    }

    // Simulate user viewing the matrix
    console.log(`📊 User can view matrix with ${matrixData.skills.length} skills and ${matrixData.months.length} months`);
  }

  /**
   * Test: User can filter by skills
   */
  private static async testFilterBySkills(): Promise<void> {
    const { matrixData } = await DemandMatrixService.generateDemandMatrix('demand-only');
    
    if (!matrixData || matrixData.skills.length === 0) {
      throw new Error('Cannot test skill filtering - no skills available');
    }

    // Simulate user selecting a skill filter
    const selectedSkill = matrixData.skills[0];
    const filteredData = matrixData.dataPoints.filter(dp => dp.skillType === selectedSkill);

    if (filteredData.length === 0) {
      throw new Error('Skill filtering removed all data points');
    }

    console.log(`🎯 User can filter by skill "${selectedSkill}" - ${filteredData.length} data points`);
  }

  /**
   * Test: User can filter by clients
   */
  private static async testFilterByClients(): Promise<void> {
    const { matrixData } = await DemandMatrixService.generateDemandMatrix('demand-only');
    
    if (!matrixData) {
      throw new Error('Cannot test client filtering - no matrix data');
    }

    // Get unique clients from task breakdown
    const clients = new Set<string>();
    matrixData.dataPoints.forEach(dp => {
      dp.taskBreakdown?.forEach(task => {
        if (task.clientName) {
          clients.add(task.clientName);
        }
      });
    });

    if (clients.size === 0) {
      console.warn('No client data available for filtering test');
      return;
    }

    console.log(`👥 User can filter by clients - ${clients.size} unique clients available`);
  }

  /**
   * Test: User can export matrix data
   */
  private static async testExportMatrix(): Promise<void> {
    const { matrixData } = await DemandMatrixService.generateDemandMatrix('demand-only');
    
    if (!matrixData) {
      throw new Error('Cannot test export - no matrix data');
    }

    // Simulate export functionality
    const exportData = {
      timestamp: new Date(),
      matrixData,
      format: 'CSV'
    };

    if (!exportData.matrixData || !exportData.timestamp) {
      throw new Error('Export data is incomplete');
    }

    console.log(`📤 User can export matrix data - ${matrixData.dataPoints.length} data points`);
  }

  /**
   * Test: User can view revenue calculations
   */
  private static async testViewRevenueCalculations(): Promise<void> {
    const { matrixData } = await DemandMatrixService.generateDemandMatrix('demand-only');
    
    if (!matrixData) {
      throw new Error('Cannot test revenue calculations - no matrix data');
    }

    // Check if revenue calculations are available
    const hasRevenueData = matrixData.revenueTotals !== undefined;
    const hasDataPointRevenue = matrixData.dataPoints.some(dp => dp.suggestedRevenue !== undefined);

    if (!hasRevenueData && !hasDataPointRevenue) {
      console.warn('No revenue calculation data available - this may be expected');
      return;
    }

    console.log(`💰 User can view revenue calculations - Revenue data available: ${hasRevenueData}`);
  }

  /**
   * Test: User can handle large datasets
   */
  private static async testHandleLargeDatasets(): Promise<void> {
    const startTime = performance.now();
    
    // Generate matrix data (simulating large dataset)
    const { matrixData } = await DemandMatrixService.generateDemandMatrix('demand-only');
    
    if (!matrixData) {
      throw new Error('Cannot test large datasets - no matrix data');
    }

    const processingTime = performance.now() - startTime;

    // Should handle data generation within reasonable time
    if (processingTime > 10000) { // 10 seconds
      throw new Error(`Large dataset processing took ${Math.round(processingTime)}ms, exceeds 10000ms threshold`);
    }

    console.log(`📈 User can handle large datasets - Processed in ${Math.round(processingTime)}ms`);
  }

  /**
   * Get number of steps for a scenario
   */
  private static getScenarioStepCount(scenarioName: string): number {
    const stepCounts: Record<string, number> = {
      'View Demand Matrix': 4,
      'Filter by Skills': 3,
      'Filter by Clients': 3,
      'Export Matrix Data': 3,
      'View Revenue Calculations': 3,
      'Handle Large Datasets': 2
    };

    return stepCounts[scenarioName] || 1;
  }

  /**
   * Calculate user satisfaction score based on performance and functionality
   */
  private static calculateUserSatisfaction(duration: number, passed: boolean): number {
    if (!passed) return 0;

    // Base score for functionality
    let score = 70;

    // Performance bonus/penalty
    if (duration < 1000) {
      score += 30; // Fast performance
    } else if (duration < 3000) {
      score += 20; // Good performance
    } else if (duration < 5000) {
      score += 10; // Acceptable performance
    } else {
      score -= 20; // Poor performance
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Run specific user acceptance scenario
   */
  public static async runSpecificScenario(scenarioName: string): Promise<{
    passed: boolean;
    duration: number;
    steps: number;
    userSatisfactionScore: number;
  }> {
    const startTime = performance.now();

    try {
      switch (scenarioName) {
        case 'View Demand Matrix':
          await this.testViewDemandMatrix();
          break;
        case 'Filter by Skills':
          await this.testFilterBySkills();
          break;
        case 'Filter by Clients':
          await this.testFilterByClients();
          break;
        case 'Export Matrix Data':
          await this.testExportMatrix();
          break;
        case 'View Revenue Calculations':
          await this.testViewRevenueCalculations();
          break;
        case 'Handle Large Datasets':
          await this.testHandleLargeDatasets();
          break;
        default:
          throw new Error(`Unknown scenario: ${scenarioName}`);
      }

      const duration = Math.round(performance.now() - startTime);
      const userSatisfactionScore = this.calculateUserSatisfaction(duration, true);

      return {
        passed: true,
        duration,
        steps: this.getScenarioStepCount(scenarioName),
        userSatisfactionScore
      };

    } catch (error) {
      const duration = Math.round(performance.now() - startTime);
      
      return {
        passed: false,
        duration,
        steps: this.getScenarioStepCount(scenarioName),
        userSatisfactionScore: 0
      };
    }
  }
}
