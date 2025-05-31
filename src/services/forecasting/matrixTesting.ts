
import { TestResult, PerformanceTestResult } from './testing/types';
import { TestUtils } from './testing/testUtils';
import { MatrixDataTests } from './testing/matrixDataTests';
import { AnalyticsTests } from './testing/analyticsTests';
import { PerformanceTests } from './testing/performanceTests';
import { debugLog } from './logger';

/**
 * Matrix Testing Service
 * Orchestrates comprehensive testing of matrix functionality
 */
export class MatrixTestingService {
  /**
   * Run comprehensive integration tests
   */
  static async runIntegrationTests(): Promise<TestResult[]> {
    debugLog('Running matrix integration tests');
    
    const tests = [
      () => MatrixDataTests.testMatrixDataGeneration(),
      () => AnalyticsTests.testAnalyticsIntegration(),
      () => PerformanceTests.testCachePerformance(),
      () => PerformanceTests.testExportFunctionality(),
      () => MatrixDataTests.testDrillDownData(),
      () => AnalyticsTests.testAlertGeneration(),
      () => AnalyticsTests.testRecommendationEngine(),
      () => AnalyticsTests.testTrendAnalysis()
    ];

    const results: TestResult[] = [];
    
    for (const test of tests) {
      try {
        const result = await test();
        results.push(result);
      } catch (error) {
        results.push({
          testName: 'Unknown Test',
          passed: false,
          duration: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    TestUtils.logTestSummary(results, 'Integration');
    return results;
  }

  /**
   * Run performance tests with various data sizes
   */
  static async runPerformanceTests(): Promise<PerformanceTestResult[]> {
    debugLog('Running matrix performance tests');
    return PerformanceTests.runPerformanceTests();
  }
}

// Re-export interfaces for backward compatibility
export type { TestResult, PerformanceTestResult };
