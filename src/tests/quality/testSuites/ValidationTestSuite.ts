
import { describe, it, expect } from 'vitest';
import { DemandMatrixData, DemandDataPoint } from '@/types/demand';

export class ValidationTestSuite {
  static validateMatrixStructure(data: DemandMatrixData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data.months || !Array.isArray(data.months)) {
      errors.push('Missing or invalid months array');
    }
    
    if (!data.skills || !Array.isArray(data.skills)) {
      errors.push('Missing or invalid skills array');
    }
    
    if (!data.dataPoints || !Array.isArray(data.dataPoints)) {
      errors.push('Missing or invalid dataPoints array');
    }
    
    if (typeof data.totalDemand !== 'number') {
      errors.push('Missing or invalid totalDemand');
    }
    
    if (typeof data.totalTasks !== 'number') {
      errors.push('Missing or invalid totalTasks');
    }
    
    if (typeof data.totalClients !== 'number') {
      errors.push('Missing or invalid totalClients');
    }
    
    if (!data.skillSummary || typeof data.skillSummary !== 'object') {
      errors.push('Missing or invalid skillSummary');
    }
    
    if (!data.clientTotals || !(data.clientTotals instanceof Map)) {
      errors.push('Missing or invalid clientTotals');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  static validateMatrixWithFeeRates(data: DemandMatrixData): { isValid: boolean; errors: string[] } {
    const baseValidation = this.validateMatrixStructure(data);
    const errors = [...baseValidation.errors];
    
    if (data.skillFeeRates && !(data.skillFeeRates instanceof Map)) {
      errors.push('skillFeeRates must be a Map when present');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  static validateRevenueCalculations(data: DemandMatrixData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check if revenue-related data is present and valid
    if (data.clientRevenue && !(data.clientRevenue instanceof Map)) {
      errors.push('clientRevenue must be a Map when present');
    }
    
    if (data.clientSuggestedRevenue && !(data.clientSuggestedRevenue instanceof Map)) {
      errors.push('clientSuggestedRevenue must be a Map when present');
    }
    
    if (data.revenueTotals && typeof data.revenueTotals !== 'object') {
      errors.push('revenueTotals must be an object when present');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  static validateClientTotals(data: DemandMatrixData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data.clientTotals || !(data.clientTotals instanceof Map)) {
      errors.push('clientTotals is required and must be a Map');
    }
    
    // Validate that client totals match data points
    if (data.clientTotals && data.dataPoints) {
      const clientsInDataPoints = new Set(
        data.dataPoints.flatMap(dp => 
          dp.taskBreakdown?.map(task => task.clientId) || []
        )
      );
      
      const clientsInTotals = new Set(data.clientTotals.keys());
      
      // Check if all clients in data points have totals
      clientsInDataPoints.forEach(clientId => {
        if (!clientsInTotals.has(clientId)) {
          errors.push(`Client ${clientId} in data points but missing from clientTotals`);
        }
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

describe('ValidationTestSuite', () => {
  it('should validate matrix data structure', () => {
    const testData: DemandMatrixData = {
      months: [{ key: '2024-01', label: 'January 2024' }],
      skills: ['Junior', 'Senior'],
      dataPoints: [
        {
          skillType: 'Junior',
          month: '2024-01',
          monthLabel: 'January 2024',
          demandHours: 40,
          totalHours: 40,
          taskCount: 2,
          clientCount: 1,
          taskBreakdown: []
        }
      ],
      totalDemand: 40,
      totalTasks: 2,
      totalClients: 1,
      skillSummary: {
        'Junior': { totalHours: 40, demandHours: 40, taskCount: 2, clientCount: 1 }
      },
      clientTotals: new Map([['client-1', 40]]),
      aggregationStrategy: 'skill-based',
      clientSuggestedRevenue: new Map()
    };

    const result = ValidationTestSuite.validateMatrixStructure(testData);
    expect(result.isValid).toBe(true);
  });

  it('should validate matrix data with fee rates', () => {
    const testDataWithRates: DemandMatrixData = {
      skillFeeRates: new Map([['Junior', 50]]),
      months: [{ key: '2024-01', label: 'January 2024' }],
      skills: ['Junior', 'Senior'],
      dataPoints: [
        {
          skillType: 'Junior',
          month: '2024-01',
          monthLabel: 'January 2024',
          demandHours: 40,
          totalHours: 40,
          taskCount: 2,
          clientCount: 1,
          taskBreakdown: []
        }
      ],
      totalDemand: 40,
      totalTasks: 2,
      totalClients: 1,
      skillSummary: {
        'Junior': { totalHours: 40, demandHours: 40, taskCount: 2, clientCount: 1 }
      },
      clientTotals: new Map([['client-1', 40]]),
      aggregationStrategy: 'skill-based',
      clientSuggestedRevenue: new Map()
    };

    const result = ValidationTestSuite.validateMatrixWithFeeRates(testDataWithRates);
    expect(result.isValid).toBe(true);
  });
});
