
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DemandCalculationService } from '@/services/forecasting/demand/matrixTransformer/demandCalculationService';
import { RecurringTaskDB } from '@/types/task';
import { ForecastData } from '@/types/forecasting';

// Mock the RecurrenceCalculator
vi.mock('@/services/forecasting/demand/recurrenceCalculator', () => ({
  RecurrenceCalculator: {
    calculateMonthlyDemand: vi.fn()
  }
}));

// Mock the ClientResolutionService
vi.mock('@/services/forecasting/demand/clientResolutionService', () => ({
  ClientResolutionService: {
    resolveClientIds: vi.fn(() => Promise.resolve(new Map([['client-1', 'Test Client']])))
  }
}));

describe('DemandCalculationService', () => {
  const mockTask: RecurringTaskDB = {
    id: 'task-1',
    name: 'Test Task',
    template_id: 'template-1',
    client_id: 'client-1',
    estimated_hours: 8,
    required_skills: ['Junior'],
    priority: 'Medium',
    category: 'Tax',
    status: 'Unscheduled',
    recurrence_type: 'Weekly',
    recurrence_interval: 1,
    is_active: true,
    due_date: '2025-01-15T00:00:00Z',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    description: 'Test task',
    notes: null,
    weekdays: [1, 3, 5], // Monday, Wednesday, Friday
    day_of_month: null,
    month_of_year: null,
    end_date: null,
    custom_offset_days: null,
    last_generated_date: null,
    preferred_staff_id: null
  };

  const mockForecastPeriod: ForecastData = {
    period: '2025-01',
    demand: 100,
    capacity: 80,
    gap: 20,
    skills: ['Junior'],
    details: {
      Junior: {
        demand: 100,
        capacity: 80,
        gap: 20
      }
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateMonthlyDemandForTask', () => {
    it('should use RecurrenceCalculator for accurate monthly demand calculation', async () => {
      const { RecurrenceCalculator } = await import('@/services/forecasting/demand/recurrenceCalculator');
      
      // Mock the RecurrenceCalculator to return specific values
      (RecurrenceCalculator.calculateMonthlyDemand as any).mockReturnValue({
        monthlyOccurrences: 13, // 3 days per week × 4.33 weeks
        monthlyHours: 104 // 13 occurrences × 8 hours
      });

      const result = DemandCalculationService.calculateMonthlyDemandForTask(
        mockTask,
        mockForecastPeriod
      );

      expect(RecurrenceCalculator.calculateMonthlyDemand).toHaveBeenCalledWith(
        mockTask,
        expect.any(Date), // startDate
        expect.any(Date)  // endDate
      );

      expect(result.monthlyOccurrences).toBe(13);
      expect(result.monthlyHours).toBe(104);
    });

    it('should parse forecast period correctly to create date range', async () => {
      const { RecurrenceCalculator } = await import('@/services/forecasting/demand/recurrenceCalculator');
      
      (RecurrenceCalculator.calculateMonthlyDemand as any).mockReturnValue({
        monthlyOccurrences: 4,
        monthlyHours: 32
      });

      DemandCalculationService.calculateMonthlyDemandForTask(
        mockTask,
        mockForecastPeriod
      );

      // Verify that the RecurrenceCalculator was called with proper date range
      const calls = (RecurrenceCalculator.calculateMonthlyDemand as any).mock.calls;
      expect(calls).toHaveLength(1);
      
      const [task, startDate, endDate] = calls[0];
      expect(task).toBe(mockTask);
      expect(startDate).toBeInstanceOf(Date);
      expect(endDate).toBeInstanceOf(Date);
      
      // Verify date range is for January 2025
      expect(startDate.getFullYear()).toBe(2025);
      expect(startDate.getMonth()).toBe(0); // January (0-indexed)
      expect(startDate.getDate()).toBe(1);
      
      expect(endDate.getFullYear()).toBe(2025);
      expect(endDate.getMonth()).toBe(0); // January (0-indexed)
      expect(endDate.getDate()).toBe(31); // Last day of January
    });

    it('should handle calculation errors gracefully', async () => {
      const { RecurrenceCalculator } = await import('@/services/forecasting/demand/recurrenceCalculator');
      
      // Mock the RecurrenceCalculator to throw an error
      (RecurrenceCalculator.calculateMonthlyDemand as any).mockImplementation(() => {
        throw new Error('Calculation failed');
      });

      const result = DemandCalculationService.calculateMonthlyDemandForTask(
        mockTask,
        mockForecastPeriod
      );

      expect(result.monthlyOccurrences).toBe(0);
      expect(result.monthlyHours).toBe(0);
    });

    it('should handle different recurrence types correctly', async () => {
      const { RecurrenceCalculator } = await import('@/services/forecasting/demand/recurrenceCalculator');
      
      const monthlyTask: RecurringTaskDB = {
        ...mockTask,
        recurrence_type: 'Monthly',
        recurrence_interval: 1,
        weekdays: null
      };

      (RecurrenceCalculator.calculateMonthlyDemand as any).mockReturnValue({
        monthlyOccurrences: 1,
        monthlyHours: 8
      });

      const result = DemandCalculationService.calculateMonthlyDemandForTask(
        monthlyTask,
        mockForecastPeriod
      );

      expect(result.monthlyOccurrences).toBe(1);
      expect(result.monthlyHours).toBe(8);
    });
  });

  describe('calculateDemandForSkillPeriod', () => {
    it('should aggregate demand correctly using enhanced calculation', () => {
      const { RecurrenceCalculator } = require('@/services/forecasting/demand/recurrenceCalculator');
      
      (RecurrenceCalculator.calculateMonthlyDemand as any).mockReturnValue({
        monthlyOccurrences: 4,
        monthlyHours: 32
      });

      const skillMapping = new Map([['Junior', 'Junior']]);
      const tasks = [mockTask];

      const result = DemandCalculationService.calculateDemandForSkillPeriod(
        'Junior',
        mockForecastPeriod,
        tasks,
        skillMapping
      );

      expect(result.totalDemand).toBe(32);
      expect(result.totalTasks).toBe(1);
      expect(result.totalClients).toBe(1);
    });
  });
});
