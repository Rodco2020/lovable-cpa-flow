
import { describe, it, expect, beforeEach } from 'vitest';
import { AnnualTaskTracker } from '@/services/forecasting/demand/skillCalculator/annualTaskTracker';
import { RecurringTaskDB } from '@/types/task';

describe('AnnualTaskTracker', () => {
  const mockTask: RecurringTaskDB = {
    id: '1',
    name: 'Annual Tax Filing',
    template_id: 'template-1',
    client_id: 'client-1',
    estimated_hours: 40,
    required_skills: ['Tax Preparation'],
    priority: 'High',
    category: 'Tax',
    status: 'Unscheduled',
    recurrence_type: 'Annually',
    recurrence_interval: 1,
    is_active: true,
    due_date: '2025-04-15T00:00:00Z',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    description: 'Annual tax filing task',
    notes: null,
    weekdays: null,
    day_of_month: null,
    month_of_year: 4,
    end_date: null,
    custom_offset_days: null,
    last_generated_date: null,
    preferred_staff_id: null
  };

  // Define mockAnnualTask for the tests
  const mockAnnualTask: RecurringTaskDB = {
    id: '1',
    name: 'Annual Tax Filing',
    template_id: 'template-1',
    client_id: 'client-1',
    estimated_hours: 40,
    required_skills: ['Tax Preparation'],
    priority: 'High',
    category: 'Tax',
    status: 'Unscheduled',
    recurrence_type: 'Annually',
    recurrence_interval: 1,
    is_active: true,
    due_date: '2025-04-15T00:00:00Z',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    description: 'Annual tax filing task',
    notes: null,
    weekdays: null,
    day_of_month: null,
    month_of_year: 4,
    end_date: null,
    custom_offset_days: null,
    last_generated_date: null,
    preferred_staff_id: null
  };

  beforeEach(() => {
    AnnualTaskTracker.clearTracker();
  });

  describe('trackAnnualTask', () => {
    it('should track annual task with inclusion', () => {
      const periodMonth = 2; // March (0-indexed)
      
      AnnualTaskTracker.trackAnnualTask(mockAnnualTask, 20, periodMonth);
      
      const tracked = AnnualTaskTracker.getAllTrackedTasks();
      expect(tracked).toHaveLength(1);
      expect(tracked[0].wasIncluded).toBe(true);
      expect(tracked[0].calculatedHours).toBe(20);
    });

    it('should track annual task with exclusion', () => {
      const periodMonth = 0; // January (0-indexed)
      
      AnnualTaskTracker.trackAnnualTask(mockAnnualTask, 0, periodMonth);
      
      const tracked = AnnualTaskTracker.getAllTrackedTasks();
      expect(tracked).toHaveLength(1);
      expect(tracked[0].wasIncluded).toBe(false);
      expect(tracked[0].calculatedHours).toBe(0);
    });
  });

  describe('predictAnnualTaskInclusion', () => {
    it('should predict inclusion based on month_of_year', () => {
      const periodMonth = 2; // March (0-indexed)
      
      const prediction = AnnualTaskTracker.predictAnnualTaskInclusion(mockAnnualTask, periodMonth);
      
      expect(prediction.shouldInclude).toBe(true);
      expect(prediction.confidence).toBe('High');
      expect(prediction.reason).toContain('month_of_year=3');
    });

    it('should predict exclusion for wrong month', () => {
      const periodMonth = 0; // January (0-indexed)
      
      const prediction = AnnualTaskTracker.predictAnnualTaskInclusion(mockAnnualTask, periodMonth);
      
      expect(prediction.shouldInclude).toBe(false);
      expect(prediction.confidence).toBe('High');
    });
  });

  describe('getSummary', () => {
    it('should provide correct summary statistics', () => {
      AnnualTaskTracker.trackAnnualTask(mockAnnualTask, 20, 2); // Included
      AnnualTaskTracker.trackAnnualTask({...mockAnnualTask, id: '2'}, 0, 0); // Excluded
      
      const summary = AnnualTaskTracker.getSummary();
      
      expect(summary.totalAnnualTasks).toBe(2);
      expect(summary.includedAnnualTasks).toBe(1);
      expect(summary.excludedAnnualTasks).toBe(1);
    });
  });
});
