
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataFetcher } from '@/services/forecasting/demand/dataFetcher';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          in: vi.fn(() => ({
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

// Mock DataValidator
vi.mock('@/services/forecasting/demand/dataValidator', () => ({
  DataValidator: {
    validateRecurringTasks: vi.fn().mockReturnValue({
      validTasks: [],
      invalidTasks: []
    })
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
    });
  });
});
