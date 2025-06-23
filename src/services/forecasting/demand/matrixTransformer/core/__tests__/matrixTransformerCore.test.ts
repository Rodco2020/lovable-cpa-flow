
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MatrixTransformerCore } from '../matrixTransformerCore';
import { DataExtractors } from '../dataExtractors';
import { DataPointBuilder } from '../dataPointBuilder';
import { SummaryBuilders } from '../summaryBuilders';
import { RevenueEnhancer } from '../revenueEnhancer';
import { MatrixValidator } from '../matrixValidator';
import { RecurringTaskDB } from '@/types/task';
import { ForecastData } from '@/types/forecasting';

// Mock dependencies
vi.mock('../dataExtractors');
vi.mock('../dataPointBuilder');
vi.mock('../summaryBuilders');
vi.mock('../revenueEnhancer');
vi.mock('../matrixValidator');
vi.mock('../../performanceOptimizer');

describe('MatrixTransformerCore (Refactored)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('transformToMatrixData', () => {
    it('should transform forecast data to matrix format successfully', async () => {
      // Arrange
      const forecastData: ForecastData[] = [{ 
        period: '2024-01', 
        demand: [{ skill: 'Tax Preparation', hours: 120 }],
        capacity: [{ skill: 'Tax Preparation', hours: 100 }]
      }];

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

      const mockDataPoints = [{
        skillType: 'Tax Preparation',
        month: '2024-01',
        monthLabel: 'Jan 2024',
        demandHours: 120,
        taskCount: 1,
        clientCount: 1,
        taskBreakdown: []
      }];

      const mockSummaries = {
        skillSummary: {},
        staffSummary: {},
        clientMaps: {
          clientTotals: new Map(),
          clientRevenue: new Map(),
          clientHourlyRates: new Map(),
          clientSuggestedRevenue: new Map(),
          clientExpectedLessSuggested: new Map()
        },
        revenueTotals: {
          totalSuggestedRevenue: 0,
          totalExpectedRevenue: 0,
          totalExpectedLessSuggested: 0
        }
      };

      // Mock service calls
      vi.mocked(DataExtractors.extractMonths).mockReturnValue([
        { key: '2024-01', label: 'Jan 2024' }
      ]);
      vi.mocked(DataExtractors.extractSkills).mockReturnValue(['Tax Preparation']);
      vi.mocked(DataExtractors.extractStaffInformation).mockReturnValue([]);
      vi.mocked(DataPointBuilder.buildDataPointsWithStaff).mockResolvedValue(mockDataPoints);
      vi.mocked(RevenueEnhancer.enhanceDataPointsWithRevenue).mockResolvedValue(mockDataPoints);
      vi.mocked(SummaryBuilders.buildSkillSummary).mockReturnValue({});
      vi.mocked(SummaryBuilders.buildStaffSummary).mockReturnValue({});
      vi.mocked(SummaryBuilders.buildClientMaps).mockReturnValue(mockSummaries.clientMaps);
      vi.mocked(SummaryBuilders.calculateRevenueTotals).mockReturnValue(mockSummaries.revenueTotals);
      vi.mocked(MatrixValidator.validateMatrixData).mockReturnValue({
        isValid: true,
        issues: [],
        warnings: []
      });

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
        skillSummary: {},
        clientTotals: mockSummaries.clientMaps.clientTotals,
        clientRevenue: mockSummaries.clientMaps.clientRevenue,
        clientHourlyRates: mockSummaries.clientMaps.clientHourlyRates,
        clientSuggestedRevenue: mockSummaries.clientMaps.clientSuggestedRevenue,
        clientExpectedLessSuggested: mockSummaries.clientMaps.clientExpectedLessSuggested,
        skillFeeRates: new Map(),
        revenueTotals: mockSummaries.revenueTotals,
        staffSummary: {},
        availableStaff: []
      });

      expect(DataExtractors.extractMonths).toHaveBeenCalledWith(forecastData);
      expect(DataExtractors.extractSkills).toHaveBeenCalledWith(forecastData);
      expect(DataPointBuilder.buildDataPointsWithStaff).toHaveBeenCalled();
      expect(MatrixValidator.validateMatrixData).toHaveBeenCalled();
    });

    it('should handle errors gracefully and return empty matrix', async () => {
      // Arrange
      vi.mocked(DataExtractors.extractMonths).mockImplementation(() => {
        throw new Error('Extraction failed');
      });

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
        skillSummary: {},
        clientTotals: new Map(),
        clientRevenue: new Map(),
        clientHourlyRates: new Map(),
        clientSuggestedRevenue: new Map(),
        clientExpectedLessSuggested: new Map(),
        skillFeeRates: new Map(),
        revenueTotals: {
          totalSuggestedRevenue: 0,
          totalExpectedRevenue: 0,
          totalExpectedLessSuggested: 0
        },
        staffSummary: {},
        availableStaff: []
      });
    });
  });
});
