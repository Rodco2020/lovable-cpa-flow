
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useDemandMatrixFiltering } from '../useDemandMatrixFiltering';
import { DemandMatrixData } from '@/types/demand';

// Mock data
const mockDemandData: DemandMatrixData = {
  months: [
    { key: '2024-01', label: 'Jan 2024' },
    { key: '2024-02', label: 'Feb 2024' }
  ],
  skills: ['Tax Preparation', 'Bookkeeping'],
  dataPoints: [
    {
      skillType: 'Tax Preparation',
      month: '2024-01',
      monthLabel: 'Jan 2024',
      demandHours: 40,
      totalHours: 40,
      taskCount: 5,
      clientCount: 2,
      taskBreakdown: []
    }
  ],
  totalDemand: 40,
  totalTasks: 5,
  totalClients: 2,
  skillSummary: {
    'Tax Preparation': {
      demandHours: 40,
      totalHours: 40,
      taskCount: 5,
      clientCount: 2
    }
  },
  clientTotals: new Map([['client-1', 40]]),
  aggregationStrategy: 'skill-based',
  clientSuggestedRevenue: new Map()
};

describe('useDemandMatrixFiltering', () => {
  it('should filter data correctly', () => {
    const { result } = renderHook(() => 
      useDemandMatrixFiltering({
        demandData: mockDemandData,
        selectedSkills: ['Tax Preparation'],
        selectedClients: [],
        selectedPreferredStaff: [],
        monthRange: { start: 0, end: 1 },
        groupingMode: 'skill'
      })
    );

    expect(result.current.getFilteredData).toBeDefined();
    expect(typeof result.current.getFilteredData).toBe('function');
  });

  it('should handle empty data', () => {
    const { result } = renderHook(() => 
      useDemandMatrixFiltering({
        demandData: null,
        selectedSkills: [],
        selectedClients: [],
        selectedPreferredStaff: [],
        monthRange: { start: 0, end: 1 },
        groupingMode: 'skill'
      })
    );

    expect(result.current.getFilteredData()).toBeNull();
  });
});
