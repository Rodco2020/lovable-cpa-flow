import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DemandDataService } from '@/services/forecasting/demandDataService';
import { DemandForecastParameters } from '@/types/demand';
import { RecurringTaskDB } from '@/types/task';
import { createMockRecurringTask } from '../../utils/mockDataHelpers';

// Mock the new demand services
vi.mock('@/services/forecasting/demand', () => ({
  DataFetcher: {
    fetchClientAssignedTasks: vi.fn(() => Promise.resolve([]))
  },
  RecurrenceCalculator: {
    calculateMonthlyDemand: vi.fn()
  },
  ForecastGenerator: {
    generateDemandForecast: vi.fn(() => Promise.resolve([]))
  },
  MatrixTransformer: {
    transformToMatrixData: vi.fn(() => Promise.resolve({
      months: [{ key: '2025-01', label: 'Jan 2025' }],
      skills: ['Tax Preparation'],
      dataPoints: [],
      totalDemand: 0,
      totalTasks: 0,
      totalClients: 0,
      skillSummary: {}
    }))
  }
}));

// Mock logger
vi.mock('@/services/forecasting/logger', () => ({
  debugLog: vi.fn()
}));

describe('DemandDataService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateMonthlyDemand', () => {
    it('should delegate to RecurrenceCalculator', () => {
      const monthlyTask: RecurringTaskDB = createMockRecurringTask({
        id: '1',
        name: 'Monthly Task',
        recurrence_type: 'Monthly'
      });

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      // Mock the return value
      const { RecurrenceCalculator } = require('@/services/forecasting/demand');
      RecurrenceCalculator.calculateMonthlyDemand.mockReturnValue({
        monthlyOccurrences: 1,
        monthlyHours: 10,
        taskId: '1',
        nextDueDates: []
      });

      const result = DemandDataService.calculateMonthlyDemand(monthlyTask, startDate, endDate);

      expect(RecurrenceCalculator.calculateMonthlyDemand).toHaveBeenCalledWith(monthlyTask, startDate, endDate);
      expect(result.monthlyOccurrences).toBe(1);
      expect(result.monthlyHours).toBe(10);
      expect(result.taskId).toBe('1');
    });
  });

  describe('generateDemandForecast', () => {
    it('should delegate to ForecastGenerator', async () => {
      const parameters: DemandForecastParameters = {
        timeHorizon: 'year',
        dateRange: {
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-12-31')
        },
        includeSkills: 'all',
        includeClients: 'all',
        granularity: 'monthly'
      };

      const { ForecastGenerator } = require('@/services/forecasting/demand');
      ForecastGenerator.generateDemandForecast.mockResolvedValue([]);

      const result = await DemandDataService.generateDemandForecast(parameters);

      expect(ForecastGenerator.generateDemandForecast).toHaveBeenCalledWith(parameters);
      expect(result).toEqual([]);
    });
  });

  describe('transformToMatrixData', () => {
    it('should delegate to MatrixTransformer', async () => {
      const forecastData = [
        {
          period: '2025-01',
          demand: [
            { skill: 'Tax Preparation', hours: 100 }
          ],
          capacity: [],
          demandHours: 100,
          capacityHours: 0
        }
      ];

      const tasks: RecurringTaskDB[] = [createMockRecurringTask({
        id: '1',
        name: 'Tax Task'
      })];

      const { MatrixTransformer } = require('@/services/forecasting/demand');
      MatrixTransformer.transformToMatrixData.mockResolvedValue({
        months: [{ key: '2025-01', label: 'Jan 2025' }],
        skills: ['Tax Preparation'],
        dataPoints: [],
        totalDemand: 100,
        totalTasks: 1,
        totalClients: 1,
        skillSummary: {}
      });

      const result = await DemandDataService.transformToMatrixData(forecastData, tasks);

      expect(MatrixTransformer.transformToMatrixData).toHaveBeenCalledWith(forecastData, tasks);
      expect(result.totalDemand).toBe(100);
      expect(result.totalTasks).toBe(1);
    });
  });

  describe('generateDemandForecastWithMatrix', () => {
    it('should fetch and return complete forecast with matrix data', async () => {
      const parameters: DemandForecastParameters = {
        timeHorizon: 'year',
        dateRange: {
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-12-31')
        },
        includeSkills: 'all',
        includeClients: 'all',
        granularity: 'monthly'
      };

      const mockForecastData = [
        {
          period: '2025-01',
          demand: [{ skill: 'Tax Preparation', hours: 100 }],
          capacity: [],
          demandHours: 100,
          capacityHours: 0
        }
      ];

      const mockTasks: RecurringTaskDB[] = [createMockRecurringTask({
        id: '1',
        name: 'Tax Task'
      })];

      const mockMatrix = {
        months: [{ key: '2025-01', label: 'Jan 2025' }],
        skills: ['Tax Preparation'],
        dataPoints: [],
        totalDemand: 100,
        totalTasks: 1,
        totalClients: 1,
        skillSummary: {}
      };

      const { ForecastGenerator, DataFetcher, MatrixTransformer } = require('@/services/forecasting/demand');
      
      ForecastGenerator.generateDemandForecast.mockResolvedValue(mockForecastData);
      DataFetcher.fetchClientAssignedTasks.mockResolvedValue(mockTasks);
      MatrixTransformer.transformToMatrixData.mockResolvedValue(mockMatrix);

      const result = await DemandDataService.generateDemandForecastWithMatrix(parameters);

      expect(result.data).toEqual(mockForecastData);
      expect(result.demandMatrix).toEqual(mockMatrix);
      expect(result.summary.totalDemand).toBe(100);
      expect(result.summary.totalTasks).toBe(1);
      expect(result.summary.totalClients).toBe(1);
      expect(result.summary.averageMonthlyDemand).toBe(100);
    });

    it('should handle database errors gracefully', async () => {
      const parameters: DemandForecastParameters = {
        timeHorizon: 'year',
        dateRange: {
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-12-31')
        },
        includeSkills: 'all',
        includeClients: 'all',
        granularity: 'monthly'
      };

      const mockError = new Error('Database error');
      const { ForecastGenerator } = require('@/services/forecasting/demand');
      ForecastGenerator.generateDemandForecast.mockRejectedValue(mockError);

      await expect(DemandDataService.generateDemandForecastWithMatrix(parameters)).rejects.toThrow('Database error');
    });
  });
});
