import { describe, it, expect } from 'vitest';
import { ClientTotalsCalculator } from '@/services/forecasting/demand/calculators/clientTotalsCalculator';
import { DemandDataPoint } from '@/types/demand';

describe('ClientTotalsCalculator', () => {
  const mockDataPoints: DemandDataPoint[] = [
    {
      skillType: 'Tax Preparation',
      month: '2024-01',
      monthLabel: 'January 2024',
      demandHours: 40,
      totalHours: 40, // Add required totalHours property
      taskCount: 2,
      clientCount: 1,
      taskBreakdown: [
        {
          clientId: 'client-1',
          clientName: 'Client A',
          recurringTaskId: 'task-1',
          taskName: 'Tax Filing',
          skillType: 'Tax Preparation',
          estimatedHours: 20,
          monthlyHours: 20,
          preferredStaffId: null,
          preferredStaffName: null,
          recurrencePattern: {
            type: 'Monthly',
            interval: 1,
            frequency: 1
          }
        }
      ]
    },
    {
      skillType: 'Bookkeeping',
      month: '2024-01',
      monthLabel: 'January 2024',
      demandHours: 30,
      totalHours: 30, // Add required totalHours property
      taskCount: 1,
      clientCount: 1,
      taskBreakdown: [
        {
          clientId: 'client-2',
          clientName: 'Client B',
          recurringTaskId: 'task-2',
          taskName: 'Monthly Bookkeeping',
          skillType: 'Bookkeeping',
          estimatedHours: 30,
          monthlyHours: 30,
          preferredStaffId: null,
          preferredStaffName: null,
          recurrencePattern: {
            type: 'Monthly',
            interval: 1,
            frequency: 1
          }
        }
      ]
    }
  ];

  it('should calculate client totals correctly', () => {
    const clientTotals = ClientTotalsCalculator.calculateClientTotals(mockDataPoints);

    expect(clientTotals.size).toBe(2);
    expect(clientTotals.get('client-1')).toBe(40);
    expect(clientTotals.get('client-2')).toBe(30);
  });

  it('should handle empty data points array', () => {
    const clientTotals = ClientTotalsCalculator.calculateClientTotals([]);

    expect(clientTotals.size).toBe(0);
  });

  it('should handle data points with zero demand hours', () => {
    const zeroDemandDataPoints: DemandDataPoint[] = [
      {
        skillType: 'Tax Preparation',
        month: '2024-01',
        monthLabel: 'January 2024',
        demandHours: 0,
        totalHours: 0, // Add required totalHours property
        taskCount: 0,
        clientCount: 0,
        taskBreakdown: [
          {
            clientId: 'client-1',
            clientName: 'Client A',
            recurringTaskId: 'task-1',
            taskName: 'Tax Filing',
            skillType: 'Tax Preparation',
            estimatedHours: 0,
            monthlyHours: 0,
            preferredStaffId: null,
            preferredStaffName: null,
            recurrencePattern: {
              type: 'Monthly',
              interval: 1,
              frequency: 1
            }
          }
        ]
      }
    ];

    const clientTotals = ClientTotalsCalculator.calculateClientTotals(zeroDemandDataPoints);

    expect(clientTotals.size).toBe(1);
    expect(clientTotals.get('client-1')).toBe(0);
  });
});
