
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DemandDataService } from '@/services/forecasting/demandDataService';
import { DemandForecastParameters } from '@/types/demand';
import { RecurringTaskDB } from '@/types/task';

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
    transformToMatrixData: vi.fn(() => ({
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

describe('DemandDataService (Refactored)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateMonthlyDemand', () => {
    it('should delegate to RecurrenceCalculator', () => {
      const monthlyTask: RecurringTaskDB = {
        id: '1',
        name: 'Monthly Task',
        template_id: 'template-1',
        client_id: 'client-1',
        estimated_hours: 10,
        required_skills: ['Tax Preparation'],
        priority: 'Medium',
        category: 'Tax',
        status: 'Unscheduled',
        recurrence_type: 'Monthly',
        recurrence_interval: 1,
        is_active: true,
        due_date: '2025-01-15T00:00:00Z',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
        description: 'Test monthly task',
        notes: null,
        weekdays: null,
        day_of_month: null,
        month_of_year: null,
        end_date: null,
        custom_offset_days: null,
        last_generated_date: null
      };

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
    it('should delegate to MatrixTransformer', () => {
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

      const tasks: RecurringTaskDB[] = [{
        id: '1',
        name: 'Tax Task',
        template_id: 'template-1',
        client_id: 'client-1',
        estimated_hours: 10,
        required_skills: ['Tax Preparation'],
        priority: 'Medium',
        category: 'Tax',
        status: 'Unscheduled',
        recurrence_type: 'Monthly',
        recurrence_interval: 1,
        is_active: true,
        due_date: '2025-01-15T00:00:00Z',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
        description: 'Test task',
        notes: null,
        weekdays: null,
        day_of_month: null,
        month_of_year: null,
        end_date: null,
        custom_offset_days: null,
        last_generated_date: null
      }];

      const { MatrixTransformer } = require('@/services/forecasting/demand');
      MatrixTransformer.transformToMatrixData.mockReturnValue({
        months: [{ key: '2025-01', label: 'Jan 2025' }],
        skills: ['Tax Preparation'],
        dataPoints: [],
        totalDemand: 100,
        totalTasks: 1,
        totalClients: 1,
        skillSummary: {}
      });

      const result = DemandDataService.transformToMatrixData(forecastData, tasks);

      expect(MatrixTransformer.transformToMatrixData).toHaveBeenCalledWith(forecastData, tasks);
      expect(result.totalDemand).toBe(100);
      expect(result.totalTasks).toBe(1);
    });
  });
});
