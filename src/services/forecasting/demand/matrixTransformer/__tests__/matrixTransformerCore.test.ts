
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MatrixTransformerCore } from '../matrixTransformerCore';
import { DataValidator } from '../../dataValidator';
import { SkillMappingService } from '../skillMappingService';
import { DataPointGenerationService } from '../dataPointGenerationService';
import { PeriodProcessingService } from '../periodProcessingService';
import { CalculationUtils } from '../calculationUtils';
import { RecurringTaskDB } from '@/types/task';
import { ForecastData } from '@/types/forecasting';

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
      // Arrange - Complete forecast data with all required properties
      const forecastData: ForecastData[] = [{ 
        period: '2024-01', 
        demand: [{ skill: 'Tax Preparation', hours: 120 }],
        capacity: [{ skill: 'Tax Preparation', hours: 100 }]
      }];

      // Complete task data with all required RecurringTaskDB properties
      const tasks: RecurringTaskDB[] = [{
        id: 'task1',
        template_id: 'template1',
        client_id: 'client1',
        name: 'Test Task',
        description: 'Test description',
        estimated_hours: 8,
        required_skills: ['Tax Preparation'],
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
        preferred_staff_id: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        notes: null
      }];

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

      // Mock service calls with correct return types
      vi.mocked(DataValidator.validateRecurringTasks).mockResolvedValue(mockValidationResult);
      vi.mocked(PeriodProcessingService.generateMonthsFromForecast).mockReturnValue([
        { 
          key: '2024-01', 
          label: 'Jan 2024',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31')
        }
      ]);
      vi.mocked(SkillMappingService.extractUniqueSkillsWithMapping).mockResolvedValue(mockSkillMapping);
      vi.mocked(DataPointGenerationService.generateDataPointsWithSkillMapping).mockResolvedValue(mockDataPoints);
      vi.mocked(CalculationUtils.calculateTotals).mockReturnValue(mockTotals);
      vi.mocked(CalculationUtils.generateSkillSummary).mockReturnValue({});

      // Act
      const result = await MatrixTransformerCore.transformToMatrixData(forecastData, tasks);

      // Assert
      expect(result).toEqual({
        months: [{ 
          key: '2024-01', 
          label: 'Jan 2024',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31')
        }],
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
