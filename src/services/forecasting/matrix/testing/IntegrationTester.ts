
import { MatrixData, ForecastType } from '../types';
import { DemandMatrixData } from '@/types/demand';
import { CrossMatrixValidator } from '../validation/CrossMatrixValidator';
import { PerformanceOptimizer } from '../optimization/PerformanceOptimizer';
import { EnhancedMatrixService } from '../../enhanced/enhancedMatrixService';
import { MatrixServiceCore } from '../MatrixServiceCore';
import { DemandMatrixService } from '../../demandMatrixService';
import { debugLog } from '../../logger';

/**
 * Integration Tester
 * 
 * Comprehensive testing framework for matrix integration validation,
 * control functionality testing, and export data verification.
 */

export interface TestScenario {
  name: string;
  description: string;
  forecastType: ForecastType;
  expectedSkills: string[];
  expectedMonths: number;
  testFilters?: boolean;
  testExports?: boolean;
}

export interface TestResult {
  scenario: string;
  passed: boolean;
  duration: number;
  issues: string[];
  metrics: {
    dataPointsValidated: number;
    performanceScore: number;
    consistencyScore: number;
  };
}

export interface IntegrationTestSuite {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  overallDuration: number;
  results: TestResult[];
  summary: {
    criticalIssues: string[];
    recommendations: string[];
    performanceReport: string;
  };
}

export class IntegrationTester {
  private static readonly TEST_SCENARIOS: TestScenario[] = [
    {
      name: 'Virtual Capacity Matrix',
      description: 'Test virtual capacity matrix generation and consistency',
      forecastType: 'virtual',
      expectedSkills: ['Junior', 'Senior', 'CPA'],
      expectedMonths: 12,
      testFilters: true,
      testExports: true
    },
    {
      name: 'Actual Capacity Matrix',
      description: 'Test actual capacity matrix generation and consistency',
      forecastType: 'actual',
      expectedSkills: ['Junior', 'Senior', 'CPA'],
      expectedMonths: 12,
      testFilters: true,
      testExports: true
    },
    {
      name: 'Demand Matrix Only',
      description: 'Test demand-only matrix generation',
      forecastType: 'demand-only' as ForecastType,
      expectedSkills: ['Junior', 'Senior', 'CPA'],
      expectedMonths: 12,
      testFilters: false,
      testExports: true
    }
  ];

  /**
   * Run comprehensive integration test suite
   */
  static async runIntegrationTests(): Promise<IntegrationTestSuite> {
    const startTime = Date.now();
    const results: TestResult[] = [];
    
    debugLog('Starting integration test suite', {
      totalScenarios: this.TEST_SCENARIOS.length
    });
    
    for (const scenario of this.TEST_SCENARIOS) {
      try {
        const result = await this.runScenarioTest(scenario);
        results.push(result);
        
        debugLog(`Test scenario '${scenario.name}' completed`, {
          passed: result.passed,
          duration: result.duration,
          issues: result.issues.length
        });
      } catch (error) {
        const errorResult: TestResult = {
          scenario: scenario.name,
          passed: false,
          duration: 0,
          issues: [`Test execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
          metrics: {
            dataPointsValidated: 0,
            performanceScore: 0,
            consistencyScore: 0
          }
        };
        results.push(errorResult);
      }
    }
    
    const overallDuration = Date.now() - startTime;
    const passedTests = results.filter(r => r.passed).length;
    const failedTests = results.length - passedTests;
    
    const summary = this.generateTestSummary(results);
    
    const testSuite: IntegrationTestSuite = {
      totalTests: results.length,
      passedTests,
      failedTests,
      overallDuration,
      results,
      summary
    };
    
    debugLog('Integration test suite completed', {
      totalTests: testSuite.totalTests,
      passedTests: testSuite.passedTests,
      failedTests: testSuite.failedTests,
      overallDuration: testSuite.overallDuration
    });
    
    return testSuite;
  }

  /**
   * Run individual scenario test
   */
  private static async runScenarioTest(scenario: TestScenario): Promise<TestResult> {
    const startTime = Date.now();
    const issues: string[] = [];
    let dataPointsValidated = 0;
    let performanceScore = 100;
    let consistencyScore = 100;
    
    try {
      // Test 1: Basic matrix generation
      let matrixData: MatrixData | undefined;
      let demandMatrixData: DemandMatrixData | undefined;
      
      if (scenario.forecastType === 'demand-only') {
        const result = await DemandMatrixService.generateDemandMatrix('demand-only');
        demandMatrixData = result.matrixData;
        dataPointsValidated += demandMatrixData.dataPoints.length;
      } else {
        const result = await MatrixServiceCore.generateMatrixForecast(scenario.forecastType);
        matrixData = result.matrixData;
        dataPointsValidated += matrixData.dataPoints.length;
      }
      
      // Test 2: Data structure validation
      if (matrixData) {
        if (matrixData.skills.length < scenario.expectedSkills.length) {
          issues.push(`Expected at least ${scenario.expectedSkills.length} skills, got ${matrixData.skills.length}`);
          consistencyScore -= 20;
        }
        
        if (matrixData.months.length !== scenario.expectedMonths) {
          issues.push(`Expected ${scenario.expectedMonths} months, got ${matrixData.months.length}`);
          consistencyScore -= 15;
        }
        
        // Validate data integrity
        const expectedDataPoints = matrixData.skills.length * matrixData.months.length;
        if (matrixData.dataPoints.length !== expectedDataPoints) {
          issues.push(`Expected ${expectedDataPoints} data points, got ${matrixData.dataPoints.length}`);
          consistencyScore -= 25;
        }
      }
      
      if (demandMatrixData) {
        if (demandMatrixData.skills.length < scenario.expectedSkills.length) {
          issues.push(`Expected at least ${scenario.expectedSkills.length} skills, got ${demandMatrixData.skills.length}`);
          consistencyScore -= 20;
        }
      }
      
      // Test 3: Cross-matrix consistency (if both matrices available)
      if (matrixData && scenario.forecastType !== 'demand-only') {
        try {
          const demandResult = await DemandMatrixService.generateDemandMatrix('demand-only');
          const consistencyResult = CrossMatrixValidator.validateMatrixConsistency({
            capacityMatrix: matrixData,
            demandMatrix: demandResult.matrixData
          });
          
          if (!consistencyResult.isConsistent) {
            issues.push(...consistencyResult.demandConsistency.inconsistencies);
            issues.push(...consistencyResult.capacityIntegrity.issues);
            consistencyScore -= 30;
          }
          
          // Performance scoring based on validation time
          if (consistencyResult.performance.validationTime > 1000) {
            performanceScore -= 20;
          }
        } catch (error) {
          issues.push(`Cross-matrix validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          consistencyScore -= 25;
        }
      }
      
      // Test 4: Enhanced matrix service integration
      if (scenario.testFilters && matrixData) {
        try {
          const enhancedResult = await EnhancedMatrixService.getEnhancedMatrixData(
            scenario.forecastType as 'virtual' | 'actual',
            { includeAnalytics: true, useCache: false }
          );
          
          if (!enhancedResult.matrixData) {
            issues.push('Enhanced matrix service failed to return matrix data');
            performanceScore -= 15;
          }
        } catch (error) {
          issues.push(`Enhanced matrix service test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          performanceScore -= 15;
        }
      }
      
      // Test 5: Export functionality
      if (scenario.testExports && (matrixData || demandMatrixData)) {
        try {
          const testData = matrixData || demandMatrixData!;
          const csvExport = EnhancedMatrixService.generateCSVExport(
            testData,
            testData.skills.slice(0, 2),
            { start: 0, end: 2 }
          );
          
          if (!csvExport || csvExport.length < 100) {
            issues.push('CSV export appears to be empty or invalid');
            performanceScore -= 10;
          }
          
          const jsonExport = EnhancedMatrixService.generateJSONExport(
            testData,
            testData.skills.slice(0, 2),
            { start: 0, end: 2 }
          );
          
          if (!jsonExport || jsonExport.length < 100) {
            issues.push('JSON export appears to be empty or invalid');
            performanceScore -= 10;
          }
        } catch (error) {
          issues.push(`Export functionality test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          performanceScore -= 15;
        }
      }
      
    } catch (error) {
      issues.push(`Scenario test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      performanceScore = 0;
      consistencyScore = 0;
    }
    
    const duration = Date.now() - startTime;
    const passed = issues.length === 0;
    
    return {
      scenario: scenario.name,
      passed,
      duration,
      issues,
      metrics: {
        dataPointsValidated,
        performanceScore: Math.max(0, performanceScore),
        consistencyScore: Math.max(0, consistencyScore)
      }
    };
  }

  /**
   * Generate comprehensive test summary
   */
  private static generateTestSummary(results: TestResult[]) {
    const criticalIssues: string[] = [];
    const recommendations: string[] = [];
    
    // Identify critical issues
    results.forEach(result => {
      if (!result.passed) {
        result.issues.forEach(issue => {
          if (issue.includes('consistency') || issue.includes('mismatch') || issue.includes('failed')) {
            criticalIssues.push(`[${result.scenario}] ${issue}`);
          }
        });
      }
    });
    
    // Generate recommendations
    const avgPerformanceScore = results.reduce((sum, r) => sum + r.metrics.performanceScore, 0) / results.length;
    const avgConsistencyScore = results.reduce((sum, r) => sum + r.metrics.consistencyScore, 0) / results.length;
    
    if (avgPerformanceScore < 80) {
      recommendations.push('Performance optimization needed - consider caching improvements');
    }
    
    if (avgConsistencyScore < 90) {
      recommendations.push('Data consistency issues detected - review validation logic');
    }
    
    if (results.some(r => r.duration > 5000)) {
      recommendations.push('Some tests are taking too long - investigate performance bottlenecks');
    }
    
    // Performance analysis
    const performanceAnalysis = PerformanceOptimizer.analyzePerformance();
    const performanceReport = [
      `Average Performance Score: ${avgPerformanceScore.toFixed(1)}/100`,
      `Average Consistency Score: ${avgConsistencyScore.toFixed(1)}/100`,
      `Cache Statistics: ${performanceAnalysis.cacheStats.skillMappingCacheSize} skill mappings, ${performanceAnalysis.cacheStats.transformationCacheSize} transformations`,
      `Redundant Operations: ${performanceAnalysis.cacheStats.redundantOperations}`,
      performanceAnalysis.bottlenecks.length > 0 ? `Bottlenecks: ${performanceAnalysis.bottlenecks.join(', ')}` : 'No performance bottlenecks detected'
    ].join('\n');
    
    return {
      criticalIssues,
      recommendations: [...recommendations, ...performanceAnalysis.recommendations],
      performanceReport
    };
  }

  /**
   * Generate detailed test report
   */
  static generateTestReport(testSuite: IntegrationTestSuite): string {
    const report = [
      '=== INTEGRATION TEST SUITE REPORT ===',
      `Total Tests: ${testSuite.totalTests}`,
      `Passed: ${testSuite.passedTests}`,
      `Failed: ${testSuite.failedTests}`,
      `Success Rate: ${((testSuite.passedTests / testSuite.totalTests) * 100).toFixed(1)}%`,
      `Total Duration: ${testSuite.overallDuration}ms`,
      '',
      '--- Test Results ---'
    ];
    
    testSuite.results.forEach(result => {
      report.push(`${result.scenario}: ${result.passed ? 'PASS' : 'FAIL'} (${result.duration}ms)`);
      report.push(`  Performance: ${result.metrics.performanceScore}/100, Consistency: ${result.metrics.consistencyScore}/100`);
      report.push(`  Data Points: ${result.metrics.dataPointsValidated}`);
      
      if (result.issues.length > 0) {
        report.push('  Issues:');
        result.issues.forEach(issue => {
          report.push(`    - ${issue}`);
        });
      }
      report.push('');
    });
    
    report.push('--- Performance Report ---');
    report.push(testSuite.summary.performanceReport);
    report.push('');
    
    if (testSuite.summary.criticalIssues.length > 0) {
      report.push('--- Critical Issues ---');
      testSuite.summary.criticalIssues.forEach(issue => {
        report.push(`❌ ${issue}`);
      });
      report.push('');
    }
    
    if (testSuite.summary.recommendations.length > 0) {
      report.push('--- Recommendations ---');
      testSuite.summary.recommendations.forEach(rec => {
        report.push(`💡 ${rec}`);
      });
    }
    
    report.push('');
    report.push(testSuite.passedTests === testSuite.totalTests ? 
      '✅ All tests passed! Integration is successful.' :
      '❌ Some tests failed. Review issues and recommendations above.');
    
    return report.join('\n');
  }
}
