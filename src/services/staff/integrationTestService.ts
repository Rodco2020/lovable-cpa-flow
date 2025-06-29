
import { UuidResolutionService } from './uuidResolutionService';
import { StaffFilterValidationService } from './staffFilterValidationService';
import { DemandPerformanceOptimizer } from '@/services/forecasting/demand/performanceOptimizer';
import { DemandFilters, DemandMatrixData } from '@/types/demand';

export interface IntegrationTestResult {
  testName: string;
  passed: boolean;
  duration: number;
  details: any;
  issues: string[];
  recommendations: string[];
}

/**
 * Integration test service for staff filtering
 * Verifies the complete flow from name resolution to filtering works correctly
 */
export class StaffFilteringIntegrationTestService {
  
  /**
   * Test the complete staff filtering flow
   */
  static async runComprehensiveTest(): Promise<IntegrationTestResult[]> {
    console.log('🧪 [INTEGRATION TEST] Starting comprehensive staff filtering tests');
    
    const results: IntegrationTestResult[] = [];
    
    // Test 1: UUID Resolution
    results.push(await this.testUuidResolution());
    
    // Test 2: Filter Validation
    results.push(await this.testFilterValidation());
    
    // Test 3: End-to-End Filtering
    results.push(await this.testEndToEndFiltering());
    
    // Test 4: Marciano-specific Test
    results.push(await this.testMarcianoFiltering());
    
    console.log('✅ [INTEGRATION TEST] All tests completed:', {
      totalTests: results.length,
      passed: results.filter(r => r.passed).length,
      failed: results.filter(r => !r.passed).length
    });
    
    return results;
  }

  /**
   * Test UUID resolution functionality
   */
  private static async testUuidResolution(): Promise<IntegrationTestResult> {
    const startTime = performance.now();
    const result: IntegrationTestResult = {
      testName: 'UUID Resolution Test',
      passed: false,
      duration: 0,
      details: {},
      issues: [],
      recommendations: []
    };

    try {
      // Test fetching all staff
      const allStaff = await UuidResolutionService.getAllStaff();
      result.details.totalStaff = allStaff.length;
      
      if (allStaff.length === 0) {
        result.issues.push('No staff members found in database');
        result.recommendations.push('Ensure staff table has data');
      }

      // Test name resolution
      const testNames = ['Marciano Urbaez', 'Marciano', 'NonExistent Person'];
      const resolvedUuids = await UuidResolutionService.resolveStaffNamesToUuids(testNames);
      
      result.details.nameResolution = {
        testNames,
        resolvedUuids,
        successCount: resolvedUuids.length
      };

      // Test finding by UUID
      if (resolvedUuids.length > 0) {
        const staff = await UuidResolutionService.findStaffByUuid(resolvedUuids[0]);
        result.details.uuidLookup = staff ? 'Success' : 'Failed';
      }

      result.passed = allStaff.length > 0 && resolvedUuids.length > 0;
      
    } catch (error) {
      result.issues.push(`UUID resolution test failed: ${error}`);
      result.recommendations.push('Check database connection and staff table structure');
    }

    result.duration = performance.now() - startTime;
    return result;
  }

  /**
   * Test filter validation functionality
   */
  private static async testFilterValidation(): Promise<IntegrationTestResult> {
    const startTime = performance.now();
    const result: IntegrationTestResult = {
      testName: 'Filter Validation Test',
      passed: false,
      duration: 0,
      details: {},
      issues: [],
      recommendations: []
    };

    try {
      // Test with names (should trigger validation warnings)
      const nameFilters = ['Marciano Urbaez', 'John Doe'];
      const nameValidation = await StaffFilterValidationService.validateAndResolveStaffFilters(nameFilters);
      
      result.details.nameValidation = {
        originalFilters: nameFilters,
        resolvedUuids: nameValidation.resolvedValues,
        issues: nameValidation.issues,
        suggestions: nameValidation.suggestions
      };

      // Test with UUIDs (should pass validation)
      const uuidFilters = nameValidation.resolvedValues;
      const uuidValidation = await StaffFilterValidationService.validateAndResolveStaffFilters(uuidFilters);
      
      result.details.uuidValidation = {
        originalFilters: uuidFilters,
        resolvedUuids: uuidValidation.resolvedValues,
        issues: uuidValidation.issues
      };

      result.passed = nameValidation.resolvedValues.length > 0 && uuidValidation.isValid;
      
    } catch (error) {
      result.issues.push(`Filter validation test failed: ${error}`);
      result.recommendations.push('Check validation service implementation');
    }

    result.duration = performance.now() - startTime;
    return result;
  }

  /**
   * Test end-to-end filtering with mock data
   */
  private static async testEndToEndFiltering(): Promise<IntegrationTestResult> {
    const startTime = performance.now();
    const result: IntegrationTestResult = {
      testName: 'End-to-End Filtering Test',
      passed: false,
      duration: 0,
      details: {},
      issues: [],
      recommendations: []
    };

    try {
      // Get a real staff UUID
      const allStaff = await UuidResolutionService.getAllStaff();
      if (allStaff.length === 0) {
        result.issues.push('No staff available for testing');
        return result;
      }

      const testStaffUuid = allStaff[0].id;
      
      // Create mock matrix data
      const mockData: DemandMatrixData = {
        months: [{ key: '2024-01', label: 'January 2024' }],
        skills: ['Junior', 'Senior'],
        dataPoints: [
          {
            skillType: 'Junior',
            month: '2024-01',
            monthLabel: 'January 2024',
            demandHours: 40,
            taskCount: 2,
            clientCount: 1,
            taskBreakdown: [
              {
                clientId: 'client-1',
                clientName: 'Test Client',
                recurringTaskId: 'task-1',
                taskName: 'Test Task',
                skillType: 'Junior',
                estimatedHours: 20,
                recurrencePattern: { type: 'monthly', interval: 1, frequency: 1 },
                monthlyHours: 20,
                preferredStaffId: testStaffUuid, // Use real UUID
                preferredStaffName: allStaff[0].full_name
              }
            ]
          }
        ],
        totalDemand: 40,
        totalTasks: 2,
        totalClients: 1,
        skillSummary: {
          'Junior': { totalHours: 40, taskCount: 2, clientCount: 1 }
        }
      };

      // Test filtering with the staff UUID
      const filters: DemandFilters = {
        skills: [],
        clients: [],
        preferredStaff: [testStaffUuid],
        timeHorizon: {
          start: new Date('2024-01-01'),
          end: new Date('2024-12-31')
        }
      };

      const filteredData = DemandPerformanceOptimizer.optimizeFiltering(mockData, filters);
      
      result.details.filtering = {
        originalDataPoints: mockData.dataPoints.length,
        filteredDataPoints: filteredData.dataPoints.length,
        testStaffUuid,
        testStaffName: allStaff[0].full_name
      };

      result.passed = filteredData.dataPoints.length > 0;
      
      if (!result.passed) {
        result.issues.push('Filtering returned no results despite matching data');
        result.recommendations.push('Check filter strategy implementation');
      }
      
    } catch (error) {
      result.issues.push(`End-to-end filtering test failed: ${error}`);
      result.recommendations.push('Check integration between components');
    }

    result.duration = performance.now() - startTime;
    return result;
  }

  /**
   * Test Marciano-specific filtering
   */
  private static async testMarcianoFiltering(): Promise<IntegrationTestResult> {
    const startTime = performance.now();
    const result: IntegrationTestResult = {
      testName: 'Marciano Filtering Test',
      passed: false,
      duration: 0,
      details: {},
      issues: [],
      recommendations: []
    };

    try {
      // Try to resolve Marciano's UUID
      const marcianoUuids = await UuidResolutionService.resolveStaffNamesToUuids(['Marciano Urbaez', 'Marciano']);
      
      if (marcianoUuids.length === 0) {
        result.issues.push('Could not resolve Marciano Urbaez UUID');
        result.recommendations.push('Ensure Marciano Urbaez exists in staff table');
        return result;
      }

      const marcianoUuid = marcianoUuids[0];
      const marcianoStaff = await UuidResolutionService.findStaffByUuid(marcianoUuid);
      
      result.details.marciano = {
        uuid: marcianoUuid,
        name: marcianoStaff?.full_name || 'Unknown',
        resolved: true
      };

      // Test validation of Marciano's UUID
      const validation = await StaffFilterValidationService.validateAndResolveStaffFilters([marcianoUuid]);
      
      result.details.validation = {
        isValid: validation.isValid,
        issues: validation.issues,
        resolvedValues: validation.resolvedValues
      };

      result.passed = marcianoUuids.length > 0 && validation.isValid;
      
    } catch (error) {
      result.issues.push(`Marciano filtering test failed: ${error}`);
      result.recommendations.push('Check Marciano-specific implementation');
    }

    result.duration = performance.now() - startTime;
    return result;
  }

  /**
   * Generate a comprehensive test report
   */
  static generateTestReport(results: IntegrationTestResult[]): string {
    const passedTests = results.filter(r => r.passed).length;
    const totalTests = results.length;
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

    let report = `
# Staff Filtering Integration Test Report

## Summary
- **Total Tests**: ${totalTests}
- **Passed**: ${passedTests}
- **Failed**: ${totalTests - passedTests}
- **Success Rate**: ${((passedTests / totalTests) * 100).toFixed(1)}%
- **Total Duration**: ${totalDuration.toFixed(2)}ms

## Test Results
`;

    results.forEach((result, index) => {
      report += `
### ${index + 1}. ${result.testName}
- **Status**: ${result.passed ? '✅ PASSED' : '❌ FAILED'}
- **Duration**: ${result.duration.toFixed(2)}ms
- **Issues**: ${result.issues.length > 0 ? result.issues.join(', ') : 'None'}
- **Recommendations**: ${result.recommendations.length > 0 ? result.recommendations.join(', ') : 'None'}
`;
    });

    return report;
  }
}
