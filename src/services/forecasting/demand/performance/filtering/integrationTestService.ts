
import { DemandMatrixData } from '@/types/demand';
import { DemandMatrixService } from '../../demandMatrixService';

export interface IntegrationTestResult {
  success: boolean;
  message: string;
  executionTime: number;
  dataPointCount: number;
  errors: string[];
}

/**
 * Integration Test Service
 * 
 * Provides integration testing capabilities for the demand matrix system
 */
export class IntegrationTestService {
  
  /**
   * Test staff filtering integration
   */
  static async testStaffFiltering(
    data: DemandMatrixData,
    staffIds: string[]
  ): Promise<IntegrationTestResult> {
    const startTime = performance.now();
    const errors: string[] = [];
    
    try {
      // Validate input data
      if (!DemandMatrixService.validateDemandMatrix(data)) {
        errors.push('Invalid demand matrix data structure');
      }
      
      // Test staff filtering
      const filteredData = DemandMatrixService.getFilteredData(data, {
        clients: staffIds
      });
      
      // Validate filtered results
      if (!filteredData.dataPoints) {
        errors.push('Filtered data points is null or undefined');
      }
      
      const executionTime = performance.now() - startTime;
      
      return {
        success: errors.length === 0,
        message: errors.length === 0 ? 'Staff filtering test passed' : 'Staff filtering test failed',
        executionTime,
        dataPointCount: filteredData.dataPoints?.length || 0,
        errors
      };
      
    } catch (error) {
      const executionTime = performance.now() - startTime;
      
      return {
        success: false,
        message: 'Staff filtering test failed with exception',
        executionTime,
        dataPointCount: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }
  
  /**
   * Test skill filtering integration
   */
  static async testSkillFiltering(
    data: DemandMatrixData,
    skillTypes: string[]
  ): Promise<IntegrationTestResult> {
    const startTime = performance.now();
    const errors: string[] = [];
    
    try {
      // Validate input data
      if (!DemandMatrixService.validateDemandMatrix(data)) {
        errors.push('Invalid demand matrix data structure');
      }
      
      // Test skill filtering
      const filteredData = DemandMatrixService.getFilteredData(data, {
        skills: skillTypes
      });
      
      // Validate filtered results
      if (!filteredData.dataPoints) {
        errors.push('Filtered data points is null or undefined');
      }
      
      const executionTime = performance.now() - startTime;
      
      return {
        success: errors.length === 0,
        message: errors.length === 0 ? 'Skill filtering test passed' : 'Skill filtering test failed',
        executionTime,
        dataPointCount: filteredData.dataPoints?.length || 0,
        errors
      };
      
    } catch (error) {
      const executionTime = performance.now() - startTime;
      
      return {
        success: false,
        message: 'Skill filtering test failed with exception',
        executionTime,
        dataPointCount: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }
}
