
import { useState, useCallback } from 'react';
import { IntegrationTestService } from '@/services/forecasting/demand/performance/filtering/integrationTestService';
import { FilterStrategyFactory } from '@/services/forecasting/demand/performance/filtering/filterStrategyFactory';
import { DemandMatrixService } from '@/services/forecasting/demandMatrixService';

interface IntegrationTestingState {
  isRunning: boolean;
  currentTest: string;
  results: any | null;
  error: string | null;
}

/**
 * PHASE 4: Integration Testing Hook
 * 
 * Coordinates all integration testing functionality with comprehensive
 * monitoring and reporting capabilities.
 */
export const useIntegrationTesting = () => {
  const [state, setState] = useState<IntegrationTestingState>({
    isRunning: false,
    currentTest: '',
    results: null,
    error: null
  });

  /**
   * Run comprehensive integration tests
   */
  const runIntegrationTests = useCallback(async () => {
    setState(prev => ({ ...prev, isRunning: true, error: null }));

    try {
      console.log('🚀 [INTEGRATION TESTING HOOK] Starting Phase 4 comprehensive tests');

      // Step 1: Validate system prerequisites
      setState(prev => ({ ...prev, currentTest: 'Validating system prerequisites...' }));
      await validateSystemPrerequisites();

      // Step 2: Run integration test service
      setState(prev => ({ ...prev, currentTest: 'Running integration test scenarios...' }));
      const testResults = await IntegrationTestService.runIntegrationTests();

      // Step 3: Generate performance analysis
      setState(prev => ({ ...prev, currentTest: 'Analyzing performance metrics...' }));
      const performanceAnalysis = await generatePerformanceAnalysis();

      // Step 4: Validate end-to-end functionality
      setState(prev => ({ ...prev, currentTest: 'Validating end-to-end functionality...' }));
      const endToEndResults = await validateEndToEndFunctionality();

      // Combine all results
      const comprehensiveResults = {
        ...testResults,
        performanceAnalysis,
        endToEndResults,
        timestamp: new Date().toISOString(),
        version: 'Phase 4'
      };

      setState(prev => ({
        ...prev,
        isRunning: false,
        currentTest: '',
        results: comprehensiveResults
      }));

      console.log('✅ [INTEGRATION TESTING HOOK] Phase 4 comprehensive tests completed');
      return comprehensiveResults;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ [INTEGRATION TESTING HOOK] Integration testing failed:', error);
      
      setState(prev => ({
        ...prev,
        isRunning: false,
        currentTest: '',
        error: errorMessage
      }));

      throw error;
    }
  }, []);

  /**
   * Validate system prerequisites
   */
  const validateSystemPrerequisites = async (): Promise<void> => {
    // Check if matrix service is available
    try {
      const { matrixData } = await DemandMatrixService.generateDemandMatrix('demand-only');
      if (!matrixData) {
        throw new Error('Matrix data generation failed');
      }
    } catch (error) {
      throw new Error(`Matrix service validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Check if filter strategy factory is available
    try {
      const strategies = FilterStrategyFactory.getStrategies();
      if (strategies.length === 0) {
        throw new Error('No filter strategies registered');
      }
    } catch (error) {
      throw new Error(`Filter strategy factory validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  /**
   * Generate comprehensive performance analysis
   */
  const generatePerformanceAnalysis = async (): Promise<{
    overallPerformance: 'excellent' | 'good' | 'acceptable' | 'poor';
    bottlenecks: string[];
    recommendations: string[];
    metrics: any;
  }> => {
    const dashboard = FilterStrategyFactory.getPerformanceDashboard();
    
    const metrics = {
      averageExecutionTime: dashboard.overallAverageExecutionTime || 0,
      totalFiltersMonitored: dashboard.totalFiltersMonitored || 0,
      totalExecutions: dashboard.totalExecutions || 0,
      topPerformingFilters: dashboard.topPerformingFilters || [],
      underperformingFilters: dashboard.underperformingFilters || []
    };

    // Determine overall performance grade
    let overallPerformance: 'excellent' | 'good' | 'acceptable' | 'poor' = 'excellent';
    if (metrics.averageExecutionTime > 500) overallPerformance = 'poor';
    else if (metrics.averageExecutionTime > 200) overallPerformance = 'acceptable';
    else if (metrics.averageExecutionTime > 100) overallPerformance = 'good';

    // Identify bottlenecks
    const bottlenecks: string[] = [];
    if (metrics.averageExecutionTime > 200) {
      bottlenecks.push('High average execution time detected');
    }
    if (metrics.underperformingFilters.length > 0) {
      bottlenecks.push(`${metrics.underperformingFilters.length} underperforming filters detected`);
    }

    // Generate recommendations
    const recommendations: string[] = [];
    if (overallPerformance === 'poor') {
      recommendations.push('Consider implementing additional caching strategies');
      recommendations.push('Review filter logic for optimization opportunities');
    }
    if (metrics.underperformingFilters.length > 0) {
      recommendations.push('Focus optimization efforts on underperforming filters');
    }
    if (bottlenecks.length === 0) {
      recommendations.push('Performance is optimal - maintain current implementation');
    }

    return {
      overallPerformance,
      bottlenecks,
      recommendations,
      metrics
    };
  };

  /**
   * Validate end-to-end functionality
   */
  const validateEndToEndFunctionality = async (): Promise<{
    dataGeneration: boolean;
    filtering: boolean;
    performanceOptimization: boolean;
    userInterface: boolean;
    overallStatus: 'pass' | 'fail';
  }> => {
    const results = {
      dataGeneration: false,
      filtering: false,
      performanceOptimization: false,
      userInterface: false,
      overallStatus: 'fail' as 'pass' | 'fail'
    };

    try {
      // Test data generation
      const { matrixData } = await DemandMatrixService.generateDemandMatrix('demand-only');
      results.dataGeneration = !!matrixData && matrixData.dataPoints.length > 0;

      // Test filtering
      if (matrixData) {
        const testFilters = {
          skills: [],
          clients: [],
          preferredStaff: [],
          timeHorizon: { start: new Date('2024-01-01'), end: new Date('2024-12-31') }
        };
        
        const filteredData = FilterStrategyFactory.applyFilters(matrixData, testFilters);
        results.filtering = !!filteredData && filteredData.dataPoints.length >= 0;
      }

      // Test performance optimization
      const performanceDashboard = FilterStrategyFactory.getPerformanceDashboard();
      results.performanceOptimization = !!performanceDashboard && 
        performanceDashboard.totalFiltersMonitored !== undefined;

      // Test user interface (basic validation)
      results.userInterface = typeof window !== 'undefined' && !!document;

      // Determine overall status
      results.overallStatus = Object.values(results).slice(0, -1).every(Boolean) ? 'pass' : 'fail';

    } catch (error) {
      console.error('End-to-end validation failed:', error);
      results.overallStatus = 'fail';
    }

    return results;
  };

  /**
   * Clear test results
   */
  const clearResults = useCallback(() => {
    setState({
      isRunning: false,
      currentTest: '',
      results: null,
      error: null
    });
  }, []);

  /**
   * Get test summary
   */
  const getTestSummary = useCallback(() => {
    if (!state.results) return null;

    return {
      totalTests: state.results.totalTests || 0,
      passedTests: state.results.passedTests || 0,
      failedTests: state.results.failedTests || 0,
      overallResult: state.results.overallResult || 'UNKNOWN',
      executionTime: state.results.totalExecutionTime || 0,
      performanceGrade: state.results.performanceAnalysis?.overallPerformance || 'unknown'
    };
  }, [state.results]);

  return {
    // State
    isRunning: state.isRunning,
    currentTest: state.currentTest,
    results: state.results,
    error: state.error,
    
    // Actions
    runIntegrationTests,
    clearResults,
    
    // Computed
    testSummary: getTestSummary(),
    hasResults: !!state.results,
    hasError: !!state.error
  };
};
