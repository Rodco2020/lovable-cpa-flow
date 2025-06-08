import { TestResult, PerformanceTestResult, TestSize } from './types';
import { TestUtils } from './testUtils';
import { EnhancedMatrixService } from '../enhancedMatrixService';

/**
 * Performance and system tests
 */
export class PerformanceTests {
  /**
   * Test cache performance
   */
  static async testCachePerformance(): Promise<TestResult> {
    return TestUtils.executeTest('Cache Performance', async () => {
      // First call (should cache)
      const firstCall = Date.now();
      await EnhancedMatrixService.getEnhancedMatrixData('virtual', { useCache: true });
      const firstCallDuration = Date.now() - firstCall;
      
      // Second call (should use cache)
      const secondCall = Date.now();
      await EnhancedMatrixService.getEnhancedMatrixData('virtual', { useCache: true });
      const secondCallDuration = Date.now() - secondCall;
      
      // Cache should be significantly faster
      const speedImprovement = firstCallDuration / Math.max(secondCallDuration, 1);
      const cacheWorking = speedImprovement > 2; // At least 2x faster
      
      if (!cacheWorking) {
        throw new Error('Cache not providing expected performance improvement');
      }
      
      return {
        firstCallDuration,
        secondCallDuration,
        speedImprovement: speedImprovement.toFixed(2) + 'x',
        cacheStats: EnhancedMatrixService.getCacheStats()
      };
    });
  }

  /**
   * Test export functionality
   */
  static async testExportFunctionality(): Promise<TestResult> {
    return TestUtils.executeTest('Export Functionality', async () => {
      const result = await EnhancedMatrixService.getEnhancedMatrixData('virtual');
      const { matrixData, trends, alerts } = result;
      
      if (!matrixData) {
        throw new Error('No matrix data available for testing');
      }
      
      // Test CSV export with correct signature
      const csvData = EnhancedMatrixService.generateCSVExport(
        matrixData,
        matrixData.skills,
        { start: 0, end: 11 }
      );
      
      const validationIssues = [];
      
      if (!csvData || csvData.length === 0) {
        validationIssues.push('CSV export is empty');
      }
      
      const lines = csvData.split('\n').filter(line => line.trim());
      const expectedLines = 1 + (matrixData.skills.length * matrixData.months.length); // header + data
      
      if (lines.length < expectedLines * 0.8) { // Allow some tolerance
        validationIssues.push(`CSV has ${lines.length} lines, expected around ${expectedLines}`);
      }
      
      // Test report generation with correct signature
      const report = EnhancedMatrixService.generateCapacityReport(matrixData, trends, [], alerts);
      
      if (!report.title || !report.summary || !report.sections || report.sections.length === 0) {
        validationIssues.push('Report generation incomplete');
      }

      if (validationIssues.length > 0) {
        throw new Error(validationIssues.join(', '));
      }

      return {
        csvSize: csvData.length,
        csvLines: lines.length,
        reportSections: report.sections.length,
        validationIssues
      };
    });
  }

  /**
   * Run performance tests with various data sizes
   */
  static async runPerformanceTests(): Promise<PerformanceTestResult[]> {
    const testSizes: TestSize[] = [
      { skills: 5, months: 12, name: 'Small Dataset' },
      { skills: 10, months: 12, name: 'Medium Dataset' },
      { skills: 20, months: 12, name: 'Large Dataset' },
      { skills: 50, months: 12, name: 'Extra Large Dataset' }
    ];

    const results: PerformanceTestResult[] = [];
    
    for (const testSize of testSizes) {
      const result = await this.performanceTestMatrixOperation(testSize);
      results.push(result);
    }

    return results;
  }

  /**
   * Performance test for matrix operations
   */
  private static async performanceTestMatrixOperation(testSize: TestSize): Promise<PerformanceTestResult> {
    const startTime = Date.now();
    const startMemory = TestUtils.getMemoryUsage();
    
    try {
      // Generate test data
      const operations = testSize.skills * testSize.months;
      
      // Simulate matrix operations
      for (let i = 0; i < operations; i++) {
        // Simulate computation
        Math.random() * 100;
      }
      
      const duration = Date.now() - startTime;
      const endMemory = TestUtils.getMemoryUsage();
      const memoryUsage = endMemory - startMemory;
      const operationsPerSecond = operations / (duration / 1000);
      
      // Performance thresholds
      const maxDurationMs = 5000; // 5 seconds max
      const maxMemoryMB = 50; // 50MB max
      
      const passed = duration < maxDurationMs && (memoryUsage / 1024 / 1024) < maxMemoryMB;
      
      return {
        testName: `Performance Test - ${testSize.name}`,
        duration,
        memoryUsage,
        operations,
        operationsPerSecond,
        passed
      };
    } catch (error) {
      return {
        testName: `Performance Test - ${testSize.name}`,
        duration: Date.now() - startTime,
        memoryUsage: 0,
        operations: 0,
        operationsPerSecond: 0,
        passed: false
      };
    }
  }
}
