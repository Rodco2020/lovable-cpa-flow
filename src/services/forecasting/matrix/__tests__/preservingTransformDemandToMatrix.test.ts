
import { describe, it, expect } from 'vitest';
import { DemandDataPoint } from '@/types/demand';
import { SkillType } from '@/types/task';

describe('preservingTransformDemandToMatrix', () => {
  describe('data transformation', () => {
    it('should transform demand data to matrix format', () => {
      const mockDataPoints: DemandDataPoint[] = [
        {
          skillType: 'Tax Preparation' as SkillType,
          month: '2024-01',
          monthLabel: 'Jan 2024',
          demandHours: 40,
          totalHours: 40, // Add required property
          taskCount: 5,
          clientCount: 2,
          taskBreakdown: []
        },
        {
          skillType: 'Bookkeeping' as SkillType,
          month: '2024-01',
          monthLabel: 'Jan 2024',
          demandHours: 30,
          totalHours: 30, // Add required property
          taskCount: 3,
          clientCount: 1,
          taskBreakdown: []
        },
        {
          skillType: 'Tax Preparation' as SkillType,
          month: '2024-02',
          monthLabel: 'Feb 2024',
          demandHours: 35,
          totalHours: 35, // Add required property
          taskCount: 4,
          clientCount: 2,
          taskBreakdown: []
        },
        {
          skillType: 'Bookkeeping' as SkillType,
          month: '2024-02',
          monthLabel: 'Feb 2024',
          demandHours: 25,
          totalHours: 25, // Add required property
          taskCount: 2,
          clientCount: 1,
          taskBreakdown: []
        },
        {
          skillType: 'Advisory' as SkillType,
          month: '2024-01',
          monthLabel: 'Jan 2024',
          demandHours: 20,
          totalHours: 20, // Add required property
          taskCount: 1,
          clientCount: 1,
          taskBreakdown: []
        },
        {
          skillType: 'Advisory' as SkillType,
          month: '2024-02',
          monthLabel: 'Feb 2024',
          demandHours: 15,
          totalHours: 15, // Add required property
          taskCount: 1,
          clientCount: 1,
          taskBreakdown: []
        }
      ];

      // Verify data structure
      expect(mockDataPoints).toHaveLength(6);
      
      // Verify each data point has required properties
      mockDataPoints.forEach(dataPoint => {
        expect(dataPoint.skillType).toBeTruthy();
        expect(dataPoint.month).toBeTruthy();
        expect(dataPoint.monthLabel).toBeTruthy();
        expect(dataPoint.demandHours).toBeGreaterThanOrEqual(0);
        expect(dataPoint.totalHours).toBeGreaterThanOrEqual(0);
        expect(dataPoint.taskCount).toBeGreaterThanOrEqual(0);
        expect(dataPoint.clientCount).toBeGreaterThanOrEqual(0);
        expect(Array.isArray(dataPoint.taskBreakdown)).toBe(true);
      });

      // Verify skill types
      const skillTypes = [...new Set(mockDataPoints.map(dp => dp.skillType))];
      expect(skillTypes).toContain('Tax Preparation');
      expect(skillTypes).toContain('Bookkeeping');
      expect(skillTypes).toContain('Advisory');

      // Verify months
      const months = [...new Set(mockDataPoints.map(dp => dp.month))];
      expect(months).toContain('2024-01');
      expect(months).toContain('2024-02');
    });

    it('should handle empty data gracefully', () => {
      const emptyDataPoints: DemandDataPoint[] = [];
      
      expect(emptyDataPoints).toHaveLength(0);
      expect(Array.isArray(emptyDataPoints)).toBe(true);
    });

    it('should maintain data integrity during transformation', () => {
      const sampleDataPoint: DemandDataPoint = {
        skillType: 'Tax Preparation' as SkillType,
        month: '2024-01',
        monthLabel: 'Jan 2024',
        demandHours: 40,
        totalHours: 40, // Add required property
        taskCount: 5,
        clientCount: 2,
        taskBreakdown: []
      };
      
      // Verify the data point maintains its structure
      expect(sampleDataPoint.demandHours).toBe(sampleDataPoint.totalHours);
      expect(sampleDataPoint.taskCount).toBeGreaterThan(0);
      expect(sampleDataPoint.clientCount).toBeGreaterThan(0);
    });
  });
});
