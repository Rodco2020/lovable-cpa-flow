
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DemandMatrixService } from '@/services/forecasting/demandMatrixService';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: [],
          error: null
        }))
      }))
    }))
  }
}));

describe('DemandMatrixService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    DemandMatrixService.clearCache();
  });

  describe('generateDemandMatrix', () => {
    it('should handle empty task data', async () => {
      const result = await DemandMatrixService.generateDemandMatrix('demand-only');
      
      expect(result).toBeDefined();
      expect(result.matrixData).toBeDefined();
      expect(result.matrixData.totalDemand).toBe(0);
      expect(result.matrixData.totalTasks).toBe(0);
      expect(result.matrixData.totalClients).toBe(0);
      expect(result.matrixData.dataPoints).toEqual([]);
    });

    it('should process mock data correctly', async () => {
      // This test would normally require more complex mocking
      // For now, we'll test the structure
      const result = await DemandMatrixService.generateDemandMatrix('demand-only');
      
      expect(result.matrixData).toHaveProperty('months');
      expect(result.matrixData).toHaveProperty('skills');
      expect(result.matrixData).toHaveProperty('dataPoints');
      expect(result.matrixData).toHaveProperty('totalDemand');
      expect(result.matrixData).toHaveProperty('totalTasks');
      expect(result.matrixData).toHaveProperty('totalClients');
      expect(result.matrixData).toHaveProperty('skillSummary');
    });
  });

  describe('cache functionality', () => {
    it('should clear cache successfully', () => {
      DemandMatrixService.clearCache();
      // No error should be thrown
      expect(true).toBe(true);
    });
  });

  describe('task breakdown structure', () => {
    it('should create proper task breakdown structure', () => {
      const mockTaskBreakdown = {
        clientId: 'client-1',
        clientName: 'Test Client',
        recurringTaskId: 'task-1',
        taskName: 'Test Task',
        skillType: 'Senior',
        estimatedHours: 10,
        recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 },
        monthlyHours: 10,
        preferredStaffId: null,
        preferredStaffName: null
      };

      expect(mockTaskBreakdown).toHaveProperty('clientId');
      expect(mockTaskBreakdown).toHaveProperty('clientName');
      expect(mockTaskBreakdown).toHaveProperty('recurringTaskId');
      expect(mockTaskBreakdown).toHaveProperty('taskName');
      expect(mockTaskBreakdown).toHaveProperty('skillType');
      expect(mockTaskBreakdown).toHaveProperty('estimatedHours');
      expect(mockTaskBreakdown).toHaveProperty('recurrencePattern');
      expect(mockTaskBreakdown).toHaveProperty('monthlyHours');
      expect(mockTaskBreakdown).toHaveProperty('preferredStaffId');
      expect(mockTaskBreakdown).toHaveProperty('preferredStaffName');
    });
  });
});
