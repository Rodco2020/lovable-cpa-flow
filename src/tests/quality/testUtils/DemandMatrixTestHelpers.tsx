
import { DemandMatrixData, SkillSummaryItem, DemandDataPoint } from '@/types/demand';

export const createMockSkillSummaryItem = (overrides: Partial<SkillSummaryItem> = {}): SkillSummaryItem => ({
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

export const createMockSkillSummary = (overrides: Partial<SkillSummaryItem> = {}): SkillSummaryItem => {
  return {
    totalHours: 100,
    demandHours: 80,
    taskCount: 5,
    clientCount: 2,
    ...overrides
  };
};

export const createMockDemandDataPoint = (overrides: Partial<DemandDataPoint> = {}): DemandDataPoint => ({
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

export const createMockDemandMatrixData = (overrides: Partial<DemandMatrixData> = {}): DemandMatrixData => ({
  months: [
    { key: '2024-01', label: 'Jan 2024' },
    { key: '2024-02', label: 'Feb 2024' }
  ],
  skills: ['Tax Preparation', 'Bookkeeping'],
  dataPoints: [
    createMockDemandDataPoint(),
    createMockDemandDataPoint({ skillType: 'Bookkeeping', month: '2024-02' })
  ],
  totalDemand: 80,
  totalTasks: 10,
  totalClients: 4,
  skillSummary: {
    'Tax Preparation': createMockSkillSummaryItem(),
    'Bookkeeping': createMockSkillSummaryItem()
  },
  clientTotals: new Map([
    ['client-1', 40],
    ['client-2', 40]
  ]),
  clientRevenue: new Map([
    ['client-1', 3000],
    ['client-2', 3000]
  ]),
  clientHourlyRates: new Map([
    ['client-1', 75],
    ['client-2', 75]
  ]),
  clientSuggestedRevenue: new Map([
    ['client-1', 3000],
    ['client-2', 3000]
  ]),
  clientExpectedLessSuggested: new Map([
    ['client-1', 0],
    ['client-2', 0]
  ]),
  revenueTotals: {
    totalSuggestedRevenue: 6000,
    totalExpectedRevenue: 6000,
    totalExpectedLessSuggested: 0
  },
  aggregationStrategy: 'skill-based',
  skillFeeRates: new Map([
    ['Tax Preparation', 75],
    ['Bookkeeping', 75]
  ]),
  ...overrides
});

export const createMockClientRevenueData = () => ({
  expectedRevenue: 3000,
  suggestedRevenue: 3000,
  clientId: 'client-1',
  clientName: 'Test Client',
  expectedMonthlyRevenue: 3000,
  totalHours: 40
});
