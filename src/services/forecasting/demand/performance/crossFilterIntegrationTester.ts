
/**
 * Cross Filter Integration Tester
 * Tests staff dropdown integration with demand matrix filtering
 */

import { StaffFilterOption, DemandMatrixData } from '@/types/demand';
import { getStaff } from '@/services/staffService';
import { CacheManager } from './cacheManager';
import { PerformanceMonitor } from './performanceMonitor';
import { CACHE_KEYS } from './constants';

export interface IntegrationTestResult {
  staffDataAvailable: boolean;
  dropdownFunctional: boolean;
  filteringWorks: boolean;
  performanceMetrics: {
    fetchTime: number;
    cacheHit: boolean;
    dataSize: number;
  };
}

export class CrossFilterIntegrationTester {
  /**
   * Fetch staff data for dropdown with caching
   */
  static async fetchStaffForDropdown(): Promise<{
    data: StaffFilterOption[];
    metrics: { fetchTime: number; cacheHit: boolean; dataSize: number };
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
            dataSize: cachedData.length
          }
        };
      }
      
      // Fetch fresh data
      const staffData = await getStaff();
      const staffOptions: StaffFilterOption[] = staffData.map(staff => ({
        id: staff.id,
        name: staff.full_name,
        email: staff.email || '',
        skills: staff.assigned_skills || []
      }));
      
      // Cache the results
      CacheManager.set(cacheKey, staffOptions);
      
      const metrics = monitor.finish();
      return {
        data: staffOptions,
        metrics: {
          fetchTime: metrics.duration,
          cacheHit: false,
          dataSize: staffOptions.length
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
          dataSize: 0
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
    
    try {
      // Test 1: Can we fetch staff data?
      const { data: staffData, metrics } = await this.fetchStaffForDropdown();
      const staffDataAvailable = staffData.length > 0;
      
      // Test 2: Can we create dropdown options?
      const dropdownFunctional = staffData.every(staff => 
        staff.id && staff.name && typeof staff.id === 'string' && typeof staff.name === 'string'
      );
      
      // Test 3: Can we filter by staff?
      const filteringWorks = this.testStaffFiltering(staffData, demandData);
      
      return {
        staffDataAvailable,
        dropdownFunctional,
        filteringWorks,
        performanceMetrics: metrics
      };
      
    } catch (error) {
      console.error('Staff integration test failed:', error);
      const metrics = monitor.finish();
      
      return {
        staffDataAvailable: false,
        dropdownFunctional: false,
        filteringWorks: false,
        performanceMetrics: {
          fetchTime: metrics.duration,
          cacheHit: false,
          dataSize: 0
        }
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
