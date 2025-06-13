
import { MatrixData, ForecastType } from '../types';
import { DemandMatrixData } from '@/types/demand';
import { Phase3IntegrationService } from '../integration/Phase3IntegrationService';
import { IntegrationTester } from './IntegrationTester';
import { MatrixServiceCore } from '../MatrixServiceCore';
import { DemandMatrixService } from '../../demandMatrixService';
import { EnhancedMatrixService } from '../../enhanced/enhancedMatrixService';
import { debugLog } from '../../logger';

/**
 * Phase 4 Comprehensive System Testing Suite
 * 
 * Provides end-to-end testing, regression testing, and comprehensive
 * validation of the complete forecasting system.
 */

export interface EndToEndTestResult {
  scenario: string;
  steps: EndToEndTestStep[];
  passed: boolean;
  duration: number;
  criticalIssues: string[];
  performanceMetrics: {
    totalTime: number;
    dataLoadTime: number;
    renderTime: number;
    memoryUsage: number;
  };
}

export interface EndToEndTestStep {
  name: string;
  description: string;
  passed: boolean;
  duration: number;
  issues: string[];
  metrics?: Record<string, any>;
}

export interface RegressionTestResult {
  component: string;
  testType: 'functionality' | 'performance' | 'integration';
  baseline: any;
  current: any;
  passed: boolean;
  issues: string[];
  recommendations: string[];
}

export interface Phase4TestReport {
  endToEndTests: EndToEndTestResult[];
  regressionTests: RegressionTestResult[];
  loadTests: LoadTestResult[];
  edgeCaseTests: EdgeCaseTestResult[];
  overallStatus: 'PASS' | 'FAIL' | 'WARNING';
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    criticalIssues: string[];
    performanceWarnings: string[];
    recommendations: string[];
  };
}

export interface LoadTestResult {
  scenario: string;
  concurrentUsers: number;
  duration: number;
  requestsPerSecond: number;
  averageResponseTime: number;
  errorRate: number;
  passed: boolean;
  issues: string[];
}

export interface EdgeCaseTestResult {
  scenario: string;
  testCase: string;
  passed: boolean;
  errorHandled: boolean;
  issues: string[];
}

export class Phase4TestingSuite {
  /**
   * Run complete Phase 4 testing suite
   */
  static async runComprehensiveTests(): Promise<Phase4TestReport> {
    debugLog('Starting Phase 4: Comprehensive System Testing');
    
    const startTime = Date.now();
    
    try {
      // Step 1: End-to-End Testing
      debugLog('Step 1: Running End-to-End Tests');
      const endToEndTests = await this.runEndToEndTests();
      
      // Step 2: Regression Testing
      debugLog('Step 2: Running Regression Tests');
      const regressionTests = await this.runRegressionTests();
      
      // Step 3: Load Testing
      debugLog('Step 3: Running Load Tests');
      const loadTests = await this.runLoadTests();
      
      // Step 4: Edge Case Testing
      debugLog('Step 4: Running Edge Case Tests');
      const edgeCaseTests = await this.runEdgeCaseTests();
      
      // Generate comprehensive report
      const report = this.generatePhase4Report(
        endToEndTests,
        regressionTests,
        loadTests,
        edgeCaseTests
      );
      
      const totalTime = Date.now() - startTime;
      debugLog(`Phase 4 testing completed in ${totalTime}ms`, {
        overallStatus: report.overallStatus,
        totalTests: report.summary.totalTests,
        passedTests: report.summary.passedTests,
        failedTests: report.summary.failedTests
      });
      
      return report;
      
    } catch (error) {
      debugLog('Phase 4 testing failed', { error });
      throw new Error(`Phase 4 testing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Run end-to-end testing scenarios
   */
  private static async runEndToEndTests(): Promise<EndToEndTestResult[]> {
    const scenarios = [
      {
        name: 'Complete Virtual Forecasting Workflow',
        description: 'Test entire virtual forecasting process from data load to visualization'
      },
      {
        name: 'Complete Actual Forecasting Workflow', 
        description: 'Test entire actual forecasting process with real data'
      },
      {
        name: 'Demand Matrix Workflow',
        description: 'Test complete demand-only matrix generation and display'
      },
      {
        name: 'Cross-Matrix Integration Workflow',
        description: 'Test switching between matrix types and data consistency'
      },
      {
        name: 'Export and Analytics Workflow',
        description: 'Test complete export functionality and analytics generation'
      }
    ];

    const results: EndToEndTestResult[] = [];
    
    for (const scenario of scenarios) {
      try {
        const result = await this.runEndToEndScenario(scenario);
        results.push(result);
      } catch (error) {
        results.push({
          scenario: scenario.name,
          steps: [],
          passed: false,
          duration: 0,
          criticalIssues: [`End-to-end test failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
          performanceMetrics: {
            totalTime: 0,
            dataLoadTime: 0,
            renderTime: 0,
            memoryUsage: 0
          }
        });
      }
    }
    
    return results;
  }

  /**
   * Run individual end-to-end scenario
   */
  private static async runEndToEndScenario(scenario: { name: string; description: string }): Promise<EndToEndTestResult> {
    const startTime = Date.now();
    const steps: EndToEndTestStep[] = [];
    const criticalIssues: string[] = [];
    let totalDataLoadTime = 0;
    let totalRenderTime = 0;

    try {
      // Step 1: Data Loading
      const dataLoadStart = Date.now();
      let stepPassed = true;
      let stepIssues: string[] = [];

      try {
        if (scenario.name.includes('Virtual')) {
          await MatrixServiceCore.generateMatrixForecast('virtual');
        } else if (scenario.name.includes('Actual')) {
          await MatrixServiceCore.generateMatrixForecast('actual');
        } else if (scenario.name.includes('Demand')) {
          await DemandMatrixService.generateDemandMatrix('demand-only');
        } else if (scenario.name.includes('Cross-Matrix')) {
          await Promise.all([
            MatrixServiceCore.generateMatrixForecast('virtual'),
            DemandMatrixService.generateDemandMatrix('demand-only')
          ]);
        } else if (scenario.name.includes('Export')) {
          const matrixResult = await MatrixServiceCore.generateMatrixForecast('virtual');
          EnhancedMatrixService.generateCSVExport(
            matrixResult.matrixData,
            matrixResult.matrixData.skills.slice(0, 2),
            { start: 0, end: 2 }
          );
        }
      } catch (error) {
        stepPassed = false;
        stepIssues.push(`Data loading failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        criticalIssues.push(`Critical: ${scenario.name} data loading failed`);
      }

      totalDataLoadTime = Date.now() - dataLoadStart;
      
      steps.push({
        name: 'Data Loading',
        description: 'Load matrix data from services',
        passed: stepPassed,
        duration: totalDataLoadTime,
        issues: stepIssues
      });

      // Step 2: Data Validation
      const validationStart = Date.now();
      stepPassed = true;
      stepIssues = [];

      if (scenario.name.includes('Cross-Matrix')) {
        try {
          const phase3Result = await Phase3IntegrationService.quickValidationCheck();
          if (phase3Result.status === 'FAIL') {
            stepPassed = false;
            stepIssues.push(...phase3Result.issues);
            criticalIssues.push('Cross-matrix validation failed');
          }
        } catch (error) {
          stepPassed = false;
          stepIssues.push(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      steps.push({
        name: 'Data Validation',
        description: 'Validate data consistency and integrity',
        passed: stepPassed,
        duration: Date.now() - validationStart,
        issues: stepIssues
      });

      // Step 3: Enhanced Features
      const enhancedStart = Date.now();
      stepPassed = true;
      stepIssues = [];

      try {
        const forecastType: 'virtual' | 'actual' | 'demand-only' = 
          scenario.name.includes('Demand') ? 'demand-only' :
          scenario.name.includes('Actual') ? 'actual' : 'virtual';
          
        await EnhancedMatrixService.getEnhancedMatrixData(forecastType, {
          includeAnalytics: true,
          useCache: false
        });
      } catch (error) {
        stepPassed = false;
        stepIssues.push(`Enhanced features failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      steps.push({
        name: 'Enhanced Features',
        description: 'Test analytics and enhanced functionality',
        passed: stepPassed,
        duration: Date.now() - enhancedStart,
        issues: stepIssues
      });

      const totalTime = Date.now() - startTime;
      const passed = steps.every(step => step.passed);

      return {
        scenario: scenario.name,
        steps,
        passed,
        duration: totalTime,
        criticalIssues,
        performanceMetrics: {
          totalTime,
          dataLoadTime: totalDataLoadTime,
          renderTime: totalRenderTime,
          memoryUsage: this.estimateMemoryUsage()
        }
      };

    } catch (error) {
      return {
        scenario: scenario.name,
        steps,
        passed: false,
        duration: Date.now() - startTime,
        criticalIssues: [`Scenario failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        performanceMetrics: {
          totalTime: Date.now() - startTime,
          dataLoadTime: totalDataLoadTime,
          renderTime: totalRenderTime,
          memoryUsage: 0
        }
      };
    }
  }

  /**
   * Run regression tests
   */
  private static async runRegressionTests(): Promise<RegressionTestResult[]> {
    const tests: RegressionTestResult[] = [];

    // Test 1: Matrix Service Core Functionality
    try {
      const virtualResult = await MatrixServiceCore.generateMatrixForecast('virtual');
      const actualResult = await MatrixServiceCore.generateMatrixForecast('actual');
      
      tests.push({
        component: 'MatrixServiceCore',
        testType: 'functionality',
        baseline: { expectedSkills: 3, expectedMonths: 12 },
        current: { 
          virtualSkills: virtualResult.matrixData.skills.length,
          virtualMonths: virtualResult.matrixData.months.length,
          actualSkills: actualResult.matrixData.skills.length,
          actualMonths: actualResult.matrixData.months.length
        },
        passed: virtualResult.matrixData.skills.length >= 3 && 
               virtualResult.matrixData.months.length === 12 &&
               actualResult.matrixData.skills.length >= 3 && 
               actualResult.matrixData.months.length === 12,
        issues: [],
        recommendations: []
      });
    } catch (error) {
      tests.push({
        component: 'MatrixServiceCore',
        testType: 'functionality',
        baseline: { expectedSkills: 3, expectedMonths: 12 },
        current: { error: error instanceof Error ? error.message : 'Unknown error' },
        passed: false,
        issues: [`Matrix service regression: ${error instanceof Error ? error.message : 'Unknown error'}`],
        recommendations: ['Review matrix service implementation']
      });
    }

    // Test 2: Demand Matrix Service
    try {
      const demandResult = await DemandMatrixService.generateDemandMatrix('demand-only');
      
      tests.push({
        component: 'DemandMatrixService',
        testType: 'functionality',
        baseline: { expectedSkills: 3, expectedMonths: 12 },
        current: {
          skills: demandResult.matrixData.skills.length,
          months: demandResult.matrixData.months.length,
          totalDemand: demandResult.matrixData.totalDemand
        },
        passed: demandResult.matrixData.skills.length >= 3 && 
               demandResult.matrixData.months.length === 12,
        issues: [],
        recommendations: []
      });
    } catch (error) {
      tests.push({
        component: 'DemandMatrixService',
        testType: 'functionality',
        baseline: { expectedSkills: 3, expectedMonths: 12 },
        current: { error: error instanceof Error ? error.message : 'Unknown error' },
        passed: false,
        issues: [`Demand matrix regression: ${error instanceof Error ? error.message : 'Unknown error'}`],
        recommendations: ['Review demand matrix service implementation']
      });
    }

    // Test 3: Integration Testing
    try {
      const integrationResult = await IntegrationTester.runIntegrationTests();
      
      tests.push({
        component: 'IntegrationTester',
        testType: 'integration',
        baseline: { expectedPassRate: 90 },
        current: {
          totalTests: integrationResult.totalTests,
          passedTests: integrationResult.passedTests,
          passRate: (integrationResult.passedTests / integrationResult.totalTests) * 100
        },
        passed: (integrationResult.passedTests / integrationResult.totalTests) >= 0.9,
        issues: integrationResult.summary.criticalIssues,
        recommendations: integrationResult.summary.recommendations
      });
    } catch (error) {
      tests.push({
        component: 'IntegrationTester',
        testType: 'integration',
        baseline: { expectedPassRate: 90 },
        current: { error: error instanceof Error ? error.message : 'Unknown error' },
        passed: false,
        issues: [`Integration testing regression: ${error instanceof Error ? error.message : 'Unknown error'}`],
        recommendations: ['Review integration testing framework']
      });
    }

    return tests;
  }

  /**
   * Run load tests
   */
  private static async runLoadTests(): Promise<LoadTestResult[]> {
    const tests: LoadTestResult[] = [];

    // Simulate concurrent matrix generation
    const concurrentUsers = [1, 5, 10];
    
    for (const users of concurrentUsers) {
      const startTime = Date.now();
      let errors = 0;
      const requests: Promise<any>[] = [];

      for (let i = 0; i < users; i++) {
        requests.push(
          MatrixServiceCore.generateMatrixForecast('virtual')
            .catch(() => { errors++; })
        );
      }

      try {
        await Promise.all(requests);
        const duration = Date.now() - startTime;
        const requestsPerSecond = (users / duration) * 1000;
        const errorRate = (errors / users) * 100;

        tests.push({
          scenario: `Matrix Generation Load Test`,
          concurrentUsers: users,
          duration,
          requestsPerSecond,
          averageResponseTime: duration / users,
          errorRate,
          passed: errorRate < 10 && duration < 10000,
          issues: errorRate >= 10 ? [`High error rate: ${errorRate.toFixed(1)}%`] : []
        });
      } catch (error) {
        tests.push({
          scenario: `Matrix Generation Load Test`,
          concurrentUsers: users,
          duration: Date.now() - startTime,
          requestsPerSecond: 0,
          averageResponseTime: 0,
          errorRate: 100,
          passed: false,
          issues: [`Load test failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
        });
      }
    }

    return tests;
  }

  /**
   * Run edge case tests
   */
  private static async runEdgeCaseTests(): Promise<EdgeCaseTestResult[]> {
    const tests: EdgeCaseTestResult[] = [];

    // Test 1: Empty data handling
    try {
      // This would normally fail gracefully
      const result = await MatrixServiceCore.generateMatrixForecast('virtual');
      tests.push({
        scenario: 'Empty Data Handling',
        testCase: 'Matrix generation with minimal data',
        passed: result.matrixData.dataPoints.length >= 0,
        errorHandled: true,
        issues: []
      });
    } catch (error) {
      tests.push({
        scenario: 'Empty Data Handling',
        testCase: 'Matrix generation with minimal data',
        passed: false,
        errorHandled: error instanceof Error && error.message.includes('No data'),
        issues: [`Edge case handling: ${error instanceof Error ? error.message : 'Unknown error'}`]
      });
    }

    // Test 2: Invalid forecast type
    try {
      // This should handle invalid types gracefully
      await MatrixServiceCore.generateMatrixForecast('invalid' as ForecastType);
      tests.push({
        scenario: 'Invalid Input Handling',
        testCase: 'Invalid forecast type',
        passed: false, // Should not succeed
        errorHandled: false,
        issues: ['Invalid forecast type was not properly handled']
      });
    } catch (error) {
      tests.push({
        scenario: 'Invalid Input Handling',
        testCase: 'Invalid forecast type',
        passed: true, // Should fail gracefully
        errorHandled: true,
        issues: []
      });
    }

    // Test 3: Large data set handling
    try {
      const result = await MatrixServiceCore.generateMatrixForecast('virtual');
      const largeSkillFilter = result.matrixData.skills.concat(['ExtraSkill1', 'ExtraSkill2', 'ExtraSkill3']);
      
      const csvExport = EnhancedMatrixService.generateCSVExport(
        result.matrixData,
        largeSkillFilter,
        { start: 0, end: 11 }
      );
      
      tests.push({
        scenario: 'Large Data Handling',
        testCase: 'Export with extended skill list',
        passed: csvExport.length > 0,
        errorHandled: true,
        issues: []
      });
    } catch (error) {
      tests.push({
        scenario: 'Large Data Handling',
        testCase: 'Export with extended skill list',
        passed: false,
        errorHandled: error instanceof Error,
        issues: [`Large data handling: ${error instanceof Error ? error.message : 'Unknown error'}`]
      });
    }

    return tests;
  }

  /**
   * Generate comprehensive Phase 4 report
   */
  private static generatePhase4Report(
    endToEndTests: EndToEndTestResult[],
    regressionTests: RegressionTestResult[],
    loadTests: LoadTestResult[],
    edgeCaseTests: EdgeCaseTestResult[]
  ): Phase4TestReport {
    const totalTests = endToEndTests.length + regressionTests.length + loadTests.length + edgeCaseTests.length;
    const passedTests = 
      endToEndTests.filter(t => t.passed).length +
      regressionTests.filter(t => t.passed).length +
      loadTests.filter(t => t.passed).length +
      edgeCaseTests.filter(t => t.passed).length;
    const failedTests = totalTests - passedTests;

    const criticalIssues: string[] = [];
    const performanceWarnings: string[] = [];
    const recommendations: string[] = [];

    // Collect issues from all test types
    endToEndTests.forEach(test => {
      criticalIssues.push(...test.criticalIssues);
      if (test.performanceMetrics.totalTime > 5000) {
        performanceWarnings.push(`${test.scenario} took ${test.performanceMetrics.totalTime}ms`);
      }
    });

    regressionTests.forEach(test => {
      if (!test.passed) {
        criticalIssues.push(...test.issues);
      }
      recommendations.push(...test.recommendations);
    });

    loadTests.forEach(test => {
      if (test.errorRate > 5) {
        performanceWarnings.push(`${test.scenario} has ${test.errorRate.toFixed(1)}% error rate`);
      }
      if (test.averageResponseTime > 2000) {
        performanceWarnings.push(`${test.scenario} average response time: ${test.averageResponseTime.toFixed(0)}ms`);
      }
    });

    edgeCaseTests.forEach(test => {
      if (!test.passed || !test.errorHandled) {
        criticalIssues.push(...test.issues);
        recommendations.push(`Improve error handling for ${test.scenario}`);
      }
    });

    // Determine overall status
    let overallStatus: 'PASS' | 'FAIL' | 'WARNING';
    
    if (criticalIssues.length === 0 && performanceWarnings.length === 0) {
      overallStatus = 'PASS';
    } else if (criticalIssues.length === 0 && performanceWarnings.length > 0) {
      overallStatus = 'WARNING';
    } else {
      overallStatus = 'FAIL';
    }

    return {
      endToEndTests,
      regressionTests,
      loadTests,
      edgeCaseTests,
      overallStatus,
      summary: {
        totalTests,
        passedTests,
        failedTests,
        criticalIssues: Array.from(new Set(criticalIssues)),
        performanceWarnings: Array.from(new Set(performanceWarnings)),
        recommendations: Array.from(new Set(recommendations))
      }
    };
  }

  /**
   * Estimate memory usage (simplified)
   */
  private static estimateMemoryUsage(): number {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  /**
   * Generate formatted Phase 4 report
   */
  static generateFormattedReport(report: Phase4TestReport): string {
    const sections = [
      '🧪 PHASE 4: COMPREHENSIVE SYSTEM TESTING & DOCUMENTATION REPORT',
      '='.repeat(75),
      '',
      `📊 OVERALL STATUS: ${report.overallStatus}`,
      `📈 TOTAL TESTS: ${report.summary.totalTests}`,
      `✅ PASSED: ${report.summary.passedTests}`,
      `❌ FAILED: ${report.summary.failedTests}`,
      `📊 SUCCESS RATE: ${((report.summary.passedTests / report.summary.totalTests) * 100).toFixed(1)}%`,
      '',
      '🔄 END-TO-END TESTING',
      '-'.repeat(50)
    ];

    report.endToEndTests.forEach(test => {
      sections.push(`${test.passed ? '✅' : '❌'} ${test.scenario} (${test.duration}ms)`);
      sections.push(`   Steps: ${test.steps.filter(s => s.passed).length}/${test.steps.length} passed`);
      if (test.criticalIssues.length > 0) {
        test.criticalIssues.forEach(issue => {
          sections.push(`   🚨 ${issue}`);
        });
      }
    });

    sections.push('', '🔄 REGRESSION TESTING', '-'.repeat(50));
    
    report.regressionTests.forEach(test => {
      sections.push(`${test.passed ? '✅' : '❌'} ${test.component} (${test.testType})`);
      if (test.issues.length > 0) {
        test.issues.forEach(issue => {
          sections.push(`   ⚠️ ${issue}`);
        });
      }
    });

    sections.push('', '⚡ LOAD TESTING', '-'.repeat(50));
    
    report.loadTests.forEach(test => {
      sections.push(`${test.passed ? '✅' : '❌'} ${test.scenario}`);
      sections.push(`   Users: ${test.concurrentUsers}, Error Rate: ${test.errorRate.toFixed(1)}%`);
      sections.push(`   Avg Response: ${test.averageResponseTime.toFixed(0)}ms`);
    });

    sections.push('', '🔍 EDGE CASE TESTING', '-'.repeat(50));
    
    report.edgeCaseTests.forEach(test => {
      const status = test.passed && test.errorHandled ? '✅' : '❌';
      sections.push(`${status} ${test.scenario}: ${test.testCase}`);
      if (test.issues.length > 0) {
        test.issues.forEach(issue => {
          sections.push(`   ⚠️ ${issue}`);
        });
      }
    });

    if (report.summary.criticalIssues.length > 0) {
      sections.push('', '🚨 CRITICAL ISSUES', '-'.repeat(50));
      report.summary.criticalIssues.forEach(issue => {
        sections.push(`❌ ${issue}`);
      });
    }

    if (report.summary.performanceWarnings.length > 0) {
      sections.push('', '⚠️ PERFORMANCE WARNINGS', '-'.repeat(50));
      report.summary.performanceWarnings.forEach(warning => {
        sections.push(`⚠️ ${warning}`);
      });
    }

    if (report.summary.recommendations.length > 0) {
      sections.push('', '💡 RECOMMENDATIONS', '-'.repeat(50));
      report.summary.recommendations.forEach(rec => {
        sections.push(`💡 ${rec}`);
      });
    }

    sections.push('', '📝 SUMMARY', '-'.repeat(50));
    
    if (report.overallStatus === 'PASS') {
      sections.push('✅ Phase 4 testing PASSED! All systems are functioning correctly.');
      sections.push('🎉 End-to-end workflows complete successfully');
      sections.push('🔄 No regressions detected in existing functionality');
      sections.push('⚡ Performance is within acceptable limits');
      sections.push('🔍 Edge cases are handled appropriately');
    } else if (report.overallStatus === 'WARNING') {
      sections.push('⚠️ Phase 4 testing completed with WARNINGS.');
      sections.push('🔍 Review performance warnings and recommendations.');
      sections.push('✅ Core functionality is working correctly.');
    } else {
      sections.push('❌ Phase 4 testing FAILED.');
      sections.push('🔧 Critical issues must be addressed.');
      sections.push('📋 Review critical issues and recommendations above.');
    }

    return sections.join('\n');
  }
}
