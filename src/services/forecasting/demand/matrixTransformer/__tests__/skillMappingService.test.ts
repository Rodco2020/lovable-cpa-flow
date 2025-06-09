
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SkillMappingService } from '../skillMappingService';
import { SkillResolutionService } from '../../skillResolutionService';
import { ForecastData } from '@/types/forecasting';
import { RecurringTaskDB } from '@/types/task';

vi.mock('../../skillResolutionService');

describe('SkillMappingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('extractUniqueSkillsWithMapping', () => {
    it('should extract skills from forecast data and tasks', async () => {
      // Arrange - Complete ForecastData with all required properties
      const forecastData: ForecastData[] = [{
        period: '2024-01',
        demand: [{ skill: 'Tax Preparation', hours: 120 }],
        capacity: [{ skill: 'Tax Preparation', hours: 100 }]
      }];

      // Complete RecurringTaskDB with all required properties
      const tasks: RecurringTaskDB[] = [{
        id: 'task1',
        template_id: 'template1',
        client_id: 'client1',
        name: 'Audit Task',
        description: 'Audit description',
        estimated_hours: 8,
        required_skills: ['Audit Services'],
        priority: 'Medium',
        category: 'Audit',
        status: 'Unscheduled',
        due_date: '2024-01-15',
        recurrence_type: 'Monthly',
        recurrence_interval: 1,
        weekdays: null,
        day_of_month: 15,
        month_of_year: null,
        end_date: null,
        custom_offset_days: null,
        last_generated_date: null,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        notes: null
      }];

      // Act
      const result = await SkillMappingService.extractUniqueSkillsWithMapping(forecastData, tasks);

      // Assert
      expect(result.skills).toContain('Tax Preparation');
      expect(result.skills).toContain('Audit Services');
      expect(result.skillMapping.get('Tax Preparation')).toBe('Tax Preparation');
      expect(result.skillMapping.get('Audit Services')).toBe('Audit Services');
    });

    it('should resolve UUID skills to display names', async () => {
      // Arrange
      const forecastData: ForecastData[] = [];
      const tasks: RecurringTaskDB[] = [{
        id: 'task1',
        template_id: 'template1',
        client_id: 'client1',
        name: 'Tax Task',
        description: 'Tax description',
        estimated_hours: 8,
        required_skills: ['123e4567-e89b-12d3-a456-426614174000'],
        priority: 'Medium',
        category: 'Tax',
        status: 'Unscheduled',
        due_date: '2024-01-15',
        recurrence_type: 'Monthly',
        recurrence_interval: 1,
        weekdays: null,
        day_of_month: 15,
        month_of_year: null,
        end_date: null,
        custom_offset_days: null,
        last_generated_date: null,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        notes: null
      }];

      vi.mocked(SkillResolutionService.getSkillNames).mockResolvedValue(['Tax Preparation']);

      // Act
      const result = await SkillMappingService.extractUniqueSkillsWithMapping(forecastData, tasks);

      // Assert
      expect(result.skills).toContain('Tax Preparation');
      expect(result.skillMapping.get('123e4567-e89b-12d3-a456-426614174000')).toBe('Tax Preparation');
    });

    it('should handle empty input gracefully', async () => {
      // Act
      const result = await SkillMappingService.extractUniqueSkillsWithMapping([], []);

      // Assert
      expect(result.skills).toEqual([]);
      expect(result.skillMapping.size).toBe(0);
    });
  });
});
