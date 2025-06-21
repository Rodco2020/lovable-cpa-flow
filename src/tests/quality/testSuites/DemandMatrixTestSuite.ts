
/**
 * Phase 5: Comprehensive Demand Matrix Test Suite
 * 
 * Complete testing suite for demand matrix functionality with all phases integrated
 */

import { Phase5IntegrationTests } from '@/tests/integration/phase5IntegrationTests';
import { Phase5PerformanceTests } from '@/tests/performance/phase5PerformanceTests';
import { Phase5IntegrationValidator } from '@/tests/quality/integration/Phase5IntegrationValidator';
import { SkillResolutionTestingService } from '@/services/forecasting/demand/skillResolution/testingService';

export interface DemandMatrixTestReport {
  passed: boolean;
  duration: number;
  testSuites: {
    integration: any;
    performance: any;
    validation: any;
    skillResolution: any;
  };
  overallScore: number;
  recommendations: string[];
  readinessAssessment: {
    productionReady: boolean;
    blockers: string[];
    warnings: string[];
  };
}

export class DemandMatrixTestSuite {
  /**
   * Run comprehensive test suite
   */
  public static async runTests(): Promise<DemandMatrixTestReport> {
    console.log('🧪 [DEMAND MATRIX TEST SUITE] Starting comprehensive testing...');
    console.log('=' .repeat(70));
    
    const startTime = performance.now();
    
    try {
      // Run all test suites
      console.log('\n📋 Running Integration Tests...');
      const integrationResults = await Phase5IntegrationTests.runCompleteIntegrationTests();
      
      console.log('\n⚡ Running Performance Tests...');
      const performanceResults = await Phase5PerformanceTests.runPerformanceTests();
      
      console.log('\n🔗 Running Integration Validation...');
      const validationResults = await Phase5IntegrationValidator.runCompleteValidation();
      
      console.log('\n🎯 Running Skill Resolution Tests...');
      const skillResolutionResults = await SkillResolutionTestingService.runValidationTests();

      // Calculate overall results
      const overallScore = this.calculateOverallScore({
        integration: integrationResults,
        performance: performanceResults,
        validation: validationResults,
        skillResolution: skillResolutionResults
      });

      const allTestsPassed = 
        integrationResults.passed &&
        performanceResults.overallPassed &&
        validationResults.passed &&
        skillResolutionResults.passed;

      const duration = performance.now() - startTime;
      
      // Generate comprehensive recommendations
      const recommendations = this.generateComprehensiveRecommendations({
        integration: integrationResults,
        performance: performanceResults,
        validation: validationResults,
        skillResolution: skillResolutionResults
      });

      // Assess production readiness
      const readinessAssessment = this.assessProductionReadiness(
        allTestsPassed,
        overallScore,
        {
          integration: integrationResults,
          performance: performanceResults,
          validation: validationResults,
          skillResolution: skillResolutionResults
        }
      );

      const report: DemandMatrixTestReport = {
        passed: allTestsPassed,
        duration: Math.round(duration),
        testSuites: {
          integration: integrationResults,
          performance: performanceResults,
          validation: validationResults,
          skillResolution: skillResolutionResults
        },
        overallScore,
        recommendations,
        readinessAssessment
      };

      this.printTestSummary(report);
      
      return report;

    } catch (error) {
      console.error('❌ [DEMAND MATRIX TEST SUITE] Critical testing failure:', error);
      
      const duration = performance.now() - startTime;
      
      return {
        passed: false,
        duration: Math.round(duration),
        testSuites: {
          integration: null,
          performance: null,
          validation: null,
          skillResolution: null
        },
        overallScore: 0,
        recommendations: ['Fix critical testing infrastructure before proceeding'],
        readinessAssessment: {
          productionReady: false,
          blockers: ['Critical testing failure - cannot validate system'],
          warnings: []
        }
      };
    }
  }

  /**
   * Calculate overall score from all test suites
   */
  private static calculateOverallScore(results: any): number {
    const scores = [];
    
    // Integration test score (weight: 30%)
    if (results.integration?.passed) {
      const integrationTestCount = Object.values(results.integration.testResults).flat().length;
      const passedIntegrationTests = Object.values(results.integration.testResults)
        .flat()
        .filter((test: any) => test.passed).length;
      scores.push((passedIntegrationTests / integrationTestCount) * 30);
    } else {
      scores.push(0);
    }
    
    // Performance test score (weight: 25%)
    if (results.performance?.overallPassed) {
      const performanceScore = results.performance.testResults.filter((test: any) => test.passed).length;
      const totalPerformanceTests = results.performance.testResults.length;
      scores.push((performanceScore / totalPerformanceTests) * 25);
    } else {
      scores.push(0);
    }
    
    // Validation score (weight: 25%)
    if (results.validation?.passed) {
      scores.push((results.validation.overallScore / 100) * 25);
    } else {
      scores.push(0);
    }
    
    // Skill resolution score (weight: 20%)
    if (results.skillResolution?.passed) {
      scores.push(20);
    } else {
      scores.push(0);
    }
    
    return Math.round(scores.reduce((sum, score) => sum + score, 0));
  }

  /**
   * Generate comprehensive recommendations
   */
  private static generateComprehensiveRecommendations(results: any): string[] {
    const recommendations: string[] = [];
    
    // Integration recommendations
    if (results.integration?.recommendations) {
      recommendations.push(...results.integration.recommendations);
    }
    
    // Performance recommendations
    if (results.performance?.recommendations) {
      recommendations.push(...results.performance.recommendations);
    }
    
    // Validation recommendations
    if (results.validation?.recommendations) {
      recommendations.push(...results.validation.recommendations);
    }
    
    // Cross-cutting recommendations
    const allTestsPassed = results.integration?.passed && 
                          results.performance?.overallPassed && 
                          results.validation?.passed && 
                          results.skillResolution?.passed;
    
    if (allTestsPassed) {
      recommendations.push('All test suites passed - system validated for production');
      recommendations.push('Consider implementing monitoring and alerting for production deployment');
    } else {
      recommendations.push('Address failed test suites before production deployment');
    }
    
    // Remove duplicates
    return [...new Set(recommendations)];
  }

  /**
   * Assess production readiness
   */
  private static assessProductionReadiness(
    allTestsPassed: boolean,
    overallScore: number,
    results: any
  ): {
    productionReady: boolean;
    blockers: string[];
    warnings: string[];
  } {
    const blockers: string[] = [];
    const warnings: string[] = [];
    
    // Critical blockers
    if (!results.integration?.passed) {
      blockers.push('Integration tests failed - core functionality not working');
    }
    
    if (!results.skillResolution?.passed) {
      blockers.push('Skill resolution system failed - data integrity compromised');
    }
    
    if (overallScore < 70) {
      blockers.push(`Overall test score too low: ${overallScore}% (minimum: 70%)`);
    }
    
    // Performance warnings
    if (!results.performance?.overallPassed) {
      if (results.performance?.performanceSummary?.averageResponseTime > 2000) {
        blockers.push('Performance tests failed - response times exceed acceptable limits');
      } else {
        warnings.push('Performance tests have issues - monitor closely in production');
      }
    }
    
    // Validation warnings
    if (!results.validation?.passed) {
      if (results.validation?.overallScore < 50) {
        blockers.push('Integration validation severely failed');
      } else {
        warnings.push('Integration validation has issues - some features may be unstable');
      }
    }
    
    // Overall assessment
    const productionReady = blockers.length === 0 && overallScore >= 85;
    
    return {
      productionReady,
      blockers,
      warnings
    };
  }

  /**
   * Print test summary
   */
  private static printTestSummary(report: DemandMatrixTestReport): void {
    console.log('\n' + '='.repeat(70));
    console.log('📊 DEMAND MATRIX TEST SUITE - FINAL REPORT');
    console.log('='.repeat(70));
    
    // Overall status
    console.log(`\n🎯 OVERALL STATUS: ${report.passed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`📈 Overall Score: ${report.overallScore}%`);
    console.log(`⏱️ Total Duration: ${report.duration}ms`);
    
    // Test suite breakdown
    console.log(`\n📋 TEST SUITE BREAKDOWN:`);
    console.log(`   Integration Tests: ${report.testSuites.integration?.passed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`   Performance Tests: ${report.testSuites.performance?.overallPassed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`   Integration Validation: ${report.testSuites.validation?.passed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`   Skill Resolution: ${report.testSuites.skillResolution?.passed ? '✅ PASSED' : '❌ FAILED'}`);
    
    // Production readiness
    console.log(`\n🚀 PRODUCTION READINESS: ${report.readinessAssessment.productionReady ? '✅ READY' : '❌ NOT READY'}`);
    
    if (report.readinessAssessment.blockers.length > 0) {
      console.log(`\n🚫 BLOCKERS (${report.readinessAssessment.blockers.length}):`);
      report.readinessAssessment.blockers.forEach((blocker, i) => {
        console.log(`   ${i + 1}. ${blocker}`);
      });
    }
    
    if (report.readinessAssessment.warnings.length > 0) {
      console.log(`\n⚠️ WARNINGS (${report.readinessAssessment.warnings.length}):`);
      report.readinessAssessment.warnings.forEach((warning, i) => {
        console.log(`   ${i + 1}. ${warning}`);
      });
    }
    
    // Recommendations
    if (report.recommendations.length > 0) {
      console.log(`\n💡 RECOMMENDATIONS:`);
      report.recommendations.slice(0, 5).forEach((rec, i) => {
        console.log(`   ${i + 1}. ${rec}`);
      });
      
      if (report.recommendations.length > 5) {
        console.log(`   ... and ${report.recommendations.length - 5} more recommendations`);
      }
    }
    
    console.log('\n' + '='.repeat(70));
  }

  /**
   * Generate detailed test report for stakeholders
   */
  public static generateDetailedReport(report: DemandMatrixTestReport): string {
    const lines = [
      'PHASE 5: TESTING, VALIDATION & PERFORMANCE OPTIMIZATION',
      'Comprehensive Test Report',
      '='.repeat(60),
      '',
      `Report Generated: ${new Date().toISOString()}`,
      `Overall Test Status: ${report.passed ? 'PASSED' : 'FAILED'}`,
      `Overall Score: ${report.overallScore}%`,
      `Total Test Duration: ${report.duration}ms`,
      '',
      'EXECUTIVE SUMMARY:',
      '- Comprehensive testing of demand matrix system completed',
      '- Integration, performance, validation, and skill resolution tested',
      `- Production readiness: ${report.readinessAssessment.productionReady ? 'APPROVED' : 'PENDING'}`,
      '',
      'DETAILED TEST RESULTS:',
      '',
      '1. Integration Testing:',
      `   Status: ${report.testSuites.integration?.passed ? 'PASSED' : 'FAILED'}`,
      `   Duration: ${report.testSuites.integration?.duration || 0}ms`,
      '',
      '2. Performance Testing:',
      `   Status: ${report.testSuites.performance?.overallPassed ? 'PASSED' : 'FAILED'}`,
      `   Duration: ${report.testSuites.performance?.executionTime || 0}ms`,
      '',
      '3. Integration Validation:',
      `   Status: ${report.testSuites.validation?.passed ? 'PASSED' : 'FAILED'}`,
      `   Score: ${report.testSuites.validation?.overallScore || 0}%`,
      '',
      '4. Skill Resolution Testing:',
      `   Status: ${report.testSuites.skillResolution?.passed ? 'PASSED' : 'FAILED'}`,
      `   Total Tests: ${report.testSuites.skillResolution?.totalTests || 0}`,
      '',
      'PRODUCTION READINESS ASSESSMENT:',
      `Ready for Deployment: ${report.readinessAssessment.productionReady ? 'YES' : 'NO'}`,
      `Blockers: ${report.readinessAssessment.blockers.length}`,
      `Warnings: ${report.readinessAssessment.warnings.length}`,
      '',
      'TOP RECOMMENDATIONS:',
      ...report.recommendations.slice(0, 5).map((rec, i) => `${i + 1}. ${rec}`),
      '',
      'NEXT STEPS:',
      report.readinessAssessment.productionReady 
        ? '✅ Approved for production deployment'
        : '❌ Address blockers before deployment'
    ];

    return lines.join('\n');
  }
}
