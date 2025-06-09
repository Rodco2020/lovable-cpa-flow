
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MatrixTransformerCore } from '../matrixTransformerCore';
import { DataValidator } from '../../dataValidator';
import { SkillMappingService } from '../skillMappingService';
import { DataPointGenerationService } from '../dataPointGenerationService';
import { PeriodProcessingService } from '../periodProcessingService';
import { CalculationUtils } from '../calculationUtils';

// Mock dependencies
vi.mock('../../dataValidator');
vi.mock('../skillMappingService');
vi.mock('../dataPointGenerationService');
vi.mock('../periodProcessingService');
vi.mock('../calculationUtils');

describe('MatrixTransformerCore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('transformToMatrixData', () => {
    it('should transform forecast data to matrix format successfully', async () => {
      // Arrange
      const forecastData = [{ period: '2024-01', demand: [] }];
      const tasks = [{ id: 'task1', name: 'Test Task' }];

      const mockValidationResult = {
        validTasks: tasks,
        invalidTasks: [],
        resolvedTasks: []
      };

      const mockSkillMapping = {
        skills: ['Tax Preparation'],
        skillMapping: new Map([['uuid1', 'Tax Preparation']])
      };

      const mockDataPoints = [{
        skillType: 'Tax Preparation',
        month: '2024-01',
        monthLabel: 'Jan 2024',
        demandHours: 120,
        taskCount: 1,
        clientCount: 1,
        taskBreakdown: []
      }];

      const mockTotals = {
        totalDemand: 120,
        totalTasks: 1,
        totalClients: 1
      };

      // Mock service calls
      vi.mocked(DataValidator.validateRecurringTasks).mockResolvedValue(mockValidationResult);
      vi.mocked(PeriodProcessingService.generateMonthsFromForecast).mockReturnValue([
        { key: '2024-01', label: 'Jan 2024' }
      ]);
      vi.mocked(SkillMappingService.extractUniqueSkillsWithMapping).mockResolvedValue(mockSkillMapping);
      vi.mocked(DataPointGenerationService.generateDataPointsWithSkillMapping).mockResolvedValue(mockDataPoints);
      vi.mocked(CalculationUtils.calculateTotals).mockReturnValue(mockTotals);
      vi.mocked(CalculationUtils.generateSkillSummary).mockReturnValue({});

      // Act
      const result = await MatrixTransformerCore.transformToMatrixData(forecastData, tasks);

      // Assert
      expect(result).toEqual({
        months: [{ key: '2024-01', label: 'Jan 2024' }],
        skills: ['Tax Preparation'],
        dataPoints: mockDataPoints,
        totalDemand: 120,
        totalTasks: 1,
        totalClients: 1,
        skillSummary: {}
      });

      expect(DataValidator.validateRecurringTasks).toHaveBeenCalledWith(tasks);
      expect(SkillMappingService.extractUniqueSkillsWithMapping).toHaveBeenCalledWith(forecastData, tasks);
      expect(DataPointGenerationService.generateDataPointsWithSkillMapping).toHaveBeenCalledWith({
        forecastData,
        tasks,
        skills: ['Tax Preparation'],
        skillMapping: mockSkillMapping.skillMapping
      });
    });

    it('should handle errors gracefully and return minimal valid structure', async () => {
      // Arrange
      vi.mocked(DataValidator.validateRecurringTasks).mockRejectedValue(new Error('Validation failed'));

      // Act
      const result = await MatrixTransformerCore.transformToMatrixData([], []);

      // Assert
      expect(result).toEqual({
        months: [],
        skills: [],
        dataPoints: [],
        totalDemand: 0,
        totalTasks: 0,
        totalClients: 0,
        skillSummary: {}
      });
    });
  });
});
