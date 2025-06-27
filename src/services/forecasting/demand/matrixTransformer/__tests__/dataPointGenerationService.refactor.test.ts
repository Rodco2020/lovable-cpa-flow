
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataPointGenerationService } from '../dataPointGenerationService';
import { RevenueCalculationService } from '../revenueCalculationService';
import { TaskBreakdownService } from '../taskBreakdownService';
import { DataPointFactoryService } from '../dataPointFactoryService';
import { RecurringTaskDB } from '@/types/task';
import { ForecastData } from '@/types/forecasting';

// Mock dependencies
vi.mock('../demandCalculationService');
vi.mock('../periodProcessingService');
vi.mock('../clientResolutionService');

describe('DataPointGenerationService Refactor', () => {
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
    weekdays: [1, 3, 5],
    day_of_month: null,
    month_of_year: null,
    end_date: null,
    custom_offset_days: null,
    last_generated_date: null,
    preferred_staff_id: null
  };

  const mockForecastData: ForecastData[] = [{
    period: '2025-01',
    demand: [{ skill: 'Junior', hours: 100 }],
    capacity: [{ skill: 'Junior', hours: 80 }],
    demandHours: 100,
    capacityHours: 80,
    gapHours: 20
  }];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Service Structure', () => {
    it('should maintain the same public interface', () => {
      expect(DataPointGenerationService.generateDataPointsWithSkillMapping).toBeDefined();
      expect(typeof DataPointGenerationService.generateDataPointsWithSkillMapping).toBe('function');
    });

    it('should have separated concerns into focused services', () => {
      expect(RevenueCalculationService.calculateDataPointRevenue).toBeDefined();
      expect(TaskBreakdownService.generateTaskBreakdown).toBeDefined();
      expect(DataPointFactoryService.createDataPoint).toBeDefined();
      expect(DataPointFactoryService.createFallbackDataPoint).toBeDefined();
    });
  });

  describe('Revenue Calculation Service', () => {
    it('should calculate revenue when context is provided', () => {
      const revenueContext = {
        includeRevenueCalculations: true,
        skillFeeRates: new Map([['Junior', 100]])
      };

      const result = RevenueCalculationService.calculateDataPointRevenue(
        10,
        'Junior',
        revenueContext
      );

      expect(result).toHaveProperty('suggestedRevenue');
      expect(result).toHaveProperty('expectedLessSuggested');
      expect(typeof result.suggestedRevenue).toBe('number');
      expect(typeof result.expectedLessSuggested).toBe('number');
    });

    it('should return zero revenue when no context provided', () => {
      const result = RevenueCalculationService.calculateDataPointRevenue(10, 'Junior');
      
      expect(result.suggestedRevenue).toBe(0);
      expect(result.expectedLessSuggested).toBe(0);
    });
  });

  describe('Data Point Factory Service', () => {
    it('should create complete data points with all required fields', () => {
      const month = { key: '2025-01', label: 'Jan 2025' };
      const skill = 'Junior';
      const demandCalculation = {
        totalDemand: 100,
        totalTasks: 5,
        totalClients: 3
      };

      const dataPoint = DataPointFactoryService.createDataPoint(
        month,
        skill,
        demandCalculation,
        []
      );

      expect(dataPoint).toEqual({
        skillType: skill,
        month: month.key,
        monthLabel: month.label,
        demandHours: demandCalculation.totalDemand,
        taskCount: demandCalculation.totalTasks,
        clientCount: demandCalculation.totalClients,
        taskBreakdown: [],
        suggestedRevenue: 0,
        expectedLessSuggested: 0
      });
    });

    it('should create fallback data points', () => {
      const month = { key: '2025-01', label: 'Jan 2025' };
      const skill = 'Junior';

      const fallbackDataPoint = DataPointFactoryService.createFallbackDataPoint(month, skill);

      expect(fallbackDataPoint).toEqual({
        skillType: skill,
        month: month.key,
        monthLabel: month.label,
        demandHours: 0,
        taskCount: 0,
        clientCount: 0,
        taskBreakdown: [],
        suggestedRevenue: 0,
        expectedLessSuggested: 0
      });
    });
  });
});
