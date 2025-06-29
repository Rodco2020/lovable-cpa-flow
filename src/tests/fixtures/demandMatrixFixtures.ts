
import { DemandMatrixData, DemandDataPoint, SkillSummaryItem, ClientRevenueData } from '@/types/demand';

export const createTestDemandDataPoint = (overrides: Partial<DemandDataPoint> = {}): DemandDataPoint => ({
  skillType: 'Tax Preparation',
  month: '2024-01',
  monthLabel: 'Jan 2024',
  demandHours: 40,
  totalHours: 40,
  taskCount: 5,
  clientCount: 2,
  taskBreakdown: [],
  suggestedRevenue: 3000,
  expectedLessSuggested: 0,
  ...overrides
});

export const createTestSkillSummaryItem = (overrides: Partial<SkillSummaryItem> = {}): SkillSummaryItem => ({
  demandHours: 40,
  totalHours: 40,
  taskCount: 5,
  clientCount: 2,
  revenue: 3000,
  hourlyRate: 75,
  suggestedRevenue: 3000,
  expectedLessSuggested: 0,
  totalSuggestedRevenue: 3000,
  totalExpectedLessSuggested: 0,
  averageFeeRate: 75,
  ...overrides
});

export const createTestDemandMatrixData = (overrides: Partial<DemandMatrixData> = {}): DemandMatrixData => ({
  months: [{ key: '2024-01', label: 'Jan 2024' }],
  skills: ['Tax Preparation'],
  dataPoints: [createTestDemandDataPoint()],
  totalDemand: 40,
  totalTasks: 5,
  totalClients: 2,
  skillSummary: {
    'Tax Preparation': createTestSkillSummaryItem()
  },
  clientTotals: new Map([['client-1', 40]]),
  clientRevenue: new Map([['client-1', 3000]]),
  clientHourlyRates: new Map([['client-1', 75]]),
  clientSuggestedRevenue: new Map([['client-1', 3000]]),
  clientExpectedLessSuggested: new Map([['client-1', 0]]),
  revenueTotals: {
    totalSuggestedRevenue: 3000,
    totalExpectedRevenue: 3000,
    totalExpectedLessSuggested: 0
  },
  aggregationStrategy: 'skill-based',
  skillFeeRates: new Map([['Tax Preparation', 75]]),
  ...overrides
});

export const createTestClientRevenueData = (overrides: Partial<ClientRevenueData> = {}): ClientRevenueData => ({
  expectedRevenue: 3000,
  suggestedRevenue: 3000,
  clientId: 'client-1',
  clientName: 'Test Client',
  expectedMonthlyRevenue: 3000,
  totalHours: 40,
  ...overrides
});
