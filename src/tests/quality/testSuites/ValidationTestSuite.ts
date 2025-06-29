import { describe, it, expect } from 'vitest';
import { ValidationTestSuite } from '../ValidationTestSuite';
import { DemandMatrixData } from '@/types/demand';

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
          totalHours: 40, // Add required totalHours
          taskCount: 2,
          clientCount: 1
        }
      ],
      totalDemand: 40,
      totalTasks: 2,
      totalClients: 1,
      skillSummary: {
        'Junior': { totalHours: 40, demandHours: 40, taskCount: 2, clientCount: 1 }
      },
      clientTotals: new Map([['client-1', 40]]), // Add required clientTotals
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
          totalHours: 40, // Add required totalHours
          taskCount: 2,
          clientCount: 1
        }
      ],
      totalDemand: 40,
      totalTasks: 2,
      totalClients: 1,
      skillSummary: {
        'Junior': { totalHours: 40, demandHours: 40, taskCount: 2, clientCount: 1 }
      },
      clientTotals: new Map([['client-1', 40]]), // Add required clientTotals
      aggregationStrategy: 'skill-based',
      clientSuggestedRevenue: new Map()
    };

    const result = ValidationTestSuite.validateMatrixWithFeeRates(testDataWithRates);
    expect(result.isValid).toBe(true);
  });

  it('should validate revenue calculations', () => {
    const testData = {
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
          clientCount: 1
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

    const result = ValidationTestSuite.validateRevenueCalculations(testData as any);
    expect(result.isValid).toBe(true);
  });

  it('should validate client totals', () => {
    const testData = {
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
          clientCount: 1
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

    const result = ValidationTestSuite.validateClientTotals(testData as any);
    expect(result.isValid).toBe(true);
  });
});
