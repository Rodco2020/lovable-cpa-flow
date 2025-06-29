
import { DemandMatrixData } from '@/types/demand';
import { TestSuiteRunner } from './testSuites/TestSuiteRunner';

export interface TestSuiteResult {
  passed: number;
  failed: number;
  total: number;
  details: string[];
  coverage: number;
  duration: number;
  criticalFailures: string[];
}

export interface QualityTestResult {
  testType: string;
  passed: boolean;
  details: string[];
  duration: number;
}

/**
 * Quality Assurance Orchestrator
 * 
 * Coordinates comprehensive quality testing across the demand matrix system
 */
export class QualityAssuranceOrchestrator {
  
  /**
   * Execute comprehensive quality tests
   */
  static async executeQualityTests(data?: DemandMatrixData): Promise<TestSuiteResult> {
    const startTime = performance.now();
    const results: QualityTestResult[] = [];
    
    try {
      // Validation tests
      if (data) {
        const validationResults = TestSuiteRunner.runValidationTests(data);
        
        Object.entries(validationResults).forEach(([testName, result]) => {
          results.push({
            testType: testName,
            passed: result.isValid,
            details: result.errors,
            duration: 0
          });
        });
      }
      
      // Integration tests
      const integrationResults = await TestSuiteRunner.runIntegrationTests(data);
      results.push({
        testType: 'Integration Tests',
        passed: integrationResults.overallResult === 'PASS',
        details: integrationResults.details,
        duration: 0
      });
      
      // Calculate metrics
      const passed = results.filter(r => r.passed).length;
      const failed = results.length - passed;
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Identify critical failures
      const criticalFailures = results
        .filter(r => !r.passed && r.details.some(d => d.includes('critical')))
        .map(r => r.testType);
      
      return {
        passed,
        failed,
        total: results.length,
        details: results.map(r => 
          `${r.testType}: ${r.passed ? 'PASSED' : 'FAILED'}${r.details.length > 0 ? ` - ${r.details.join(', ')}` : ''}`
        ),
        coverage: passed / results.length * 100,
        duration,
        criticalFailures
      };
      
    } catch (error) {
      console.error('Quality test execution failed:', error);
      
      return {
        passed: 0,
        failed: 1,
        total: 1,
        details: [`Quality test execution failed: ${error}`],
        coverage: 0,
        duration: performance.now() - startTime,
        criticalFailures: ['Quality test execution failed']
      };
    }
  }
  
  /**
   * Generate quality report
   */
  static generateQualityReport(results: TestSuiteResult): string {
    const report = [
      '=== QUALITY ASSURANCE REPORT ===',
      '',
      `Total Tests: ${results.total}`,
      `Passed: ${results.passed}`,
      `Failed: ${results.failed}`,
      `Coverage: ${results.coverage.toFixed(2)}%`,
      `Duration: ${results.duration.toFixed(2)}ms`,
      '',
      'Test Details:',
      ...results.details.map(detail => `  - ${detail}`),
      ''
    ];
    
    if (results.criticalFailures.length > 0) {
      report.push('Critical Failures:');
      report.push(...results.criticalFailures.map(failure => `  - ${failure}`));
      report.push('');
    }
    
    report.push(`Overall Result: ${results.failed === 0 ? 'PASS' : 'FAIL'}`);
    
    return report.join('\n');
  }
  
  /**
   * Validate quality standards
   */
  static validateQualityStandards(results: TestSuiteResult): {
    meetsStandards: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    
    if (results.coverage < 80) {
      issues.push(`Test coverage below 80% (${results.coverage.toFixed(2)}%)`);
    }
    
    if (results.criticalFailures.length > 0) {
      issues.push(`Critical failures detected: ${results.criticalFailures.length}`);
    }
    
    if (results.duration > 5000) {
      issues.push(`Test execution time exceeds 5 seconds (${results.duration.toFixed(2)}ms)`);
    }
    
    return {
      meetsStandards: issues.length === 0,
      issues
    };
  }
}
