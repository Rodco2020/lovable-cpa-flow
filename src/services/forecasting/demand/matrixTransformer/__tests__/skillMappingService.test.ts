
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SkillMappingService } from '../skillMappingService';
import { SkillResolutionService } from '../../skillResolutionService';

vi.mock('../../skillResolutionService');

describe('SkillMappingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('extractUniqueSkillsWithMapping', () => {
    it('should extract skills from forecast data and tasks', async () => {
      // Arrange
      const forecastData = [{
        period: '2024-01',
        demand: [{ skill: 'Tax Preparation', hours: 120 }]
      }];

      const tasks = [{
        id: 'task1',
        required_skills: ['Audit Services']
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
      const forecastData = [];
      const tasks = [{
        id: 'task1',
        required_skills: ['123e4567-e89b-12d3-a456-426614174000']
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
