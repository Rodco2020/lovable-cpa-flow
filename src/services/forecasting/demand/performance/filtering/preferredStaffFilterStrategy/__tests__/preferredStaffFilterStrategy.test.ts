
import { describe, it, expect } from 'vitest';
import { PreferredStaffFilterStrategy } from '../preferredStaffFilterStrategy';
import { DemandMatrixData } from '@/types/demand';

// Mock data for testing
const mockMatrixData: DemandMatrixData = {
  months: [
    { key: '2024-01', label: 'Jan 2024' },
    { key: '2024-02', label: 'Feb 2024' }
  ],
  skills: ['Tax Preparation', 'Bookkeeping'],
  dataPoints: [
    {
      skillType: 'Tax Preparation',
      month: '2024-01',
      monthLabel: 'Jan 2024',
      demandHours: 40,
      totalHours: 40,
      taskCount: 5,
      clientCount: 2,
      taskBreakdown: [
        {
          clientId: 'client-1',
          clientName: 'Test Client',
          recurringTaskId: 'task-1',
          taskName: 'Tax Task',
          skillType: 'Tax Preparation',
          estimatedHours: 10,
          recurrencePattern: { type: 'monthly', interval: 1, frequency: 1 },
          monthlyHours: 10,
          preferredStaffId: 'staff-1',
          preferredStaffName: 'John Doe'
        }
      ]
    }
  ],
  totalDemand: 40,
  totalTasks: 5,
  totalClients: 2,
  skillSummary: {
    'Tax Preparation': {
      totalHours: 40,
      demandHours: 40,
      taskCount: 5,
      clientCount: 2
    }
  },
  clientTotals: new Map([['client-1', 40]]),
  aggregationStrategy: 'skill-based'
};

describe('PreferredStaffFilterStrategy', () => {
  describe('shouldApply', () => {
    it('should return true when preferred staff filter is provided', () => {
      const result = PreferredStaffFilterStrategy.shouldApply(['staff-1', 'staff-2']);
      expect(result).toBe(true);
    });

    it('should return false when preferred staff filter is empty', () => {
      const result = PreferredStaffFilterStrategy.shouldApply([]);
      expect(result).toBe(false);
    });

    it('should return false when preferred staff filter is null', () => {
      const result = PreferredStaffFilterStrategy.shouldApply(null as any);
      expect(result).toBe(false);
    });
  });

  describe('apply', () => {
    it('should filter data points by preferred staff', () => {
      const result = PreferredStaffFilterStrategy.apply(mockMatrixData, ['staff-1']);
      
      expect(result.dataPoints).toHaveLength(1);
      expect(result.dataPoints[0].taskBreakdown[0].preferredStaffId).toBe('staff-1');
    });

    it('should return empty data points when no staff match', () => {
      const result = PreferredStaffFilterStrategy.apply(mockMatrixData, ['staff-999']);
      
      expect(result.dataPoints).toHaveLength(0);
    });

    it('should handle multiple preferred staff filters', () => {
      const result = PreferredStaffFilterStrategy.apply(mockMatrixData, ['staff-1', 'staff-2']);
      
      expect(result.dataPoints).toHaveLength(1);
    });

    it('should handle empty preferred staff array', () => {
      const result = PreferredStaffFilterStrategy.apply(mockMatrixData, []);
      
      expect(result.dataPoints).toHaveLength(1); // Should return all data when no filter
    });

    it('should filter tasks without preferred staff correctly', () => {
      const dataWithoutPreferredStaff = {
        ...mockMatrixData,
        dataPoints: [
          {
            ...mockMatrixData.dataPoints[0],
            taskBreakdown: [
              {
                ...mockMatrixData.dataPoints[0].taskBreakdown[0],
                preferredStaffId: null
              }
            ]
          }
        ]
      };

      const result = PreferredStaffFilterStrategy.apply(dataWithoutPreferredStaff, ['staff-1']);
      
      expect(result.dataPoints).toHaveLength(0);
    });
  });

  describe('Performance', () => {
    it('should handle large datasets efficiently', () => {
      // Create a large dataset
      const largeDataset = {
        ...mockMatrixData,
        dataPoints: Array.from({ length: 1000 }, (_, i) => ({
          ...mockMatrixData.dataPoints[0],
          skillType: `Skill ${i}`,
          taskBreakdown: [
            {
              ...mockMatrixData.dataPoints[0].taskBreakdown[0],
              preferredStaffId: `staff-${i % 10}` // Distribute across 10 staff
            }
          ]
        }))
      };

      const startTime = performance.now();
      const result = PreferredStaffFilterStrategy.apply(largeDataset, ['staff-1']);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
      expect(result.dataPoints.length).toBeGreaterThan(0);
    });
  });
});
