
import { describe, it, expect } from 'vitest';
import { ClientTotalsCalculator } from '@/services/forecasting/demand/matrixTransformer/clientTotalsCalculator';
import { DemandDataPoint } from '@/types/demand';

describe('ClientTotalsCalculator', () => {
  const mockDataPoints: DemandDataPoint[] = [
    {
      skillType: 'Junior',
      month: '2025-01',
      demandHours: 20,
      taskCount: 2,
      clientCount: 1,
      taskBreakdown: [
        {
          clientId: 'client-1',
          clientName: 'ABC Corp',
          recurringTaskId: 'task-1',
          taskName: 'Monthly Bookkeeping',
          skillType: 'Junior',
          estimatedHours: 10,
          recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 },
          monthlyHours: 10
        },
        {
          clientId: 'client-2',
          clientName: 'XYZ Ltd',
          recurringTaskId: 'task-2',
          taskName: 'Tax Prep',
          skillType: 'Junior',
          estimatedHours: 10,
          recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 },
          monthlyHours: 10
        }
      ]
    },
    {
      skillType: 'Senior',
      month: '2025-01',
      demandHours: 15,
      taskCount: 1,
      clientCount: 1,
      taskBreakdown: [
        {
          clientId: 'client-1',
          clientName: 'ABC Corp',
          recurringTaskId: 'task-3',
          taskName: 'Financial Review',
          skillType: 'Senior',
          estimatedHours: 15,
          recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 },
          monthlyHours: 15
        }
      ]
    }
  ];

  describe('calculateClientTotals', () => {
    it('should calculate correct totals for each client', () => {
      const clientTotals = ClientTotalsCalculator.calculateClientTotals(mockDataPoints);
      
      expect(clientTotals.get('ABC Corp')).toBe(25); // 10 + 15
      expect(clientTotals.get('XYZ Ltd')).toBe(10);
      expect(clientTotals.size).toBe(2);
    });

    it('should handle empty data points', () => {
      const clientTotals = ClientTotalsCalculator.calculateClientTotals([]);
      
      expect(clientTotals.size).toBe(0);
    });
  });

  describe('getSortedClientsByTotal', () => {
    it('should sort clients by total hours descending', () => {
      const clientTotals = new Map([
        ['ABC Corp', 25],
        ['XYZ Ltd', 10],
        ['DEF Inc', 50]
      ]);
      
      const sorted = ClientTotalsCalculator.getSortedClientsByTotal(clientTotals);
      
      expect(sorted).toEqual([
        { name: 'DEF Inc', total: 50 },
        { name: 'ABC Corp', total: 25 },
        { name: 'XYZ Ltd', total: 10 }
      ]);
    });
  });

  describe('calculateGrandTotal', () => {
    it('should calculate grand total correctly', () => {
      const clientTotals = new Map([
        ['ABC Corp', 25],
        ['XYZ Ltd', 10],
        ['DEF Inc', 50]
      ]);
      
      const grandTotal = ClientTotalsCalculator.calculateGrandTotal(clientTotals);
      
      expect(grandTotal).toBe(85);
    });

    it('should return 0 for empty map', () => {
      const grandTotal = ClientTotalsCalculator.calculateGrandTotal(new Map());
      
      expect(grandTotal).toBe(0);
    });
  });
});
