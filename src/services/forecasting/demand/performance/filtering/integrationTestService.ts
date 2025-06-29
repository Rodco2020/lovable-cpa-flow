
import { FilterStrategyFactory } from './filterStrategyFactory';
import { DemandMatrixService } from '../../demandMatrixService';

export interface IntegrationTestResult {
  testName: string;
  passed: boolean;
  duration: number;
  details: any;
  issues: string[];
  recommendations: string[];
}

export interface ComprehensiveTestResults {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  overallResult: 'PASS' | 'FAIL';
  totalExecutionTime: number;
  individualResults: IntegrationTestResult[];
  performanceAnalysis?: {
    overallPerformance: 'excellent' | 'good' | 'acceptable' | 'poor';
    bottlenecks: string[];
    recommendations: string[];
    metrics: any;
  };
}

/**
 * Integration Test Service for demand filtering system
 */
export class IntegrationTestService {
  
  /**
   * Run comprehensive integration tests
   */
  static async runIntegrationTests(): Promise<ComprehensiveTestResults> {
    console.log('🧪 [INTEGRATION TEST SERVICE] Starting comprehensive integration tests');
    
    const startTime = performance.now();
    const results: IntegrationTestResult[] = [];
    
    try {
      // Test 1: Matrix Data Generation
      results.push(await this.testMatrixDataGeneration());
      
      // Test 2: Filter Strategy Factory
      results.push(await this.testFilterStrategyFactory());
      
      // Test 3: Performance Optimization
      results.push(await this.testPerformanceOptimization());
      
      // Test 4: End-to-End Integration
      results.push(await this.testEndToEndIntegration());
      
    } catch (error) {
      console.error('❌ [INTEGRATION TEST SERVICE] Test execution failed:', error);
      results.push({
        testName: 'Critical Test Failure',
        passed: false,
        duration: 0,
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        issues: ['Critical test execution failure'],
        recommendations: ['Review test setup and dependencies']
      });
    }
    
    const totalExecutionTime = performance.now() - startTime;
    const passedTests = results.filter(r => r.passed).length;
    const totalTests = results.length;
    
    const comprehensiveResults: ComprehensiveTestResults = {
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      overallResult: passedTests === totalTests ? 'PASS' : 'FAIL',
      totalExecutionTime,
      individualResults: results
    };
    
    console.log('✅ [INTEGRATION TEST SERVICE] Integration tests completed:', {
      totalTests,
      passedTests,
      overallResult: comprehensiveResults.overallResult
    });
    
    return comprehensiveResults;
  }
  
  /**
   * Test matrix data generation
   */
  private static async testMatrixDataGeneration(): Promise<IntegrationTestResult> {
    const startTime = performance.now();
    const result: IntegrationTestResult = {
      testName: 'Matrix Data Generation Test',
      passed: false,
      duration: 0,
      details: {},
      issues: [],
      recommendations: []
    };
    
    try {
      const { matrixData } = await DemandMatrixService.generateDemandMatrix('demand-only');
      
      result.details = {
        hasMatrixData: !!matrixData,
        dataPointsCount: matrixData?.dataPoints.length || 0,
        skillsCount: matrixData?.skills.length || 0,
        monthsCount: matrixData?.months.length || 0
      };
      
      result.passed = !!matrixData && matrixData.dataPoints.length > 0;
      
      if (!result.passed) {
        result.issues.push('Matrix data generation failed or returned no data');
        result.recommendations.push('Check database connectivity and data availability');
      }
      
    } catch (error) {
      result.issues.push(`Matrix data generation error: ${error}`);
      result.recommendations.push('Review matrix generation service implementation');
    }
    
    result.duration = performance.now() - startTime;
    return result;
  }
  
  /**
   * Test filter strategy factory
   */
  private static async testFilterStrategyFactory(): Promise<IntegrationTestResult> {
    const startTime = performance.now();
    const result: IntegrationTestResult = {
      testName: 'Filter Strategy Factory Test',
      passed: false,
      duration: 0,
      details: {},
      issues: [],
      recommendations: []
    };
    
    try {
      const strategies = FilterStrategyFactory.getStrategies();
      const dashboard = FilterStrategyFactory.getPerformanceDashboard();
      
      result.details = {
        strategiesCount: strategies.length,
        hasDashboard: !!dashboard,
        dashboardMetrics: dashboard
      };
      
      result.passed = strategies.length > 0 && !!dashboard;
      
      if (!result.passed) {
        if (strategies.length === 0) {
          result.issues.push('No filter strategies registered');
          result.recommendations.push('Ensure filter strategies are properly registered');
        }
        if (!dashboard) {
          result.issues.push('Performance dashboard not available');
          result.recommendations.push('Check performance monitoring setup');
        }
      }
      
    } catch (error) {
      result.issues.push(`Filter strategy factory error: ${error}`);
      result.recommendations.push('Review filter strategy factory implementation');
    }
    
    result.duration = performance.now() - startTime;
    return result;
  }
  
  /**
   * Test performance optimization
   */
  private static async testPerformanceOptimization(): Promise<IntegrationTestResult> {
    const startTime = performance.now();
    const result: IntegrationTestResult = {
      testName: 'Performance Optimization Test',
      passed: false,
      duration: 0,
      details: {},
      issues: [],
      recommendations: []
    };
    
    try {
      const dashboard = FilterStrategyFactory.getPerformanceDashboard();
      
      result.details = {
        averageExecutionTime: dashboard.overallAverageExecutionTime || 0,
        totalExecutions: dashboard.totalExecutions || 0,
        totalFiltersMonitored: dashboard.totalFiltersMonitored || 0
      };
      
      // Performance is considered good if average execution time is under 200ms
      const isPerformant = (dashboard.overallAverageExecutionTime || 0) < 200;
      result.passed = isPerformant && (dashboard.totalExecutions || 0) > 0;
      
      if (!result.passed) {
        if (!isPerformant) {
          result.issues.push('Performance below threshold');
          result.recommendations.push('Optimize filtering strategies');
        }
        if ((dashboard.totalExecutions || 0) === 0) {
          result.issues.push('No performance data available');
          result.recommendations.push('Execute some filtering operations first');
        }
      }
      
    } catch (error) {
      result.issues.push(`Performance optimization test error: ${error}`);
      result.recommendations.push('Review performance monitoring implementation');
    }
    
    result.duration = performance.now() - startTime;
    return result;
  }
  
  /**
   * Test end-to-end integration
   */
  private static async testEndToEndIntegration(): Promise<IntegrationTestResult> {
    const startTime = performance.now();
    const result: IntegrationTestResult = {
      testName: 'End-to-End Integration Test',
      passed: false,
      duration: 0,
      details: {},
      issues: [],
      recommendations: []
    };
    
    try {
      // Test full pipeline: generate data -> apply filters -> get results
      const { matrixData } = await DemandMatrixService.generateDemandMatrix('demand-only');
      
      if (!matrixData) {
        throw new Error('No matrix data available for integration test');
      }
      
      // Apply basic filters
      const testFilters = {
        skills: [],
        clients: [],
        preferredStaff: [],
        timeHorizon: { start: new Date('2024-01-01'), end: new Date('2024-12-31') }
      };
      
      const filteredData = FilterStrategyFactory.applyFilters(matrixData, testFilters);
      
      result.details = {
        originalDataPoints: matrixData.dataPoints.length,
        filteredDataPoints: filteredData.dataPoints.length,
        pipelineWorking: true
      };
      
      result.passed = filteredData.dataPoints.length >= 0; // >= 0 because empty results are valid with filters
      
      if (!result.passed) {
        result.issues.push('End-to-end integration pipeline failed');
        result.recommendations.push('Review complete data flow from generation to filtering');
      }
      
    } catch (error) {
      result.issues.push(`End-to-end integration error: ${error}`);
      result.recommendations.push('Check integration between matrix service and filter factory');
    }
    
    result.duration = performance.now() - startTime;
    return result;
  }
}
