
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DemandDataService } from '@/services/forecasting/demandDataService';
import { DemandForecastParameters } from '@/types/demand';
import { RecurringTaskDB } from '@/types/task';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          in: vi.fn(() => ({
            data: [],
            error: null
          }))
        }))
      }))
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
    it('should calculate monthly demand correctly for different recurrence patterns', () => {
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

      const result = DemandDataService.calculateMonthlyDemand(monthlyTask, startDate, endDate);

      expect(result.monthlyOccurrences).toBe(1);
      expect(result.monthlyHours).toBe(10);
      expect(result.taskId).toBe('1');
    });

    it('should handle quarterly recurrence correctly', () => {
      const quarterlyTask: RecurringTaskDB = {
        id: '2',
        name: 'Quarterly Task',
        template_id: 'template-2',
        client_id: 'client-1',
        estimated_hours: 30,
        required_skills: ['Audit'],
        priority: 'High',
        category: 'Audit',
        status: 'Unscheduled',
        recurrence_type: 'Quarterly',
        recurrence_interval: 1,
        is_active: true,
        due_date: '2025-01-15T00:00:00Z',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
        description: 'Test quarterly task',
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

      const result = DemandDataService.calculateMonthlyDemand(quarterlyTask, startDate, endDate);

      expect(result.monthlyOccurrences).toBeCloseTo(0.33, 2);
      expect(result.monthlyHours).toBeCloseTo(10, 2);
    });
  });

  describe('generateDemandForecast', () => {
    it('should generate 12-month demand forecast', async () => {
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

      // Mock the fetchClientAssignedTasks method
      vi.spyOn(DemandDataService, 'fetchClientAssignedTasks').mockResolvedValue([]);

      const result = await DemandDataService.generateDemandForecast(parameters);

      expect(result).toHaveLength(12);
      expect(result[0]).toHaveProperty('period');
      expect(result[0]).toHaveProperty('demand');
      expect(result[0]).toHaveProperty('demandHours');
    });
  });

  describe('transformToMatrixData', () => {
    it('should transform forecast data to matrix format', () => {
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

      const tasks: RecurringTaskDB[] = [
        {
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
        }
      ];

      const result = DemandDataService.transformToMatrixData(forecastData, tasks);

      expect(result.months).toHaveLength(1);
      expect(result.skills).toContain('Tax Preparation');
      expect(result.dataPoints).toHaveLength(1);
      expect(result.totalDemand).toBe(100);
      expect(result.totalTasks).toBe(1);
    });
  });
});
