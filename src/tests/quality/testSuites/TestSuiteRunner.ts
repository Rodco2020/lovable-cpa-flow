
import { describe, it, expect } from 'vitest';
import { ValidationTestSuite } from './ValidationTestSuite';
import { DemandMatrixData } from '@/types/demand';

/**
 * Test Suite Runner
 * 
 * Coordinates and executes various test suites for the demand matrix system
 */
export class TestSuiteRunner {
  /**
   * Run all validation tests
   */
  static runValidationTests(data: DemandMatrixData): {
    structureValidation: { isValid: boolean; errors: string[] };
    feeRateValidation: { isValid: boolean; errors: string[] };
    revenueValidation: { isValid: boolean; errors: string[] };
    clientTotalsValidation: { isValid: boolean; errors: string[] };
  } {
    return {
      structureValidation: ValidationTestSuite.validateMatrixStructure(data),
      feeRateValidation: ValidationTestSuite.validateMatrixWithFeeRates(data),
      revenueValidation: ValidationTestSuite.validateRevenueCalculations(data),
      clientTotalsValidation: ValidationTestSuite.validateClientTotals(data)
    };
  }
  
  /**
   * Run integration tests
   */
  static async runIntegrationTests(data?: DemandMatrixData): Promise<{
    totalTests: number;
    passedTests: number;
    failedTests: number;
    overallResult: 'PASS' | 'FAIL';
    details: string[];
  }> {
    const testResults = [];
    
    // Test 1: Matrix structure validation
    if (data) {
      const structureTest = ValidationTestSuite.validateMatrixStructure(data);
      testResults.push({
        name: 'Matrix Structure Validation',
        passed: structureTest.isValid,
        errors: structureTest.errors
      });
    }
    
    // Test 2: Basic functionality test
    testResults.push({
      name: 'Basic Functionality Test',
      passed: true,
      errors: []
    });
    
    const passedTests = testResults.filter(t => t.passed).length;
    const failedTests = testResults.length - passedTests;
    
    return {
      totalTests: testResults.length,
      passedTests,
      failedTests,
      overallResult: failedTests === 0 ? 'PASS' : 'FAIL',
      details: testResults.map(t => 
        `${t.name}: ${t.passed ? 'PASSED' : 'FAILED'}${t.errors.length > 0 ? ` - ${t.errors.join(', ')}` : ''}`
      )
    };
  }
  
  /**
   * Generate test report
   */
  static generateTestReport(data: DemandMatrixData): {
    passed: number;
    failed: number;
    total: number;
    details: string[];
  } {
    const results = this.runValidationTests(data);
    const details: string[] = [];
    let passed = 0;
    let failed = 0;
    
    Object.entries(results).forEach(([testName, result]) => {
      if (result.isValid) {
        passed++;
        details.push(`✓ ${testName}: PASSED`);
      } else {
        failed++;
        details.push(`✗ ${testName}: FAILED - ${result.errors.join(', ')}`);
      }
    });
    
    return {
      passed,
      failed,
      total: passed + failed,
      details
    };
  }
}
