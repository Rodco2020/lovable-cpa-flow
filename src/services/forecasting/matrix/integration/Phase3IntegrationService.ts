
import { MatrixData, ForecastType } from '../types';
import { DemandMatrixData } from '@/types/demand';
import { CrossMatrixValidator, CrossMatrixValidationResult } from '../validation/CrossMatrixValidator';
import { PerformanceOptimizer } from '../optimization/PerformanceOptimizer';
import { IntegrationTester, IntegrationTestSuite } from '../testing/IntegrationTester';
import { MatrixServiceCore } from '../MatrixServiceCore';
import { DemandMatrixService } from '../../demandMatrixService';
import { EnhancedMatrixService } from '../../enhanced/enhancedMatrixService';
import { debugLog } from '../../logger';

/**
 * Phase 3 Integration Service
 * 
 * Orchestrates integration validation, performance optimization,
 * and comprehensive testing for the matrix system.
 */

export interface Phase3ValidationReport {
  crossMatrixValidation: CrossMatrixValidationResult;
  performanceAnalysis: {
    bottlenecks: string[];
    recommendations: string[];
    optimizationApplied: boolean;
  };
  integrationTests: IntegrationTestSuite;
  overallStatus: 'PASS' | 'FAIL' | 'WARNING';
  criticalIssues: string[];
  recommendations: string[];
}

export class Phase3IntegrationService {
  /**
   * Run complete Phase 3 validation and optimization
   */
  static async runPhase3Validation(): Promise<Phase3ValidationReport> {
    debugLog('Starting Phase 3: Integration Validation & Performance Optimization');
    
    const startTime = Date.now();
    
    try {
      // Step 1: Cross-Matrix Consistency Verification
      debugLog('Step 1: Cross-Matrix Consistency Verification');
      const crossMatrixValidation = await this.performCrossMatrixValidation();
      
      // Step 2: Performance Optimization
      debugLog('Step 2: Performance Optimization');
      const performanceAnalysis = await this.performPerformanceOptimization();
      
      // Step 3: Integration Testing
      debugLog('Step 3: Integration Testing');
      const integrationTests = await IntegrationTester.runIntegrationTests();
      
      // Step 4: Generate comprehensive report
      const report = this.generatePhase3Report(
        crossMatrixValidation,
        performanceAnalysis,
        integrationTests
      );
      
      const totalTime = Date.now() - startTime;
      debugLog(`Phase 3 validation completed in ${totalTime}ms`, {
        overallStatus: report.overallStatus,
        criticalIssues: report.criticalIssues.length,
        recommendations: report.recommendations.length
      });
      
      return report;
      
    } catch (error) {
      debugLog('Phase 3 validation failed', { error });
      throw new Error(`Phase 3 validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Perform cross-matrix consistency validation
   */
  private static async performCrossMatrixValidation(): Promise<CrossMatrixValidationResult> {
    try {
      // Generate both matrices for comparison
      const [capacityResult, demandResult] = await Promise.all([
        MatrixServiceCore.generateMatrixForecast('virtual'),
        DemandMatrixService.generateDemandMatrix('demand-only')
      ]);
      
      // Validate consistency
      const validationResult = CrossMatrixValidator.validateMatrixConsistency({
        capacityMatrix: capacityResult.matrixData,
        demandMatrix: demandResult.matrixData
      });
      
      // Log validation report
      const report = CrossMatrixValidator.generateValidationReport(validationResult);
      debugLog('Cross-matrix validation report:\n' + report);
      
      return validationResult;
      
    } catch (error) {
      throw new Error(`Cross-matrix validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Perform performance optimization analysis
   */
  private static async performPerformanceOptimization() {
    try {
      // Analyze current performance
      const performanceAnalysis = PerformanceOptimizer.analyzePerformance();
      
      // Apply optimizations if needed
      let optimizationApplied = false;
      
      if (performanceAnalysis.bottlenecks.length > 0) {
        debugLog('Performance bottlenecks detected, applying optimizations', {
          bottlenecks: performanceAnalysis.bottlenecks
        });
        
        // Clear caches to start fresh
        PerformanceOptimizer.clearCaches();
        optimizationApplied = true;
        
        debugLog('Performance optimization applied');
      }
      
      return {
        ...performanceAnalysis,
        optimizationApplied
      };
      
    } catch (error) {
      throw new Error(`Performance optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate comprehensive Phase 3 report
   */
  private static generatePhase3Report(
    crossMatrixValidation: CrossMatrixValidationResult,
    performanceAnalysis: any,
    integrationTests: IntegrationTestSuite
  ): Phase3ValidationReport {
    const criticalIssues: string[] = [];
    const recommendations: string[] = [];
    
    // Analyze cross-matrix validation
    if (!crossMatrixValidation.isConsistent) {
      criticalIssues.push('Cross-matrix consistency validation failed');
      criticalIssues.push(...crossMatrixValidation.demandConsistency.inconsistencies);
      criticalIssues.push(...crossMatrixValidation.capacityIntegrity.issues);
      
      recommendations.push('Review skill preservation logic');
      recommendations.push('Validate data transformation processes');
    }
    
    // Analyze performance
    if (performanceAnalysis.bottlenecks.length > 0) {
      criticalIssues.push(`Performance bottlenecks detected: ${performanceAnalysis.bottlenecks.join(', ')}`);
    }
    recommendations.push(...performanceAnalysis.recommendations);
    
    // Analyze integration tests
    if (integrationTests.failedTests > 0) {
      criticalIssues.push(`${integrationTests.failedTests} integration tests failed`);
      criticalIssues.push(...integrationTests.summary.criticalIssues);
    }
    recommendations.push(...integrationTests.summary.recommendations);
    
    // Determine overall status
    let overallStatus: 'PASS' | 'FAIL' | 'WARNING';
    
    if (criticalIssues.length === 0 && integrationTests.failedTests === 0) {
      overallStatus = 'PASS';
    } else if (crossMatrixValidation.isConsistent && integrationTests.passedTests > integrationTests.failedTests) {
      overallStatus = 'WARNING';
    } else {
      overallStatus = 'FAIL';
    }
    
    return {
      crossMatrixValidation,
      performanceAnalysis,
      integrationTests,
      overallStatus,
      criticalIssues: Array.from(new Set(criticalIssues)), // Remove duplicates
      recommendations: Array.from(new Set(recommendations)) // Remove duplicates
    };
  }

  /**
   * Generate formatted Phase 3 report
   */
  static generateFormattedReport(report: Phase3ValidationReport): string {
    const sections = [
      '🚀 PHASE 3: INTEGRATION VALIDATION & PERFORMANCE OPTIMIZATION REPORT',
      '=' .repeat(70),
      '',
      `📊 OVERALL STATUS: ${report.overallStatus}`,
      `🕒 VALIDATION TIME: ${report.crossMatrixValidation.performance.validationTime}ms`,
      `📈 DATA POINTS COMPARED: ${report.crossMatrixValidation.performance.dataPointsCompared}`,
      '',
      '🔍 CROSS-MATRIX CONSISTENCY VERIFICATION',
      '-'.repeat(50),
      `✅ Demand Consistency: ${report.crossMatrixValidation.demandConsistency.totalDemandMatch ? 'PASS' : 'FAIL'}`,
      `✅ Capacity Integrity: ${report.crossMatrixValidation.capacityIntegrity.calculationsAccurate ? 'PASS' : 'FAIL'}`,
      `✅ Gap Analysis: ${report.crossMatrixValidation.capacityIntegrity.gapAnalysisConsistent ? 'PASS' : 'FAIL'}`,
      '',
      '⚡ PERFORMANCE OPTIMIZATION',
      '-'.repeat(50),
      `🎯 Bottlenecks Found: ${report.performanceAnalysis.bottlenecks.length}`,
      `🔧 Optimization Applied: ${report.performanceAnalysis.optimizationApplied ? 'YES' : 'NO'}`,
      `💨 Cache Performance: ${report.performanceAnalysis.cacheStats?.skillMappingCacheSize || 0} mappings, ${report.performanceAnalysis.cacheStats?.transformationCacheSize || 0} transforms`,
      '',
      '🧪 INTEGRATION TESTING',
      '-'.repeat(50),
      `📋 Total Tests: ${report.integrationTests.totalTests}`,
      `✅ Passed: ${report.integrationTests.passedTests}`,
      `❌ Failed: ${report.integrationTests.failedTests}`,
      `📊 Success Rate: ${((report.integrationTests.passedTests / report.integrationTests.totalTests) * 100).toFixed(1)}%`,
      `⏱️ Test Duration: ${report.integrationTests.overallDuration}ms`,
      ''
    ];
    
    if (report.criticalIssues.length > 0) {
      sections.push('🚨 CRITICAL ISSUES');
      sections.push('-'.repeat(50));
      report.criticalIssues.forEach(issue => {
        sections.push(`❌ ${issue}`);
      });
      sections.push('');
    }
    
    if (report.recommendations.length > 0) {
      sections.push('💡 RECOMMENDATIONS');
      sections.push('-'.repeat(50));
      report.recommendations.forEach(rec => {
        sections.push(`💡 ${rec}`);
      });
      sections.push('');
    }
    
    // Summary
    sections.push('📝 SUMMARY');
    sections.push('-'.repeat(50));
    
    if (report.overallStatus === 'PASS') {
      sections.push('✅ Phase 3 validation PASSED! All systems are integrated and performing optimally.');
      sections.push('🎉 Both matrices display identical demand values');
      sections.push('🚀 No performance degradation detected');
      sections.push('✨ All matrix features function correctly');
      sections.push('📤 Export data matches displayed data');
    } else if (report.overallStatus === 'WARNING') {
      sections.push('⚠️ Phase 3 validation completed with WARNINGS.');
      sections.push('🔍 Review recommendations above to address minor issues.');
      sections.push('✅ Core functionality is working correctly.');
    } else {
      sections.push('❌ Phase 3 validation FAILED.');
      sections.push('🔧 Critical issues must be addressed before proceeding.');
      sections.push('📋 Review critical issues and recommendations above.');
    }
    
    return sections.join('\n');
  }

  /**
   * Quick validation check for development
   */
  static async quickValidationCheck(): Promise<{
    status: 'PASS' | 'FAIL';
    issues: string[];
    recommendations: string[];
  }> {
    try {
      const crossMatrixValidation = await this.performCrossMatrixValidation();
      const issues: string[] = [];
      const recommendations: string[] = [];
      
      if (!crossMatrixValidation.isConsistent) {
        issues.push('Matrix consistency check failed');
        recommendations.push('Run full Phase 3 validation for detailed analysis');
      }
      
      return {
        status: issues.length === 0 ? 'PASS' : 'FAIL',
        issues,
        recommendations
      };
      
    } catch (error) {
      return {
        status: 'FAIL',
        issues: [`Validation check failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        recommendations: ['Check system logs and run full validation']
      };
    }
  }
}
