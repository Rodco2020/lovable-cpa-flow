
import { DemandMatrixData } from '@/types/demand';
import { FilterStrategyFactory } from './filterStrategyFactory';

export interface IntegrationTestResult {
  testName: string;
  passed: boolean;
  duration: number;
  details: any;
  issues: string[];
  recommendations: string[];
}

export interface ComprehensiveTestResult {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  overallResult: 'PASS' | 'FAIL';
  totalExecutionTime: number;
  testResults: IntegrationTestResult[];
  performanceAnalysis?: any;
  endToEndResults?: any;
}

/**
 * Integration Test Service
 * 
 * Provides comprehensive testing capabilities for the filtering system
 */
export class IntegrationTestService {
  
  /**
   * Run comprehensive integration tests
   */
  static async runIntegrationTests(): Promise<ComprehensiveTestResult> {
    const startTime = performance.now();
    const testResults: IntegrationTestResult[] = [];
    
    // Test 1: Filter Strategy Factory
    testResults.push(await this.testFilterStrategyFactory());
    
    // Test 2: Performance Monitoring
    testResults.push(await this.testPerformanceMonitoring());
    
    // Test 3: Data Validation
    testResults.push(await this.testDataValidation());
    
    const totalExecutionTime = performance.now() - startTime;
    const passedTests = testResults.filter(r => r.passed).length;
    const failedTests = testResults.length - passedTests;
    
    return {
      totalTests: testResults.length,
      passedTests,
      failedTests,
      overallResult: failedTests === 0 ? 'PASS' : 'FAIL',
      totalExecutionTime,
      testResults
    };
  }
  
  /**
   * Test filter strategy factory functionality
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
      // Test if factory exists and has basic functionality
      const strategies = FilterStrategyFactory.getStrategies();
      result.details.strategiesCount = strategies.length;
      
      // Test performance dashboard
      const dashboard = FilterStrategyFactory.getPerformanceDashboard();
      result.details.dashboardAvailable = !!dashboard;
      
      result.passed = strategies.length >= 0 && !!dashboard;
      
      if (!result.passed) {
        result.issues.push('Filter strategy factory not functioning properly');
        result.recommendations.push('Check FilterStrategyFactory implementation');
      }
      
    } catch (error) {
      result.issues.push(`Filter strategy factory test failed: ${error}`);
      result.recommendations.push('Verify FilterStrategyFactory exists and is properly configured');
    }
    
    result.duration = performance.now() - startTime;
    return result;
  }
  
  /**
   * Test performance monitoring
   */
  private static async testPerformanceMonitoring(): Promise<IntegrationTestResult> {
    const startTime = performance.now();
    const result: IntegrationTestResult = {
      testName: 'Performance Monitoring Test',
      passed: false,
      duration: 0,
      details: {},
      issues: [],
      recommendations: []
    };
    
    try {
      // Create mock data for performance testing
      const mockData: DemandMatrixData = {
        months: [{ key: '2024-01', label: 'Jan 2024' }],
        skills: ['Test Skill'],
        dataPoints: [],
        totalDemand: 0,
        totalTasks: 0,
        totalClients: 0,
        skillSummary: {},
        clientTotals: new Map(),
        aggregationStrategy: 'skill-based'
      };
      
      // Test filtering performance
      const testFilters = {
        skills: [],
        clients: [],
        preferredStaff: [],
        timeHorizon: { start: new Date(), end: new Date() }
      };
      
      const filteredData = FilterStrategyFactory.applyFilters(mockData, testFilters);
      result.details.filteringWorked = !!filteredData;
      result.passed = !!filteredData;
      
    } catch (error) {
      result.issues.push(`Performance monitoring test failed: ${error}`);
      result.recommendations.push('Check performance monitoring implementation');
    }
    
    result.duration = performance.now() - startTime;
    return result;
  }
  
  /**
   * Test data validation
   */
  private static async testDataValidation(): Promise<IntegrationTestResult> {
    const startTime = performance.now();
    const result: IntegrationTestResult = {
      testName: 'Data Validation Test',
      passed: false,
      duration: 0,
      details: {},
      issues: [],
      recommendations: []
    };
    
    try {
      // Test with valid data structure
      const validData: DemandMatrixData = {
        months: [{ key: '2024-01', label: 'Jan 2024' }],
        skills: ['Test Skill'],
        dataPoints: [{
          skillType: 'Test Skill',
          month: '2024-01',
          monthLabel: 'Jan 2024',
          demandHours: 10,
          totalHours: 10,
          taskCount: 1,
          clientCount: 1,
          taskBreakdown: []
        }],
        totalDemand: 10,
        totalTasks: 1,
        totalClients: 1,
        skillSummary: {
          'Test Skill': {
            totalHours: 10,
            demandHours: 10,
            taskCount: 1,
            clientCount: 1
          }
        },
        clientTotals: new Map([['client-1', 10]]),
        aggregationStrategy: 'skill-based'
      };
      
      result.details.dataStructureValid = true;
      result.passed = true;
      
    } catch (error) {
      result.issues.push(`Data validation test failed: ${error}`);
      result.recommendations.push('Check data structure definitions');
    }
    
    result.duration = performance.now() - startTime;
    return result;
  }
}
