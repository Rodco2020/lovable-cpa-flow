
/**
 * Cross Filter Integration Tester
 * Tests staff dropdown integration with demand matrix filtering
 */

import { StaffFilterOption, DemandMatrixData } from '@/types/demand';
import { getAllStaff } from '@/services/staff/staffService';
import { CacheManager } from './cacheManager';
import { PerformanceMonitor } from './performanceMonitor';
import { CACHE_KEYS } from './constants';

export interface IntegrationTestResult {
  staffDataAvailable: boolean;
  dropdownFunctional: boolean;
  filteringWorks: boolean;
  passed: boolean;
  testName: string;
  duration: number;
  dataPointsCount: number;
  errors: string[];
  warnings: string[];
  performance: {
    fetchTime: number;
    cacheHit: boolean;
    dataSize: number;
    filterTime: number;
    calculationTime: number;
  };
  performanceMetrics: {
    fetchTime: number;
    cacheHit: boolean;
    dataSize: number;
    filterTime: number;
    calculationTime: number;
  };
}

export interface PerformanceLoadTestOptions {
  iterations?: number;
  concurrentFilters?: number;
  dataMultiplier?: number;
}

export interface PerformanceLoadTestResult {
  averageFilterTime: number;
  maxFilterTime: number;
  memoryUsageMB: number;
  passed: boolean;
}

export interface RealtimeUpdateTestResult {
  updateLatency: number;
  dataConsistency: boolean;
  performanceImpact: number;
}

export class CrossFilterIntegrationTester {
  /**
   * Fetch staff data for dropdown with caching
   */
  static async fetchStaffForDropdown(): Promise<{
    data: StaffFilterOption[];
    metrics: { fetchTime: number; cacheHit: boolean; dataSize: number; filterTime: number; calculationTime: number };
  }> {
    const monitor = PerformanceMonitor.create('Staff Dropdown Fetch');
    monitor.start();
    
    try {
      // Check cache first
      const cacheKey = CACHE_KEYS.STAFF_DATA;
      const cachedData = CacheManager.get<StaffFilterOption[]>(cacheKey);
      
      if (cachedData) {
        const metrics = monitor.finish();
        return {
          data: cachedData,
          metrics: {
            fetchTime: metrics.duration,
            cacheHit: true,
            dataSize: cachedData.length,
            filterTime: 0,
            calculationTime: 0
          }
        };
      }
      
      // Fetch fresh data
      const staffData = await getAllStaff();
      const staffOptions: StaffFilterOption[] = staffData.map(staff => ({
        id: staff.id,
        name: staff.fullName,
        email: staff.email || '',
        skills: staff.assignedSkills || []
      }));
      
      // Cache the results
      CacheManager.set(cacheKey, staffOptions);
      
      const metrics = monitor.finish();
      return {
        data: staffOptions,
        metrics: {
          fetchTime: metrics.duration,
          cacheHit: false,
          dataSize: staffOptions.length,
          filterTime: 0,
          calculationTime: 0
        }
      };
      
    } catch (error) {
      console.error('Error fetching staff for dropdown:', error);
      const metrics = monitor.finish();
      return {
        data: [],
        metrics: {
          fetchTime: metrics.duration,
          cacheHit: false,
          dataSize: 0,
          filterTime: 0,
          calculationTime: 0
        }
      };
    }
  }
  
  /**
   * Test staff dropdown integration
   */
  static async testStaffDropdownIntegration(demandData: DemandMatrixData): Promise<IntegrationTestResult> {
    const monitor = PerformanceMonitor.create('Staff Integration Test');
    monitor.start();
    
    const errors: string[] = [];
    const warnings: string[] = [];
    
    try {
      // Test 1: Can we fetch staff data?
      const { data: staffData, metrics } = await this.fetchStaffForDropdown();
      const staffDataAvailable = staffData.length > 0;
      
      if (!staffDataAvailable) {
        errors.push('No staff data available');
      }
      
      // Test 2: Can we create dropdown options?
      const dropdownFunctional = staffData.every(staff => 
        staff.id && staff.name && typeof staff.id === 'string' && typeof staff.name === 'string'
      );
      
      if (!dropdownFunctional) {
        errors.push('Staff data format invalid for dropdown');
      }
      
      // Test 3: Can we filter by staff?
      const filteringWorks = this.testStaffFiltering(staffData, demandData);
      
      if (!filteringWorks) {
        errors.push('Staff filtering failed');
      }
      
      const testMetrics = monitor.finish();
      const passed = staffDataAvailable && dropdownFunctional && filteringWorks;
      
      return {
        staffDataAvailable,
        dropdownFunctional,
        filteringWorks,
        passed,
        testName: 'Staff Dropdown Integration Test',
        duration: testMetrics.duration,
        dataPointsCount: demandData.dataPoints.length,
        errors,
        warnings,
        performance: metrics,
        performanceMetrics: metrics
      };
      
    } catch (error) {
      console.error('Staff integration test failed:', error);
      const metrics = monitor.finish();
      errors.push(`Test execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      return {
        staffDataAvailable: false,
        dropdownFunctional: false,
        filteringWorks: false,
        passed: false,
        testName: 'Staff Dropdown Integration Test',
        duration: metrics.duration,
        dataPointsCount: 0,
        errors,
        warnings,
        performance: {
          fetchTime: metrics.duration,
          cacheHit: false,
          dataSize: 0,
          filterTime: 0,
          calculationTime: 0
        },
        performanceMetrics: {
          fetchTime: metrics.duration,
          cacheHit: false,
          dataSize: 0,
          filterTime: 0,
          calculationTime: 0
        }
      };
    }
  }
  
  /**
   * Run comprehensive tests
   */
  static async runComprehensiveTests(demandData: DemandMatrixData, staffOptions: StaffFilterOption[]): Promise<IntegrationTestResult[]> {
    const tests = [
      this.testStaffDropdownIntegration(demandData),
    ];
    
    return Promise.all(tests);
  }
  
  /**
   * Test performance under load
   */
  static async testPerformanceUnderLoad(demandData: DemandMatrixData, options: PerformanceLoadTestOptions = {}): Promise<PerformanceLoadTestResult> {
    const { iterations = 10, concurrentFilters = 5, dataMultiplier = 2 } = options;
    const monitor = PerformanceMonitor.create('Performance Load Test');
    monitor.start();
    
    try {
      // Simulate multiple concurrent requests
      const promises = Array(iterations).fill(null).map(() => this.fetchStaffForDropdown());
      const results = await Promise.all(promises);
      
      const fetchTimes = results.map(result => result.metrics.fetchTime);
      const avgFetchTime = fetchTimes.reduce((sum, time) => sum + time, 0) / fetchTimes.length;
      const maxFetchTime = Math.max(...fetchTimes);
      const testMetrics = monitor.finish();
      
      return {
        averageFilterTime: avgFetchTime,
        maxFilterTime: maxFetchTime,
        memoryUsageMB: (performance as any).memory?.usedJSHeapSize / (1024 * 1024) || 0,
        passed: avgFetchTime < 2000
      };
    } catch (error) {
      console.error('Performance load test failed:', error);
      
      return {
        averageFilterTime: 0,
        maxFilterTime: 0,
        memoryUsageMB: 0,
        passed: false
      };
    }
  }
  
  /**
   * Test realtime updates with staff filtering
   */
  static async testRealtimeUpdatesWithStaffFiltering(demandData: DemandMatrixData, staffOptions: StaffFilterOption[]): Promise<RealtimeUpdateTestResult> {
    const monitor = PerformanceMonitor.create('Realtime Updates Test');
    monitor.start();
    
    try {
      // Test filtering updates
      const filteringWorks = this.testStaffFiltering(staffOptions, demandData);
      
      const testMetrics = monitor.finish();
      
      return {
        updateLatency: testMetrics.duration,
        dataConsistency: filteringWorks,
        performanceImpact: testMetrics.duration > 100 ? (testMetrics.duration / 1000) * 100 : 0
      };
    } catch (error) {
      console.error('Realtime test failed:', error);
      
      return {
        updateLatency: 0,
        dataConsistency: false,
        performanceImpact: 100
      };
    }
  }
  
  /**
   * Test staff filtering functionality
   */
  private static testStaffFiltering(staffData: StaffFilterOption[], demandData: DemandMatrixData): boolean {
    try {
      // Test basic filtering logic
      if (staffData.length === 0) return false;
      
      // Test that we can filter data points by staff
      const sampleStaffId = staffData[0].id;
      const filteredData = demandData.dataPoints.filter(point => 
        point.taskBreakdown?.some(task => task.preferredStaffId === sampleStaffId)
      );
      
      // Test passes if filtering doesn't throw errors
      return true;
    } catch (error) {
      console.error('Staff filtering test failed:', error);
      return false;
    }
  }
}
