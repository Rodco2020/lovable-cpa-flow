
/**
 * Test Suite Runner
 * 
 * Runs comprehensive integration tests for the demand matrix functionality
 */

import { TestSuiteResult } from '../QualityAssuranceOrchestrator';
import { DemandMatrixTestSuite } from './DemandMatrixTestSuite';
import { RevenueCalculationTestSuite } from './RevenueCalculationTestSuite';
import { ValidationTestSuite } from './ValidationTestSuite';
import { IntegrationTestSuite } from './IntegrationTestSuite';

export class TestSuiteRunner {
  /**
   * Run all integration tests
   */
  public static async runIntegrationTests(): Promise<TestSuiteResult> {
    const startTime = Date.now();
    const testResults: Array<{ name: string; passed: boolean; duration: number }> = [];
    const criticalFailures: string[] = [];

    try {
      // Run demand matrix tests
      const demandMatrixResult = await DemandMatrixTestSuite.runTests();
      testResults.push({
        name: 'Demand Matrix Tests',
        passed: demandMatrixResult.passed,
        duration: demandMatrixResult.duration
      });

      if (!demandMatrixResult.passed) {
        criticalFailures.push(`Demand Matrix Tests: ${demandMatrixResult.error}`);
      }

      // Run revenue calculation tests
      const revenueResult = await RevenueCalculationTestSuite.runTests();
      testResults.push({
        name: 'Revenue Calculation Tests',
        passed: revenueResult.passed,
        duration: revenueResult.duration
      });

      if (!revenueResult.passed) {
        criticalFailures.push(`Revenue Calculation Tests: ${revenueResult.error}`);
      }

      // Run validation tests
      const validationResult = await ValidationTestSuite.runTests();
      testResults.push({
        name: 'Validation Tests',
        passed: validationResult.passed,
        duration: validationResult.duration
      });

      if (!validationResult.passed) {
        criticalFailures.push(`Validation Tests: ${validationResult.error}`);
      }

      // Run integration tests
      const integrationResult = await IntegrationTestSuite.runTests();
      testResults.push({
        name: 'Integration Tests',
        passed: integrationResult.passed,
        duration: integrationResult.duration
      });

      if (!integrationResult.passed) {
        criticalFailures.push(`Integration Tests: ${integrationResult.error}`);
      }

      // Calculate results
      const totalTests = testResults.length;
      const passedTests = testResults.filter(t => t.passed).length;
      const failedTests = totalTests - passedTests;
      const coverage = this.calculateCoverage(testResults);
      const duration = Date.now() - startTime;

      console.log(`📊 Integration Tests Summary:`);
      console.log(`   Total Tests: ${totalTests}`);
      console.log(`   Passed: ${passedTests}`);
      console.log(`   Failed: ${failedTests}`);
      console.log(`   Coverage: ${coverage}%`);
      console.log(`   Duration: ${duration}ms`);

      return {
        passed: criticalFailures.length === 0,
        coverage,
        totalTests,
        passedTests,
        failedTests,
        duration,
        criticalFailures
      };

    } catch (error) {
      console.error('❌ Test Suite Runner failed:', error);
      
      return {
        passed: false,
        coverage: 0,
        totalTests: 0,
        passedTests: 0,
        failedTests: 1,
        duration: Date.now() - startTime,
        criticalFailures: [`Test Suite Runner Error: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * Calculate test coverage based on test results
   */
  private static calculateCoverage(testResults: Array<{ name: string; passed: boolean }>): number {
    if (testResults.length === 0) return 0;
    
    const passedTests = testResults.filter(t => t.passed).length;
    return Math.round((passedTests / testResults.length) * 100);
  }

  /**
   * Run specific test suite by name
   */
  public static async runSpecificTestSuite(suiteName: string): Promise<{ passed: boolean; duration: number; error?: string }> {
    const startTime = Date.now();

    try {
      switch (suiteName.toLowerCase()) {
        case 'demand-matrix':
          return await DemandMatrixTestSuite.runTests();
        case 'revenue-calculation':
          return await RevenueCalculationTestSuite.runTests();
        case 'validation':
          return await ValidationTestSuite.runTests();
        case 'integration':
          return await IntegrationTestSuite.runTests();
        default:
          throw new Error(`Unknown test suite: ${suiteName}`);
      }
    } catch (error) {
      return {
        passed: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
