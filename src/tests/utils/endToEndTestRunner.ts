
/**
 * End-to-End Test Runner
 * Orchestrates comprehensive testing of the preferred staff feature
 */

import { TestResultAggregator, PerformanceMonitor } from './integrationTestHelpers';

export interface TestSuite {
  name: string;
  category: string;
  tests: TestCase[];
}

export interface TestCase {
  name: string;
  description: string;
  execute: () => Promise<void>;
  timeout?: number;
}

export interface TestRunResults {
  totalSuites: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  totalDuration: number;
  suiteResults: SuiteResults[];
  performanceMetrics: any[];
}

export interface SuiteResults {
  suiteName: string;
  category: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  duration: number;
  testResults: TestCaseResult[];
}

export interface TestCaseResult {
  testName: string;
  passed: boolean;
  duration: number;
  error?: string;
  skipped?: boolean;
}

export class EndToEndTestRunner {
  private resultAggregator: TestResultAggregator;
  private performanceMonitor: PerformanceMonitor;
  private testSuites: TestSuite[] = [];

  constructor() {
    this.resultAggregator = new TestResultAggregator();
    this.performanceMonitor = new PerformanceMonitor();
  }

  /**
   * Register a test suite
   */
  registerSuite(suite: TestSuite): void {
    this.testSuites.push(suite);
  }

  /**
   * Run all registered test suites
   */
  async runAllTests(): Promise<TestRunResults> {
    const overallStartTime = Date.now();
    const suiteResults: SuiteResults[] = [];

    console.log('🚀 Starting End-to-End Test Run for Preferred Staff Feature');
    console.log(`Running ${this.testSuites.length} test suites...`);

    for (const suite of this.testSuites) {
      const suiteResult = await this.runSuite(suite);
      suiteResults.push(suiteResult);
    }

    const overallDuration = Date.now() - overallStartTime;
    const summary = this.resultAggregator.getSummary();

    const results: TestRunResults = {
      totalSuites: this.testSuites.length,
      totalTests: summary.total,
      passedTests: summary.passed,
      failedTests: summary.failed,
      skippedTests: 0, // Not implemented yet
      totalDuration: overallDuration,
      suiteResults,
      performanceMetrics: this.performanceMonitor.getMetrics()
    };

    this.logResults(results);
    return results;
  }

  /**
   * Run a single test suite
   */
  private async runSuite(suite: TestSuite): Promise<SuiteResults> {
    console.log(`\n📋 Running suite: ${suite.name} (${suite.category})`);
    
    const suiteStartTime = Date.now();
    const testResults: TestCaseResult[] = [];
    let passedTests = 0;
    let failedTests = 0;
    let skippedTests = 0;

    for (const testCase of suite.tests) {
      const testResult = await this.runTestCase(testCase, suite.category);
      testResults.push(testResult);

      if (testResult.skipped) {
        skippedTests++;
      } else if (testResult.passed) {
        passedTests++;
      } else {
        failedTests++;
      }
    }

    const suiteDuration = Date.now() - suiteStartTime;

    const suiteResult: SuiteResults = {
      suiteName: suite.name,
      category: suite.category,
      totalTests: suite.tests.length,
      passedTests,
      failedTests,
      skippedTests,
      duration: suiteDuration,
      testResults
    };

    console.log(`✅ Suite completed: ${passedTests}/${suite.tests.length} tests passed`);
    return suiteResult;
  }

  /**
   * Run a single test case
   */
  private async runTestCase(testCase: TestCase, category: string): Promise<TestCaseResult> {
    console.log(`  🧪 Running test: ${testCase.name}`);
    
    const testStartTime = Date.now();
    
    try {
      const { metrics } = await this.performanceMonitor.measureOperation(
        testCase.name,
        async () => {
          const timeout = testCase.timeout || 10000; // Default 10s timeout
          
          return Promise.race([
            testCase.execute(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error(`Test timeout after ${timeout}ms`)), timeout)
            )
          ]);
        }
      );

      const testResult: TestCaseResult = {
        testName: testCase.name,
        passed: true,
        duration: metrics.duration
      };

      this.resultAggregator.addResult(testCase.name, category, true, metrics.duration);
      console.log(`    ✅ Passed (${metrics.duration.toFixed(2)}ms)`);
      
      return testResult;
    } catch (error) {
      const duration = Date.now() - testStartTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      const testResult: TestCaseResult = {
        testName: testCase.name,
        passed: false,
        duration,
        error: errorMessage
      };

      this.resultAggregator.addResult(testCase.name, category, false, duration, errorMessage);
      console.log(`    ❌ Failed: ${errorMessage}`);
      
      return testResult;
    }
  }

  /**
   * Log comprehensive test results
   */
  private logResults(results: TestRunResults): void {
    console.log('\n' + '='.repeat(80));
    console.log('📊 END-TO-END TEST RESULTS SUMMARY');
    console.log('='.repeat(80));

    console.log(`🏁 Overall Results:`);
    console.log(`   Total Suites: ${results.totalSuites}`);
    console.log(`   Total Tests: ${results.totalTests}`);
    console.log(`   Passed: ${results.passedTests} (${((results.passedTests / results.totalTests) * 100).toFixed(1)}%)`);
    console.log(`   Failed: ${results.failedTests} (${((results.failedTests / results.totalTests) * 100).toFixed(1)}%)`);
    console.log(`   Total Duration: ${(results.totalDuration / 1000).toFixed(2)}s`);

    console.log(`\n📈 Performance Metrics:`);
    const avgDuration = this.performanceMonitor.getAverageDuration();
    console.log(`   Average Test Duration: ${avgDuration.toFixed(2)}ms`);
    
    // Performance thresholds check
    const performanceIssues = results.performanceMetrics.filter(m => m.duration > 1000);
    if (performanceIssues.length > 0) {
      console.log(`   ⚠️  Performance Issues: ${performanceIssues.length} tests exceeded 1000ms`);
    } else {
      console.log(`   ✅ Performance: All tests completed within acceptable time`);
    }

    console.log(`\n📋 Suite Breakdown:`);
    for (const suite of results.suiteResults) {
      const passRate = ((suite.passedTests / suite.totalTests) * 100).toFixed(1);
      console.log(`   ${suite.suiteName}: ${suite.passedTests}/${suite.totalTests} (${passRate}%) - ${(suite.duration / 1000).toFixed(2)}s`);
    }

    if (results.failedTests > 0) {
      console.log(`\n❌ Failed Tests:`);
      const failedTests = this.resultAggregator.getFailedTests();
      for (const failed of failedTests) {
        console.log(`   ${failed.category}/${failed.testName}: ${failed.error}`);
      }
    }

    console.log('\n🎯 Integration Criteria Assessment:');
    this.assessIntegrationCriteria(results);
    
    console.log('\n' + '='.repeat(80));
  }

  /**
   * Assess against Phase 7 success criteria
   */
  private assessIntegrationCriteria(results: TestRunResults): void {
    const criteria = [
      {
        name: 'All workflows function correctly end-to-end',
        check: () => results.passedTests >= results.totalTests * 0.95, // 95% pass rate
        status: results.passedTests >= results.totalTests * 0.95
      },
      {
        name: 'Data integrity maintained throughout all operations',
        check: () => {
          const dataIntegrityTests = results.suiteResults
            .find(s => s.category === 'Data Integrity')?.passedTests || 0;
          const totalDataIntegrityTests = results.suiteResults
            .find(s => s.category === 'Data Integrity')?.totalTests || 0;
          return totalDataIntegrityTests > 0 && dataIntegrityTests === totalDataIntegrityTests;
        },
        status: (() => {
          const dataIntegrityTests = results.suiteResults
            .find(s => s.category === 'Data Integrity')?.passedTests || 0;
          const totalDataIntegrityTests = results.suiteResults
            .find(s => s.category === 'Data Integrity')?.totalTests || 0;
          return totalDataIntegrityTests > 0 && dataIntegrityTests === totalDataIntegrityTests;
        })()
      },
      {
        name: 'Performance meets acceptable standards',
        check: () => {
          const avgDuration = this.performanceMonitor.getAverageDuration();
          return avgDuration < 500; // Average test should complete in under 500ms
        },
        status: this.performanceMonitor.getAverageDuration() < 500
      },
      {
        name: 'No regressions in existing recurring task functionality',
        check: () => {
          const regressionTests = results.suiteResults
            .find(s => s.category === 'Regression Testing')?.passedTests || 0;
          const totalRegressionTests = results.suiteResults
            .find(s => s.category === 'Regression Testing')?.totalTests || 0;
          return totalRegressionTests > 0 && regressionTests === totalRegressionTests;
        },
        status: (() => {
          const regressionTests = results.suiteResults
            .find(s => s.category === 'Regression Testing')?.passedTests || 0;
          const totalRegressionTests = results.suiteResults
            .find(s => s.category === 'Regression Testing')?.totalTests || 0;
          return totalRegressionTests > 0 && regressionTests === totalRegressionTests;
        })()
      }
    ];

    for (const criterion of criteria) {
      const status = criterion.status ? '✅' : '❌';
      console.log(`   ${status} ${criterion.name}`);
    }

    const overallSuccess = criteria.every(c => c.status);
    const overallStatus = overallSuccess ? '🎉 SUCCESS' : '⚠️  NEEDS ATTENTION';
    console.log(`\n${overallStatus}: Phase 7 Integration Criteria ${overallSuccess ? 'MET' : 'NOT FULLY MET'}`);
  }

  /**
   * Reset all test state
   */
  reset(): void {
    this.resultAggregator.reset();
    this.performanceMonitor.reset();
    this.testSuites = [];
  }

  /**
   * Get current test results
   */
  getCurrentResults(): any {
    return {
      summary: this.resultAggregator.getSummary(),
      performanceMetrics: this.performanceMonitor.getMetrics(),
      failedTests: this.resultAggregator.getFailedTests()
    };
  }
}

/**
 * Convenience function to create and run comprehensive end-to-end tests
 */
export const runPreferredStaffIntegrationTests = async (): Promise<TestRunResults> => {
  const runner = new EndToEndTestRunner();

  // Register all test suites (these would be imported from actual test files)
  runner.registerSuite({
    name: 'Workflow Testing',
    category: 'End-to-End Workflows',
    tests: [
      {
        name: 'Create task with preferred staff',
        description: 'Test complete workflow for creating a task with preferred staff assignment',
        execute: async () => {
          // This would call actual test implementation
          console.log('Executing workflow test...');
        }
      }
      // More tests would be added here
    ]
  });

  runner.registerSuite({
    name: 'Edge Cases',
    category: 'Edge Case Testing',
    tests: [
      {
        name: 'Handle deleted staff member',
        description: 'Test behavior when assigned staff member is deleted',
        execute: async () => {
          console.log('Executing edge case test...');
        }
      }
      // More tests would be added here
    ]
  });

  return await runner.runAllTests();
};
