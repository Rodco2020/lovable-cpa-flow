
import { describe, it, expect } from 'vitest';
import { PreferredStaffFilterStrategy } from '../preferredStaffFilterStrategy';
import { DemandMatrixData, DemandDataPoint, SkillSummaryItem, MonthInfo } from '@/types/demand';

describe('PreferredStaffFilterStrategy', () => {
  const mockDataPoint: DemandDataPoint = {
    month: '2024-01',
    monthLabel: 'Jan 2024',
    skillType: 'Tax Preparation',
    demandHours: 40,
    totalHours: 40, // Add required property
    taskCount: 5,
    clientCount: 2,
    taskBreakdown: [
      {
        recurringTaskId: 'task-1',
        taskName: 'Tax Filing',
        clientId: 'client-1',
        clientName: 'Client A',
        skillType: 'Tax Preparation',
        estimatedHours: 8,
        monthlyHours: 8,
        preferredStaffId: 'staff-1',
        preferredStaffName: 'John Doe',
        recurrencePattern: {
          type: 'Monthly',
          interval: 1,
          frequency: 1
        }
      }
    ]
  };

  const mockMonths: MonthInfo[] = [
    { key: '2024-01', label: 'Jan 2024' }
  ];

  const mockSkillSummary: Record<string, SkillSummaryItem> = {
    'Tax Preparation': {
      demandHours: 40, // Add required property
      totalHours: 40,
      taskCount: 5,
      clientCount: 2
    }
  };

  const mockDemandData: DemandMatrixData = {
    months: mockMonths,
    skills: ['Tax Preparation'],
    dataPoints: [mockDataPoint],
    totalDemand: 40,
    totalTasks: 5,
    totalClients: 2,
    skillSummary: mockSkillSummary,
    clientTotals: new Map([['client-1', 40]]),
    aggregationStrategy: 'skill-based'
  };

  describe('shouldApply', () => {
    it('should return true when preferred staff filter is provided', () => {
      const strategy = new PreferredStaffFilterStrategy();
      const result = strategy.shouldApply({ preferredStaff: ['staff-1'] });
      expect(result).toBe(true);
    });

    it('should return false when no preferred staff filter is provided', () => {
      const strategy = new PreferredStaffFilterStrategy();
      const result = strategy.shouldApply({ preferredStaff: [] });
      expect(result).toBe(false);
    });

    it('should return false when preferred staff filter is null', () => {
      const strategy = new PreferredStaffFilterStrategy();
      const result = strategy.shouldApply({ preferredStaff: null });
      expect(result).toBe(false);
    });
  });

  describe('apply', () => {
    it('should filter data points by preferred staff', () => {
      const strategy = new PreferredStaffFilterStrategy();
      const result = strategy.apply(mockDemandData, { preferredStaff: ['staff-1'] });
      
      expect(result.dataPoints).toHaveLength(1);
      expect(result.dataPoints[0].taskBreakdown).toHaveLength(1);
      expect(result.dataPoints[0].taskBreakdown[0].preferredStaffId).toBe('staff-1');
    });

    it('should return empty result when no matching staff found', () => {
      const strategy = new PreferredStaffFilterStrategy();
      const result = strategy.apply(mockDemandData, { preferredStaff: ['staff-999'] });
      
      expect(result.dataPoints).toHaveLength(0);
      expect(result.totalDemand).toBe(0);
      expect(result.totalTasks).toBe(0);
    });

    it('should handle multiple preferred staff IDs', () => {
      const strategy = new PreferredStaffFilterStrategy();
      const result = strategy.apply(mockDemandData, { preferredStaff: ['staff-1', 'staff-2'] });
      
      expect(result.dataPoints).toHaveLength(1);
      expect(result.dataPoints[0].taskBreakdown[0].preferredStaffId).toBe('staff-1');
    });

    it('should preserve data structure when applying filter', () => {
      const strategy = new PreferredStaffFilterStrategy();
      const result = strategy.apply(mockDemandData, { preferredStaff: ['staff-1'] });
      
      expect(result.months).toEqual(mockDemandData.months);
      expect(result.skills).toEqual(mockDemandData.skills);
      expect(result.aggregationStrategy).toBe('skill-based');
    });
  });

  describe('integration with matrix data', () => {
    it('should handle complex matrix data with multiple data points', () => {
      const complexData: DemandMatrixData = {
        dataPoints: [
          {
            month: '2024-01',
            monthLabel: 'Jan 2024',
            skillType: 'Tax Preparation',
            demandHours: 40,
            totalHours: 40, // Add required property
            taskCount: 2,
            clientCount: 1,
            taskBreakdown: [] // Empty taskBreakdown for this test
          },
          {
            month: '2024-02',
            monthLabel: 'Feb 2024',
            skillType: 'Bookkeeping',
            demandHours: 30,
            totalHours: 30, // Add required property
            taskCount: 3,
            clientCount: 2,
            taskBreakdown: [] // Empty taskBreakdown for this test
          }
        ],
        months: [
          { key: '2024-01', label: 'Jan 2024' },
          { key: '2024-02', label: 'Feb 2024' }
        ],
        skills: ['Tax Preparation', 'Bookkeeping'],
        totalDemand: 70,
        totalTasks: 5,
        totalClients: 3,
        skillSummary: {
          'Tax Preparation': {
            demandHours: 40,
            totalHours: 40,
            taskCount: 2,
            clientCount: 1
          },
          'Bookkeeping': {
            demandHours: 30,
            totalHours: 30,
            taskCount: 3,
            clientCount: 2
          }
        },
        clientTotals: new Map([
          ['client-1', 40],
          ['client-2', 30]
        ]),
        aggregationStrategy: 'skill-based'
      };

      const strategy = new PreferredStaffFilterStrategy();
      const result = strategy.apply(complexData, { preferredStaff: ['staff-1'] });
      
      expect(result).toBeDefined();
      expect(result.dataPoints).toBeDefined();
      expect(result.months).toEqual(complexData.months);
      expect(result.skills).toEqual(complexData.skills);
    });
  });
});
