
import { describe, it, expect, beforeEach } from 'vitest';
import { SkillCalculatorCore } from '@/services/forecasting/demand/skillCalculator/skillCalculatorCore';
import { RecurringTaskDB } from '@/types/task';

describe('SkillCalculatorCore', () => {
  const mockTasks: RecurringTaskDB[] = [
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
      last_generated_date: null,
      preferred_staff_id: null
    }
  ];

  beforeEach(() => {
    // Clear any previous state
  });

  describe('calculateMonthlyDemandBySkill', () => {
    it('should calculate skill demand correctly', async () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      const result = await SkillCalculatorCore.calculateMonthlyDemandBySkill(mockTasks, startDate, endDate);

      expect(result).toHaveLength(1);
      expect(result[0].skill).toBe('Tax Preparation');
      expect(result[0].hours).toBe(10);
    });

    it('should handle invalid inputs gracefully', async () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      const result = await SkillCalculatorCore.calculateMonthlyDemandBySkill(null as any, startDate, endDate);

      expect(result).toEqual([]);
    });

    it('should handle invalid date range gracefully', async () => {
      const startDate = new Date('2025-01-31');
      const endDate = new Date('2025-01-01'); // End before start

      const result = await SkillCalculatorCore.calculateMonthlyDemandBySkill(mockTasks, startDate, endDate);

      expect(result).toEqual([]);
    });
  });
});
