
/**
 * Integration Tester
 * Tests integration between matrix controls and data
 */

import { DemandMatrixData } from '@/types/demand';
import { SkillType } from '@/types/task';
import { extractStaffId, extractStaffName } from '@/services/forecasting/demand/utils/staffExtractionUtils';

interface IntegrationTestResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  testResults: {
    skillsTest: boolean;
    clientsTest: boolean;
    staffTest: boolean;
    dataConsistencyTest: boolean;
  };
}

export class IntegrationTester {
  /**
   * Run comprehensive integration tests
   */
  static runIntegrationTests(
    demandData: DemandMatrixData | null,
    selectedSkills: SkillType[],
    selectedClients: string[],
    selectedPreferredStaff: string[]
  ): IntegrationTestResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    console.log('🧪 [INTEGRATION TEST] Running comprehensive integration tests');

    if (!demandData) {
      errors.push('No demand data available for testing');
      return {
        isValid: false,
        errors,
        warnings,
        testResults: {
          skillsTest: false,
          clientsTest: false,
          staffTest: false,
          dataConsistencyTest: false
        }
      };
    }

    // Test 1: Skills integration
    const skillsTest = this.testSkillsIntegration(demandData, selectedSkills, errors, warnings);
    
    // Test 2: Clients integration
    const clientsTest = this.testClientsIntegration(demandData, selectedClients, errors, warnings);
    
    // Test 3: Staff integration
    const staffTest = this.testStaffIntegration(demandData, selectedPreferredStaff, errors, warnings);
    
    // Test 4: Data consistency
    const dataConsistencyTest = this.testDataConsistency(demandData, errors, warnings);

    const isValid = errors.length === 0;

    console.log('🧪 [INTEGRATION TEST] Tests completed:', {
      isValid,
      errorsCount: errors.length,
      warningsCount: warnings.length,
      skillsTest,
      clientsTest,
      staffTest,
      dataConsistencyTest
    });

    return {
      isValid,
      errors,
      warnings,
      testResults: {
        skillsTest,
        clientsTest,
        staffTest,
        dataConsistencyTest
      }
    };
  }

  /**
   * Test skills integration
   */
  private static testSkillsIntegration(
    demandData: DemandMatrixData,
    selectedSkills: SkillType[],
    errors: string[],
    warnings: string[]
  ): boolean {
    try {
      // Test 1: Skills array exists and is valid
      if (!demandData.skills || !Array.isArray(demandData.skills)) {
        errors.push('Skills array is missing or invalid');
        return false;
      }

      // Test 2: Selected skills are valid
      const invalidSkills = selectedSkills.filter(skill => 
        !demandData.skills.includes(skill)
      );
      
      if (invalidSkills.length > 0) {
        warnings.push(`Selected skills not found in data: ${invalidSkills.join(', ')}`);
      }

      // Test 3: Data points have valid skill types
      const dataSkills = new Set(demandData.dataPoints.map(point => point.skillType));
      const availableSkills = new Set(demandData.skills);
      
      const orphanedSkills = Array.from(dataSkills).filter(skill => !availableSkills.has(skill));
      if (orphanedSkills.length > 0) {
        warnings.push(`Data points contain skills not in skills array: ${orphanedSkills.join(', ')}`);
      }

      return true;

    } catch (error) {
      errors.push(`Skills integration test failed: ${error}`);
      return false;
    }
  }

  /**
   * Test clients integration
   */
  private static testClientsIntegration(
    demandData: DemandMatrixData,
    selectedClients: string[],
    errors: string[],
    warnings: string[]
  ): boolean {
    try {
      // Extract clients from data points
      const clientsInData = new Set<string>();
      
      demandData.dataPoints.forEach(point => {
        if (point.taskBreakdown && Array.isArray(point.taskBreakdown)) {
          point.taskBreakdown.forEach((task: any) => {
            if (task.clientId) {
              clientsInData.add(task.clientId);
            }
          });
        }
      });

      // Test selected clients exist in data
      const invalidClients = selectedClients.filter(clientId => 
        !clientsInData.has(clientId)
      );
      
      if (invalidClients.length > 0) {
        warnings.push(`Selected clients not found in data: ${invalidClients.join(', ')}`);
      }

      // Test client consistency
      demandData.dataPoints.forEach((point, index) => {
        if (point.taskBreakdown && Array.isArray(point.taskBreakdown)) {
          point.taskBreakdown.forEach((task: any, taskIndex) => {
            if (!task.clientId) {
              warnings.push(`Missing client ID in data point ${index}, task ${taskIndex}`);
            }
            if (!task.clientName) {
              warnings.push(`Missing client name in data point ${index}, task ${taskIndex}`);
            }
          });
        }
      });

      return true;

    } catch (error) {
      errors.push(`Clients integration test failed: ${error}`);
      return false;
    }
  }

  /**
   * Test staff integration with proper extraction
   */
  private static testStaffIntegration(
    demandData: DemandMatrixData,
    selectedPreferredStaff: string[],
    errors: string[],
    warnings: string[]
  ): boolean {
    try {
      // Extract staff from data points using safe extraction
      const staffInData = new Set<string>();
      
      demandData.dataPoints.forEach(point => {
        if (point.taskBreakdown && Array.isArray(point.taskBreakdown)) {
          point.taskBreakdown.forEach((task: any) => {
            if (task.preferredStaff) {
              // FIXED: Use extractStaffId utility for safe extraction
              const staffId = extractStaffId(task.preferredStaff);
              if (staffId) {
                staffInData.add(staffId);
              }
            }
          });
        }
      });

      // Test selected staff exist in data
      const invalidStaff = selectedPreferredStaff.filter(staffId => 
        !staffInData.has(staffId)
      );
      
      if (invalidStaff.length > 0) {
        warnings.push(`Selected staff not found in data: ${invalidStaff.join(', ')}`);
      }

      // Test staff data consistency
      demandData.dataPoints.forEach((point, index) => {
        if (point.taskBreakdown && Array.isArray(point.taskBreakdown)) {
          point.taskBreakdown.forEach((task: any, taskIndex) => {
            if (task.preferredStaff) {
              // FIXED: Use extractStaffId for validation
              const staffId = extractStaffId(task.preferredStaff);
              const staffName = extractStaffName(task.preferredStaff);
              
              if (!staffId && !staffName) {
                warnings.push(`Invalid preferred staff structure in data point ${index}, task ${taskIndex}`);
              }
            }
          });
        }
      });

      return true;

    } catch (error) {
      errors.push(`Staff integration test failed: ${error}`);
      return false;
    }
  }

  /**
   * Test data consistency
   */
  private static testDataConsistency(
    demandData: DemandMatrixData,
    errors: string[],
    warnings: string[]
  ): boolean {
    try {
      // Test 1: Data points exist
      if (!demandData.dataPoints || !Array.isArray(demandData.dataPoints)) {
        errors.push('Data points array is missing or invalid');
        return false;
      }

      // Test 2: Required fields in data points
      demandData.dataPoints.forEach((point, index) => {
        if (typeof point.demandHours !== 'number') {
          errors.push(`Invalid demandHours in data point ${index}`);
        }
        if (typeof point.taskCount !== 'number') {
          errors.push(`Invalid taskCount in data point ${index}`);
        }
        if (!point.skillType) {
          errors.push(`Missing skillType in data point ${index}`);
        }
        if (!point.month) {
          errors.push(`Missing month in data point ${index}`);
        }
      });

      // Test 3: Totals consistency
      const calculatedTotalDemand = demandData.dataPoints.reduce((sum, point) => sum + point.demandHours, 0);
      if (Math.abs(calculatedTotalDemand - demandData.totalDemand) > 0.01) {
        warnings.push(`Total demand mismatch: calculated ${calculatedTotalDemand}, stored ${demandData.totalDemand}`);
      }

      // Test 4: Task breakdown consistency
      demandData.dataPoints.forEach((point, index) => {
        if (point.taskBreakdown && Array.isArray(point.taskBreakdown)) {
          const breakdownHours = point.taskBreakdown.reduce((sum: number, task: any) => 
            sum + (task.monthlyHours || 0), 0);
          
          if (Math.abs(breakdownHours - point.demandHours) > 0.01) {
            warnings.push(`Hours mismatch in data point ${index}: breakdown ${breakdownHours}, total ${point.demandHours}`);
          }
        }
      });

      return true;

    } catch (error) {
      errors.push(`Data consistency test failed: ${error}`);
      return false;
    }
  }

  /**
   * Generate integration report
   */
  static generateIntegrationReport(result: IntegrationTestResult): string {
    const lines: string[] = [];
    
    lines.push('=== INTEGRATION TEST REPORT ===');
    lines.push(`Overall Status: ${result.isValid ? 'PASS' : 'FAIL'}`);
    lines.push('');
    
    lines.push('Test Results:');
    lines.push(`• Skills Integration: ${result.testResults.skillsTest ? 'PASS' : 'FAIL'}`);
    lines.push(`• Clients Integration: ${result.testResults.clientsTest ? 'PASS' : 'FAIL'}`);
    lines.push(`• Staff Integration: ${result.testResults.staffTest ? 'PASS' : 'FAIL'}`);
    lines.push(`• Data Consistency: ${result.testResults.dataConsistencyTest ? 'PASS' : 'FAIL'}`);
    lines.push('');
    
    if (result.errors.length > 0) {
      lines.push('ERRORS:');
      result.errors.forEach(error => lines.push(`• ${error}`));
      lines.push('');
    }
    
    if (result.warnings.length > 0) {
      lines.push('WARNINGS:');
      result.warnings.forEach(warning => lines.push(`• ${warning}`));
      lines.push('');
    }
    
    lines.push('=== END REPORT ===');
    
    return lines.join('\n');
  }
}
