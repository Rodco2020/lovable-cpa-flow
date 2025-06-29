
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MatrixTransformerCore } from '../matrixTransformerCore';
import { ForecastData } from '@/types/forecasting';
import { RecurringTaskDB } from '@/types/task';
import { CalculationUtils } from '../calculationUtils';

// Mock the CalculationUtils
vi.mock('../calculationUtils', () => ({
  CalculationUtils: {
    calculateTotals: vi.fn(),
    generateSkillSummary: vi.fn()
  }
}));

describe('MatrixTransformerCore', () => {
  const mockForecastData: ForecastData[] = [
    {
      period: '2024-01',
      totalDemand: 100,
      skillBreakdown: [
        { skill: 'Tax Preparation', hours: 60 },
        { skill: 'Bookkeeping', hours: 40 }
      ]
    }
  ];

  const mockTasks: RecurringTaskDB[] = [
    {
      id: 'task-1',
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
    // Mock CalculationUtils methods
    (CalculationUtils.calculateTotals as any).mockReturnValue({
      totalDemand: 100,
      totalTasks: 10,
      totalClients: 5
    });

    (CalculationUtils.generateSkillSummary as any).mockReturnValue({
      'Tax Preparation': {
        demandHours: 60,
        totalHours: 60,
        taskCount: 6,
        clientCount: 3
      },
      'Bookkeeping': {
        demandHours: 40,
        totalHours: 40,
        taskCount: 4,
        clientCount: 2
      }
    });
  });

  describe('transformToMatrixData', () => {
    it('should transform forecast data to matrix format', async () => {
      const result = await MatrixTransformerCore.transformToMatrixData(mockForecastData, mockTasks);
      
      expect(result).toBeDefined();
      expect(result.months).toHaveLength(1);
      expect(result.months[0].key).toBe('2024-01');
      expect(result.totalDemand).toBe(100);
      expect(result.totalTasks).toBe(10);
      expect(result.totalClients).toBe(5);
    });

    it('should handle empty data gracefully', async () => {
      const result = await MatrixTransformerCore.transformToMatrixData([], []);
      
      expect(result).toBeDefined();
      expect(result.months).toHaveLength(0);
      expect(result.skills).toHaveLength(0);
      expect(result.dataPoints).toHaveLength(0);
    });

    it('should use skill-based aggregation by default', async () => {
      const result = await MatrixTransformerCore.transformToMatrixData(mockForecastData, mockTasks);
      
      expect(result.aggregationStrategy).toBe('skill-based');
    });

    it('should use staff-based aggregation when staff filter is active', async () => {
      const result = await MatrixTransformerCore.transformToMatrixData(
        mockForecastData,
        mockTasks,
        {
          hasStaffFilter: true,
          hasSkillFilter: false,
          preferredStaffIds: ['staff-1'],
          skillTypes: []
        }
      );
      
      expect(result.aggregationStrategy).toBe('staff-based');
    });
  });
});
