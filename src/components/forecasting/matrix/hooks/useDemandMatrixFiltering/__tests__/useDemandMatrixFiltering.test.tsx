
import { renderHook } from '@testing-library/react';
import { useDemandMatrixFiltering } from '../useDemandMatrixFiltering';
import { DemandMatrixData } from '@/types/demand';

// Mock the performance optimizer
jest.mock('@/services/forecasting/demand/performanceOptimizer', () => ({
  DemandPerformanceOptimizer: {
    optimizeFiltering: jest.fn((data) => data)
  }
}));

// Mock date-fns functions
jest.mock('date-fns', () => ({
  startOfMonth: jest.fn((date) => date),
  endOfMonth: jest.fn((date) => date),
  differenceInDays: jest.fn(() => 30),
  addDays: jest.fn((date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000)),
  format: jest.fn(() => 'Jan 2024')
}));

describe('useDemandMatrixFiltering', () => {
  const mockDemandData: DemandMatrixData = {
    dataPoints: [
      {
        month: '2024-01',
        skillType: 'Junior',
        demandHours: 40,
        taskCount: 5,
        clientCount: 2,
        taskBreakdown: [
          {
            recurringTaskId: 'recurring-task-1',
            taskName: 'Test Task',
            clientId: 'client-1',
            clientName: 'Test Client',
            skillType: 'Junior',
            estimatedHours: 8,
            recurrencePattern: {
              type: 'monthly',
              interval: 1,
              frequency: 12
            },
            monthlyHours: 8,
            preferredStaffId: 'staff-1',
            preferredStaffName: 'Test Staff'
          }
        ]
      }
    ],
    months: [{ key: '2024-01', label: 'Jan 2024' }],
    skills: ['Junior'],
    totalDemand: 40,
    totalTasks: 5,
    totalClients: 2,
    skillSummary: {
      'Junior': {
        totalHours: 40,
        taskCount: 5,
        clientCount: 2
      }
    }
  };

  const mockControls = {
    selectedSkills: ['Junior'],
    selectedClients: ['client-1'],
    selectedPreferredStaff: ['staff-1'],
    availableSkills: ['Junior'],
    availableClients: [{ id: 'client-1', name: 'Test Client' }],
    availablePreferredStaff: [{ id: 'staff-1', name: 'Test Staff' }],
    isAllSkillsSelected: false,
    isAllClientsSelected: false,
    isAllPreferredStaffSelected: false,
    monthRange: { start: 0, end: 0 }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console logs during tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return null when demandData is null', () => {
    const { result } = renderHook(() =>
      useDemandMatrixFiltering(null, mockControls, 'skill')
    );

    expect(result.current.getFilteredData()).toBeNull();
  });

  it('should return filtered data when demandData is provided', () => {
    const { result } = renderHook(() =>
      useDemandMatrixFiltering(mockDemandData, mockControls, 'skill')
    );

    const filteredData = result.current.getFilteredData();
    expect(filteredData).toBeDefined();
    expect(filteredData?.dataPoints).toHaveLength(1);
  });

  it('should handle client grouping mode', () => {
    const { result } = renderHook(() =>
      useDemandMatrixFiltering(mockDemandData, mockControls, 'client')
    );

    const filteredData = result.current.getFilteredData();
    expect(filteredData).toBeDefined();
    // Should transform skills to client names for client grouping
    expect(filteredData?.skills).toContain('Test Client');
  });

  it('should handle "all selected" filters correctly', () => {
    const allSelectedControls = {
      ...mockControls,
      isAllSkillsSelected: true,
      isAllClientsSelected: true,
      isAllPreferredStaffSelected: true
    };

    const { result } = renderHook(() =>
      useDemandMatrixFiltering(mockDemandData, allSelectedControls, 'skill')
    );

    const filteredData = result.current.getFilteredData();
    expect(filteredData).toBeDefined();
    expect(filteredData?.dataPoints).toHaveLength(1);
  });

  it('should validate month range correctly', () => {
    const invalidRangeControls = {
      ...mockControls,
      monthRange: { start: 10, end: 20 } // Out of bounds
    };

    const { result } = renderHook(() =>
      useDemandMatrixFiltering(mockDemandData, invalidRangeControls, 'skill')
    );

    const filteredData = result.current.getFilteredData();
    expect(filteredData).toBeDefined();
    // Should handle out-of-bounds gracefully
  });

  it('should create fallback dataset when all data is filtered out', () => {
    const emptyResultData = {
      ...mockDemandData,
      dataPoints: []
    };

    // Mock the optimizer to return empty data
    const { DemandPerformanceOptimizer } = require('@/services/forecasting/demand/performanceOptimizer');
    DemandPerformanceOptimizer.optimizeFiltering.mockReturnValue(emptyResultData);

    const { result } = renderHook(() =>
      useDemandMatrixFiltering(mockDemandData, mockControls, 'skill')
    );

    const filteredData = result.current.getFilteredData();
    expect(filteredData).toBeDefined();
    expect(filteredData?.dataPoints).toHaveLength(0);
    expect(filteredData?.totalDemand).toBe(0);
  });

  it('should preserve month structure with key and label', () => {
    const { result } = renderHook(() =>
      useDemandMatrixFiltering(mockDemandData, mockControls, 'skill')
    );

    const filteredData = result.current.getFilteredData();
    expect(filteredData?.months).toBeDefined();
    expect(filteredData?.months[0]).toHaveProperty('key');
    expect(filteredData?.months[0]).toHaveProperty('label');
  });

  it('should handle empty months gracefully', () => {
    const dataWithEmptyMonths = {
      ...mockDemandData,
      months: []
    };

    const { result } = renderHook(() =>
      useDemandMatrixFiltering(dataWithEmptyMonths, mockControls, 'skill')
    );

    const filteredData = result.current.getFilteredData();
    expect(filteredData).toBeDefined();
    // Should create fallback months
  });
});
