
/**
 * Revenue Calculator Tests
 */

import { RevenueCalculator } from '@/services/revenue/calculator';
import { RevenueConfig, ClientData, TaskData } from '@/services/revenue/types';

describe('RevenueCalculator', () => {
  let calculator: RevenueCalculator;
  const config: RevenueConfig = {
    defaultHourlyRate: 150,
    defaultProfitMargin: 0.3,
    cacheTTL: 600000
  };

  beforeEach(() => {
    calculator = new RevenueCalculator(config);
  });

  const mockClient: ClientData = {
    id: 'client-1',
    legal_name: 'Test Client',
    expected_monthly_revenue: 10000
  };

  const mockTasks: TaskData[] = [
    {
      id: 'task-1',
      name: 'Test Task',
      estimated_hours: 10,
      required_skills: ['accounting'],
      status: 'Active'
    }
  ];

  const mockSkillRates = new Map([
    ['accounting', 200]
  ]);

  it('should calculate client revenue correctly', () => {
    const result = calculator.calculateClientRevenue(
      mockClient,
      mockTasks,
      [],
      mockSkillRates
    );

    expect(result.clientId).toBe('client-1');
    expect(result.expectedMonthlyRevenue).toBe(10000);
    expect(result.projectedAnnualRevenue).toBe(120000);
    expect(result.taskBasedRevenue).toBe(2000); // 10 hours * 200 rate
    expect(result.averageHourlyRate).toBe(200);
  });

  it('should calculate task breakdown correctly', () => {
    const breakdown = calculator.calculateTaskBreakdown(mockTasks, mockSkillRates);

    expect(breakdown).toHaveLength(1);
    expect(breakdown[0].taskId).toBe('task-1');
    expect(breakdown[0].estimatedRevenue).toBe(2000);
    expect(breakdown[0].hourlyRate).toBe(200);
  });

  it('should calculate projections correctly', () => {
    const clients = [mockClient];
    const projection = calculator.calculateProjections(clients, 12);

    expect(projection.projectedRevenue).toBe(120000);
    expect(projection.confidenceLevel).toBe(100);
  });
});
