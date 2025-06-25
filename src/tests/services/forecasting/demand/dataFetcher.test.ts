
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataFetcher } from '@/services/forecasting/demand/dataFetcher';
import { DataTransformationService } from '@/services/forecasting/demand/dataTransformationService';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          range: vi.fn(() => ({
            in: vi.fn(() => ({
              data: [],
              error: null
            })),
            data: [],
            error: null
          }))
        }))
      }))
    }))
  }
}));

// Mock logger
vi.mock('@/services/forecasting/logger', () => ({
  debugLog: vi.fn()
}));

// Mock DataTransformationService
vi.mock('@/services/forecasting/demand/dataTransformationService', () => ({
  DataTransformationService: {
    transformRecurringTasks: vi.fn().mockReturnValue([]),
    createFallbackTasks: vi.fn().mockReturnValue([]),
    transformClientData: vi.fn().mockReturnValue([]),
    transformClientsWithRevenue: vi.fn().mockReturnValue([]),
    transformSkillData: vi.fn().mockReturnValue([])
  }
}));

describe('DataFetcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchClientAssignedTasks', () => {
    it('should fetch tasks without filters', async () => {
      const filters = {
        skills: [],
        clients: [],
        timeHorizon: {
          start: new Date('2025-01-01'),
          end: new Date('2025-12-31')
        }
      };

      const result = await DataFetcher.fetchClientAssignedTasks(filters);
      expect(result).toEqual([]);
      expect(DataTransformationService.transformRecurringTasks).toHaveBeenCalled();
    });

    it('should apply skill filters correctly', async () => {
      const filters = {
        skills: ['Tax Preparation'],
        clients: [],
        timeHorizon: {
          start: new Date('2025-01-01'),
          end: new Date('2025-12-31')
        }
      };

      const result = await DataFetcher.fetchClientAssignedTasks(filters);
      expect(result).toEqual([]);
      expect(DataTransformationService.transformRecurringTasks).toHaveBeenCalled();
    });
  });

  describe('fetchAvailableSkills', () => {
    it('should fetch and transform skills', async () => {
      const result = await DataFetcher.fetchAvailableSkills();
      expect(result).toEqual([]);
      expect(DataTransformationService.transformSkillData).toHaveBeenCalled();
    });
  });

  describe('fetchAvailableClients', () => {
    it('should fetch and transform clients', async () => {
      const result = await DataFetcher.fetchAvailableClients();
      expect(result).toEqual([]);
      expect(DataTransformationService.transformClientData).toHaveBeenCalled();
    });
  });
});
