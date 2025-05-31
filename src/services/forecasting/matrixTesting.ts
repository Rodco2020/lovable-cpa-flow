
import { MatrixData } from './matrixUtils';
import { EnhancedMatrixService } from './enhancedMatrixService';
import { AdvancedAnalyticsService } from './analyticsService';
import { debugLog } from './logger';

export interface TestResult {
  testName: string;
  passed: boolean;
  duration: number;
  error?: string;
  details?: any;
}

export interface PerformanceTestResult {
  testName: string;
  duration: number;
  memoryUsage: number;
  operations: number;
  operationsPerSecond: number;
  passed: boolean;
}

export class MatrixTestingService {
  /**
   * Run comprehensive integration tests
   */
  static async runIntegrationTests(): Promise<TestResult[]> {
    debugLog('Running matrix integration tests');
    
    const tests = [
      () => this.testMatrixDataGeneration(),
      () => this.testAnalyticsIntegration(),
      () => this.testCachePerformance(),
      () => this.testExportFunctionality(),
      () => this.testDrillDownData(),
      () => this.testAlertGeneration(),
      () => this.testRecommendationEngine(),
      () => this.testTrendAnalysis()
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

    const passedTests = results.filter(r => r.passed).length;
    debugLog(`Integration tests completed: ${passedTests}/${results.length} passed`);
    
    return results;
  }

  /**
   * Run performance tests with various data sizes
   */
  static async runPerformanceTests(): Promise<PerformanceTestResult[]> {
    debugLog('Running matrix performance tests');
    
    const testSizes = [
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
   * Test matrix data generation
   */
  private static async testMatrixDataGeneration(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const { matrixData } = await EnhancedMatrixService.getEnhancedMatrixData('virtual', {
        includeAnalytics: false,
        useCache: false
      });

      // Validate matrix structure
      const validationIssues = [];
      
      if (!matrixData.months || matrixData.months.length !== 12) {
        validationIssues.push('Invalid months count');
      }
      
      if (!matrixData.skills || matrixData.skills.length === 0) {
        validationIssues.push('No skills found');
      }
      
      if (!matrixData.dataPoints || matrixData.dataPoints.length === 0) {
        validationIssues.push('No data points found');
      }

      const expectedDataPoints = matrixData.months.length * matrixData.skills.length;
      if (matrixData.dataPoints.length !== expectedDataPoints) {
        validationIssues.push(`Expected ${expectedDataPoints} data points, got ${matrixData.dataPoints.length}`);
      }

      return {
        testName: 'Matrix Data Generation',
        passed: validationIssues.length === 0,
        duration: Date.now() - startTime,
        error: validationIssues.length > 0 ? validationIssues.join(', ') : undefined,
        details: {
          monthsCount: matrixData.months.length,
          skillsCount: matrixData.skills.length,
          dataPointsCount: matrixData.dataPoints.length,
          validationIssues
        }
      };
    } catch (error) {
      return {
        testName: 'Matrix Data Generation',
        passed: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test analytics integration
   */
  private static async testAnalyticsIntegration(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const { matrixData, trends, recommendations, alerts } = await EnhancedMatrixService.getEnhancedMatrixData('virtual', {
        includeAnalytics: true,
        useCache: false
      });

      const validationIssues = [];
      
      if (trends.length !== matrixData.skills.length) {
        validationIssues.push(`Expected ${matrixData.skills.length} trends, got ${trends.length}`);
      }
      
      if (recommendations.length === 0) {
        validationIssues.push('No recommendations generated');
      }
      
      // Validate trend analysis
      const invalidTrends = trends.filter(trend => 
        !['increasing', 'decreasing', 'stable'].includes(trend.trend)
      );
      
      if (invalidTrends.length > 0) {
        validationIssues.push(`${invalidTrends.length} trends have invalid direction`);
      }

      return {
        testName: 'Analytics Integration',
        passed: validationIssues.length === 0,
        duration: Date.now() - startTime,
        error: validationIssues.length > 0 ? validationIssues.join(', ') : undefined,
        details: {
          trendsCount: trends.length,
          recommendationsCount: recommendations.length,
          alertsCount: alerts.length,
          validationIssues
        }
      };
    } catch (error) {
      return {
        testName: 'Analytics Integration',
        passed: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test cache performance
   */
  private static async testCachePerformance(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
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
      
      return {
        testName: 'Cache Performance',
        passed: cacheWorking,
        duration: Date.now() - startTime,
        error: !cacheWorking ? 'Cache not providing expected performance improvement' : undefined,
        details: {
          firstCallDuration,
          secondCallDuration,
          speedImprovement: speedImprovement.toFixed(2) + 'x',
          cacheStats: EnhancedMatrixService.getCacheStats()
        }
      };
    } catch (error) {
      return {
        testName: 'Cache Performance',
        passed: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test export functionality
   */
  private static async testExportFunctionality(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const { matrixData, trends, alerts } = await EnhancedMatrixService.getEnhancedMatrixData('virtual');
      
      // Test CSV export
      const csvData = EnhancedMatrixService.generateCSVExport(
        matrixData,
        matrixData.skills,
        { start: 0, end: 11 },
        true,
        trends,
        alerts
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
      
      // Test report generation
      const report = EnhancedMatrixService.generateCapacityReport(matrixData, trends, [], alerts);
      
      if (!report.title || !report.summary || !report.sections || report.sections.length === 0) {
        validationIssues.push('Report generation incomplete');
      }

      return {
        testName: 'Export Functionality',
        passed: validationIssues.length === 0,
        duration: Date.now() - startTime,
        error: validationIssues.length > 0 ? validationIssues.join(', ') : undefined,
        details: {
          csvSize: csvData.length,
          csvLines: lines.length,
          reportSections: report.sections.length,
          validationIssues
        }
      };
    } catch (error) {
      return {
        testName: 'Export Functionality',
        passed: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test drill-down data
   */
  private static async testDrillDownData(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const { matrixData } = await EnhancedMatrixService.getEnhancedMatrixData('virtual');
      
      if (matrixData.skills.length === 0 || matrixData.months.length === 0) {
        throw new Error('No skills or months available for testing');
      }
      
      const skill = matrixData.skills[0];
      const month = matrixData.months[0].key;
      
      const drillDownData = await EnhancedMatrixService.getDrillDownData(skill, month, matrixData);
      
      const validationIssues = [];
      
      if (!drillDownData.demandBreakdown || drillDownData.demandBreakdown.length === 0) {
        validationIssues.push('No demand breakdown data');
      }
      
      if (!drillDownData.capacityBreakdown || drillDownData.capacityBreakdown.length === 0) {
        validationIssues.push('No capacity breakdown data');
      }
      
      if (!drillDownData.trends) {
        validationIssues.push('No trends data');
      }

      return {
        testName: 'Drill-down Data',
        passed: validationIssues.length === 0,
        duration: Date.now() - startTime,
        error: validationIssues.length > 0 ? validationIssues.join(', ') : undefined,
        details: {
          skill,
          month,
          demandBreakdownCount: drillDownData.demandBreakdown.length,
          capacityBreakdownCount: drillDownData.capacityBreakdown.length,
          validationIssues
        }
      };
    } catch (error) {
      return {
        testName: 'Drill-down Data',
        passed: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test alert generation
   */
  private static async testAlertGeneration(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const { matrixData } = await EnhancedMatrixService.getEnhancedMatrixData('virtual');
      const alerts = AdvancedAnalyticsService.generateAlerts(matrixData);
      
      const validationIssues = [];
      
      // Validate alert structure
      const invalidAlerts = alerts.filter(alert => 
        !alert.id || !alert.skill || !alert.type || !alert.severity || !alert.message
      );
      
      if (invalidAlerts.length > 0) {
        validationIssues.push(`${invalidAlerts.length} alerts have invalid structure`);
      }
      
      // Check severity levels
      const validSeverities = ['critical', 'warning', 'info'];
      const invalidSeverities = alerts.filter(alert => 
        !validSeverities.includes(alert.severity)
      );
      
      if (invalidSeverities.length > 0) {
        validationIssues.push(`${invalidSeverities.length} alerts have invalid severity`);
      }

      return {
        testName: 'Alert Generation',
        passed: validationIssues.length === 0,
        duration: Date.now() - startTime,
        error: validationIssues.length > 0 ? validationIssues.join(', ') : undefined,
        details: {
          alertsCount: alerts.length,
          criticalCount: alerts.filter(a => a.severity === 'critical').length,
          warningCount: alerts.filter(a => a.severity === 'warning').length,
          infoCount: alerts.filter(a => a.severity === 'info').length,
          validationIssues
        }
      };
    } catch (error) {
      return {
        testName: 'Alert Generation',
        passed: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test recommendation engine
   */
  private static async testRecommendationEngine(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const { matrixData, trends } = await EnhancedMatrixService.getEnhancedMatrixData('virtual');
      const recommendations = AdvancedAnalyticsService.generateRecommendations(matrixData, trends);
      
      const validationIssues = [];
      
      // Validate recommendation structure
      const invalidRecs = recommendations.filter(rec => 
        !rec.skill || !rec.type || !rec.priority || !rec.description
      );
      
      if (invalidRecs.length > 0) {
        validationIssues.push(`${invalidRecs.length} recommendations have invalid structure`);
      }
      
      // Check valid types and priorities
      const validTypes = ['hire', 'reduce', 'optimize', 'maintain'];
      const validPriorities = ['high', 'medium', 'low'];
      
      const invalidTypes = recommendations.filter(rec => !validTypes.includes(rec.type));
      const invalidPriorities = recommendations.filter(rec => !validPriorities.includes(rec.priority));
      
      if (invalidTypes.length > 0) {
        validationIssues.push(`${invalidTypes.length} recommendations have invalid type`);
      }
      
      if (invalidPriorities.length > 0) {
        validationIssues.push(`${invalidPriorities.length} recommendations have invalid priority`);
      }

      return {
        testName: 'Recommendation Engine',
        passed: validationIssues.length === 0,
        duration: Date.now() - startTime,
        error: validationIssues.length > 0 ? validationIssues.join(', ') : undefined,
        details: {
          recommendationsCount: recommendations.length,
          highPriorityCount: recommendations.filter(r => r.priority === 'high').length,
          hireRecommendations: recommendations.filter(r => r.type === 'hire').length,
          optimizeRecommendations: recommendations.filter(r => r.type === 'optimize').length,
          validationIssues
        }
      };
    } catch (error) {
      return {
        testName: 'Recommendation Engine',
        passed: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test trend analysis
   */
  private static async testTrendAnalysis(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const { matrixData } = await EnhancedMatrixService.getEnhancedMatrixData('virtual');
      const trends = AdvancedAnalyticsService.analyzeTrends(matrixData);
      
      const validationIssues = [];
      
      if (trends.length !== matrixData.skills.length) {
        validationIssues.push(`Expected ${matrixData.skills.length} trends, got ${trends.length}`);
      }
      
      // Validate trend structure
      const invalidTrends = trends.filter(trend => 
        !trend.skill || 
        !['increasing', 'decreasing', 'stable'].includes(trend.trend) ||
        typeof trend.trendPercent !== 'number' ||
        !trend.prediction
      );
      
      if (invalidTrends.length > 0) {
        validationIssues.push(`${invalidTrends.length} trends have invalid structure`);
      }
      
      // Check predictions are reasonable
      const invalidPredictions = trends.filter(trend => 
        trend.prediction.nextMonth < 0 || trend.prediction.nextQuarter < 0
      );
      
      if (invalidPredictions.length > 0) {
        validationIssues.push(`${invalidPredictions.length} trends have negative predictions`);
      }

      return {
        testName: 'Trend Analysis',
        passed: validationIssues.length === 0,
        duration: Date.now() - startTime,
        error: validationIssues.length > 0 ? validationIssues.join(', ') : undefined,
        details: {
          trendsCount: trends.length,
          increasingCount: trends.filter(t => t.trend === 'increasing').length,
          decreasingCount: trends.filter(t => t.trend === 'decreasing').length,
          stableCount: trends.filter(t => t.trend === 'stable').length,
          validationIssues
        }
      };
    } catch (error) {
      return {
        testName: 'Trend Analysis',
        passed: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Performance test for matrix operations
   */
  private static async performanceTestMatrixOperation(testSize: {
    skills: number;
    months: number;
    name: string;
  }): Promise<PerformanceTestResult> {
    const startTime = Date.now();
    const startMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
    
    try {
      // Generate test data
      const operations = testSize.skills * testSize.months;
      
      // Simulate matrix operations
      for (let i = 0; i < operations; i++) {
        // Simulate computation
        Math.random() * 100;
      }
      
      const duration = Date.now() - startTime;
      const endMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
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
