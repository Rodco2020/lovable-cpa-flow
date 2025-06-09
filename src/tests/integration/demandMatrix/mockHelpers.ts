
/**
 * Mock Helper Functions for Demand Matrix Integration Tests
 * Centralized mock setup and configuration
 */

import { vi } from 'vitest';

/**
 * Setup successful mock responses for demand matrix tests
 */
export const setupSuccessfulMocks = () => {
  // Mock successful data fetching
  vi.doMock('@/services/forecasting/demandMatrixService', () => ({
    DemandMatrixService: {
      generateDemandMatrix: vi.fn().mockResolvedValue({
        months: [
          { key: '2024-01', label: 'Jan 2024' },
          { key: '2024-02', label: 'Feb 2024' },
        ],
        skills: ['Tax Preparation', 'Audit'],
        dataPoints: [
          {
            skillType: 'Tax Preparation',
            month: '2024-01',
            monthLabel: 'Jan 2024',
            demandHours: 120,
            taskCount: 8,
            clientCount: 3,
            taskBreakdown: []
          }
        ],
        totalDemand: 240,
        totalTasks: 16,
        totalClients: 5,
        skillSummary: {}
      }),
      fetchDemandData: vi.fn().mockResolvedValue([]),
    }
  }));

  // Mock event service
  vi.doMock('@/services/eventService', () => ({
    EventService: {
      emit: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
    }
  }));
};

/**
 * Setup error mock responses for testing error scenarios
 */
export const setupErrorMocks = (errorMessage: string) => {
  vi.doMock('@/services/forecasting/demandMatrixService', () => ({
    DemandMatrixService: {
      generateDemandMatrix: vi.fn().mockRejectedValue(new Error(errorMessage)),
      fetchDemandData: vi.fn().mockRejectedValue(new Error(errorMessage)),
    }
  }));
};

/**
 * Setup empty data mock responses
 */
export const setupEmptyDataMocks = () => {
  vi.doMock('@/services/forecasting/demandMatrixService', () => ({
    DemandMatrixService: {
      generateDemandMatrix: vi.fn().mockResolvedValue({
        months: [],
        skills: [],
        dataPoints: [],
        totalDemand: 0,
        totalTasks: 0,
        totalClients: 0,
        skillSummary: {}
      }),
      fetchDemandData: vi.fn().mockResolvedValue([]),
    }
  }));
};
