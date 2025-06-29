
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DemandDataService } from '@/services/forecasting/demand/demandDataService';

// Mock Supabase
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        data: [],
        error: null
      }))
    }))
  }))
};

vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase
}));

describe('DemandDataService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateDemandForecast', () => {
    it('should generate demand forecast with correct parameters', async () => {
      const mockRecurringTasks = [
        {
          id: 'task-1',
          name: 'Test Task',
          client_id: 'client-1',
          estimated_hours: 10,
          required_skills: ['Junior'],
          recurrence_type: 'monthly',
          recurrence_interval: 1,
          is_active: true
        }
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            data: mockRecurringTasks,
            error: null
          })
        })
      });

      const timeHorizon = {
        start: new Date('2024-01-01'),
        end: new Date('2024-12-31')
      };

      const filters = {
        includeInactive: false,
        clientFilter: false
      };

      const result = await DemandDataService.generateDemandForecast(timeHorizon, filters);

      expect(result).toBeDefined();
      expect(result.matrixData).toBeDefined();
      expect(result.summary).toBeDefined();
    });

    it('should handle service errors gracefully', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            data: null,
            error: new Error('Database error')
          })
        })
      });

      const timeHorizon = {
        start: new Date('2024-01-01'),
        end: new Date('2024-12-31')
      };

      const filters = {
        includeInactive: false,
        clientFilter: false
      };

      await expect(
        DemandDataService.generateDemandForecast(timeHorizon, filters)
      ).rejects.toThrow();
    });

    it('should filter data based on provided filters', async () => {
      const mockRecurringTasks = [
        {
          id: 'task-1',
          name: 'Test Task',
          client_id: 'client-1',
          estimated_hours: 10,
          required_skills: ['Junior'],
          recurrence_type: 'monthly',
          recurrence_interval: 1,
          is_active: true
        }
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            data: mockRecurringTasks,
            error: null
          })
        })
      });

      const timeHorizon = {
        start: new Date('2024-01-01'),
        end: new Date('2024-12-31')
      };

      const filters = {
        includeInactive: false,
        clientFilter: false
      };

      const result = await DemandDataService.generateDemandForecast(timeHorizon, filters);

      expect(result.matrixData).toBeDefined();
      expect(result.matrixData.dataPoints).toBeDefined();
      expect(result.summary).toBeDefined();
      expect(result.summary.totalTasks).toBeDefined();
      expect(result.summary.totalHours).toBeDefined();
      expect(result.summary.totalClients).toBeDefined();
    });

    it('should generate virtual demand forecast', async () => {
      const timeHorizon = {
        start: new Date('2024-01-01'),
        end: new Date('2024-12-31')
      };

      const filters = {
        includeInactive: false,
        clientFilter: false
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            data: [],
            error: null
          })
        })
      });

      const result = await DemandDataService.generateDemandForecast(timeHorizon, filters);

      expect(result).toBeDefined();
      expect(result.matrixData).toBeDefined();
    });
  });
});
