import { describe, it, expect, beforeEach } from 'vitest';
import { DetailTaskRevenueCalculator, Task, ClientRevenueData } from '../detailTaskRevenueCalculator';

describe('DetailTaskRevenueCalculator', () => {
  let mockTask: Task;
  let mockClients: Array<{ id: string; legal_name: string; expected_monthly_revenue: number }>;
  let mockTasks: Task[];

  beforeEach(() => {
    mockTask = {
      id: 'task-1',
      taskName: 'Tax Preparation',
      clientName: 'ABC Corp',
      clientId: 'client-1',
      skillRequired: 'CPA',
      monthlyHours: 10,
      month: '2024-01',
      monthLabel: 'January 2024',
      recurrencePattern: 'Monthly',
      priority: 'High',
      category: 'Tax',
      totalHours: 10
    };

    mockClients = [
      { id: 'client-1', legal_name: 'ABC Corp', expected_monthly_revenue: 5000 },
      { id: 'client-2', legal_name: 'XYZ Inc', expected_monthly_revenue: 8000 }
    ];

    mockTasks = [
      mockTask,
      {
        id: 'task-2',
        taskName: 'Audit Review',
        clientName: 'ABC Corp',
        clientId: 'client-1',
        skillRequired: 'Senior',
        monthlyHours: 15,
        month: '2024-01',
        monthLabel: 'January 2024',
        recurrencePattern: 'Monthly',
        priority: 'Medium',
        category: 'Audit',
        totalHours: 15
      }
    ];
  });

  describe('calculateTaskRevenue', () => {
    it('should calculate task revenue correctly using apportionment method', () => {
      const clientTotalHours = 25; // 10 + 15 hours for ABC Corp
      const clientExpectedRevenue = 5000;
      const skillFeeRate = 250; // CPA rate

      const result = DetailTaskRevenueCalculator.calculateTaskRevenue(
        mockTask,
        clientTotalHours,
        clientExpectedRevenue,
        skillFeeRate
      );

      // Task gets 10/25 = 40% of client revenue
      const expectedRevenue = (10 / 25) * 5000; // $2000
      const suggestedRevenue = 10 * 250; // $2500
      const difference = expectedRevenue - suggestedRevenue; // -$500

      expect(result.totalHours).toBe(10);
      expect(result.totalExpectedRevenue).toBe(expectedRevenue);
      expect(result.expectedHourlyRate).toBe(expectedRevenue / 10);
      expect(result.totalSuggestedRevenue).toBe(suggestedRevenue);
      expect(result.expectedLessSuggested).toBe(difference);
      expect(result.skillFeeRate).toBe(skillFeeRate);
      expect(result.apportionmentPercentage).toBe(0.4);
    });

    it('should handle zero client total hours gracefully', () => {
      const result = DetailTaskRevenueCalculator.calculateTaskRevenue(
        mockTask,
        0, // Zero total hours
        5000,
        250
      );

      expect(result.totalHours).toBe(10);
      expect(result.totalExpectedRevenue).toBe(0);
      expect(result.expectedHourlyRate).toBe(0);
      expect(result.totalSuggestedRevenue).toBe(0);
      expect(result.expectedLessSuggested).toBe(0);
    });

    it('should throw error for invalid task', () => {
      expect(() => {
        DetailTaskRevenueCalculator.calculateTaskRevenue(
          null as any,
          25,
          5000,
          250
        );
      }).toThrow('Invalid task or missing monthlyHours');
    });
  });

  describe('buildClientRevenueData', () => {
    it('should build client revenue data correctly', () => {
      const monthCount = 3;
      const clientRevenueData = DetailTaskRevenueCalculator.buildClientRevenueData(
        mockClients,
        mockTasks,
        monthCount
      );

      const abcData = clientRevenueData.get('ABC Corp');
      expect(abcData).toBeDefined();
      expect(abcData!.clientName).toBe('ABC Corp');
      expect(abcData!.clientId).toBe('client-1');
      expect(abcData!.totalHours).toBe(25); // 10 + 15 hours
      expect(abcData!.expectedMonthlyRevenue).toBe(5000);
      expect(abcData!.totalExpectedRevenue).toBe(15000); // 5000 * 3 months

      const xyzData = clientRevenueData.get('XYZ Inc');
      expect(xyzData).toBeDefined();
      expect(xyzData!.totalHours).toBe(0); // No tasks for XYZ Inc
      expect(xyzData!.totalExpectedRevenue).toBe(24000); // 8000 * 3 months
    });

    it('should handle clients with zero expected revenue', () => {
      const clientsWithZeroRevenue = [
        { id: 'client-1', legal_name: 'ABC Corp', expected_monthly_revenue: 0 }
      ];

      const clientRevenueData = DetailTaskRevenueCalculator.buildClientRevenueData(
        clientsWithZeroRevenue,
        mockTasks,
        1
      );

      const abcData = clientRevenueData.get('ABC Corp');
      expect(abcData!.totalExpectedRevenue).toBe(0);
    });
  });

  describe('calculateBulkTaskRevenue', () => {
    it('should calculate revenue for multiple tasks', async () => {
      const clientRevenueData = new Map<string, ClientRevenueData>();
      clientRevenueData.set('ABC Corp', {
        clientName: 'ABC Corp',
        clientId: 'client-1',
        totalHours: 25,
        expectedMonthlyRevenue: 5000,
        totalExpectedRevenue: 5000
      });

      const skillFeeRates = new Map([
        ['CPA', 250],
        ['Senior', 150]
      ]);

      const results = await DetailTaskRevenueCalculator.calculateBulkTaskRevenue(
        mockTasks,
        clientRevenueData,
        skillFeeRates
      );

      expect(results.size).toBe(2);
      
      const task1Result = results.get('task-1');
      expect(task1Result).toBeDefined();
      expect(task1Result!.totalHours).toBe(10);
      expect(task1Result!.skillFeeRate).toBe(250);

      const task2Result = results.get('task-2');
      expect(task2Result).toBeDefined();
      expect(task2Result!.totalHours).toBe(15);
      expect(task2Result!.skillFeeRate).toBe(150);
    });

    it('should handle missing client data gracefully', async () => {
      const emptyClientData = new Map<string, ClientRevenueData>();
      const skillFeeRates = new Map([['CPA', 250]]);

      const results = await DetailTaskRevenueCalculator.calculateBulkTaskRevenue(
        [mockTask],
        emptyClientData,
        skillFeeRates
      );

      expect(results.size).toBe(1);
      const result = results.get('task-1');
      expect(result!.totalExpectedRevenue).toBe(0);
      expect(result!.totalSuggestedRevenue).toBe(0);
    });
  });

  describe('generateRevenueSummary', () => {
    it('should generate correct summary statistics', () => {
      const mockResults = new Map([
        ['task-1', {
          totalHours: 10,
          totalExpectedRevenue: 2000,
          expectedHourlyRate: 200,
          totalSuggestedRevenue: 2500,
          expectedLessSuggested: -500,
          skillFeeRate: 250,
          apportionmentPercentage: 0.4
        }],
        ['task-2', {
          totalHours: 15,
          totalExpectedRevenue: 3000,
          expectedHourlyRate: 200,
          totalSuggestedRevenue: 2250,
          expectedLessSuggested: 750,
          skillFeeRate: 150,
          apportionmentPercentage: 0.6
        }]
      ]);

      const summary = DetailTaskRevenueCalculator.generateRevenueSummary(mockResults);

      expect(summary.totalTasks).toBe(2);
      expect(summary.totalHours).toBe(25);
      expect(summary.totalExpectedRevenue).toBe(5000);
      expect(summary.totalSuggestedRevenue).toBe(4750);
      expect(summary.totalExpectedLessSuggested).toBe(250);
      expect(summary.averageExpectedHourlyRate).toBe(200);
      expect(summary.profitableTasks).toBe(1); // task-2 is profitable
      expect(summary.unprofitableTasks).toBe(1); // task-1 is unprofitable
    });

    it('should handle empty results', () => {
      const summary = DetailTaskRevenueCalculator.generateRevenueSummary(new Map());

      expect(summary.totalTasks).toBe(0);
      expect(summary.totalHours).toBe(0);
      expect(summary.totalExpectedRevenue).toBe(0);
      expect(summary.averageExpectedHourlyRate).toBe(0);
    });
  });
});