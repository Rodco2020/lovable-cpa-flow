
import { renderHook } from '@testing-library/react';
import { useDemandMatrixFiltering } from '../useDemandMatrixFiltering';
import { DemandMatrixData } from '@/types/demand';
import { createMockDemandMatrixData } from '@/tests/quality/testUtils/DemandMatrixTestHelpers';

describe('useDemandMatrixFiltering', () => {
  const mockDemandData: DemandMatrixData = {
    months: [{ key: '2024-01', label: 'Jan 2024' }],
    skills: ['Tax Preparation'],
    dataPoints: [
      {
        month: '2024-01',
        monthLabel: 'Jan 2024',
        skillType: 'Tax Preparation',
        demandHours: 40,
        totalHours: 40, // Add required property
        taskCount: 5,
        clientCount: 2,
        taskBreakdown: [
          {
            recurringTaskId: 'task-1',
            taskName: 'Tax Filing',
            clientId: 'client-1',
            clientName: 'Client A',
            skillType: 'Tax Preparation',
            estimatedHours: 8,
            monthlyHours: 8,
            preferredStaffId: 'staff-1',
            preferredStaffName: 'John Doe',
            recurrencePattern: {
              type: 'Monthly',
              interval: 1,
              frequency: 1
            }
          }
        ]
      }
    ],
    totalDemand: 40,
    totalTasks: 5,
    totalClients: 2,
    skillSummary: {
      'Tax Preparation': {
        demandHours: 40, // Add required property
        totalHours: 40,
        taskCount: 5,
        clientCount: 2
      }
    },
    clientTotals: new Map([['client-1', 40]]),
    aggregationStrategy: 'skill-based'
  };

  const mockDemandMatrixControls = {
    selectedSkills: [],
    selectedClients: [],
    selectedStaff: [],
    monthRange: { start: 0, end: 11 }
  };

  it('should return filtered data when filters are applied', () => {
    const { result } = renderHook(() =>
      useDemandMatrixFiltering({
        demandData: mockDemandData,
        demandMatrixControls: mockDemandMatrixControls,
        groupingMode: 'skill'
      })
    );

    const filteredData = result.current.getFilteredData();
    expect(filteredData).toBeDefined();
    expect(filteredData?.dataPoints).toHaveLength(1);
  });

  it('should return null when no demand data provided', () => {
    const { result } = renderHook(() =>
      useDemandMatrixFiltering({
        demandData: null,
        demandMatrixControls: mockDemandMatrixControls,
        groupingMode: 'skill'
      })
    );

    const filteredData = result.current.getFilteredData();
    expect(filteredData).toBeNull();
  });
});
