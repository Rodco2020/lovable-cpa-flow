
import { DemandMatrixData } from '@/types/demand';

/**
 * Test Data Factory
 * Creates consistent mock data for different test scenarios
 */

export interface MockTaskBreakdownOptions {
  clientId?: string;
  clientName?: string;
  recurringTaskId?: string;
  taskName?: string;
  skillType?: string;
  estimatedHours?: number;
  monthlyHours?: number;
  preferredStaff?: {
    staffId: string;
    staffName: string;
    roleTitle: string;
    assignmentType: string;
  };
}

export interface MockDataPointOptions {
  skillType?: string;
  month?: string;
  monthLabel?: string;
  demandHours?: number;
  taskCount?: number;
  clientCount?: number;
  taskBreakdown?: any[];
}

export interface MockMatrixDataOptions {
  months?: Array<{ key: string; label: string }>;
  skills?: string[];
  dataPoints?: any[];
  totalDemand?: number;
  totalTasks?: number;
  totalClients?: number;
  skillSummary?: Record<string, any>;
}

export const createMockTaskBreakdown = (overrides: MockTaskBreakdownOptions = {}) => ({
  clientId: 'client-1',
  clientName: 'ABC Corp',
  recurringTaskId: 'task-1',
  taskName: 'Monthly Tax Prep',
  skillType: 'Tax Preparation',
  estimatedHours: 20,
  monthlyHours: 20,
  recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 },
  ...overrides
});

export const createMockPreferredStaff = (overrides: Partial<MockTaskBreakdownOptions['preferredStaff']> = {}) => ({
  staffId: 'staff-1',
  staffName: 'Alice Johnson',
  roleTitle: 'Senior CPA',
  assignmentType: 'preferred',
  ...overrides
});

export const createMockDataPoint = (overrides: MockDataPointOptions = {}) => ({
  skillType: 'Tax Preparation',
  month: '2025-01',
  monthLabel: 'Jan 2025',
  demandHours: 40,
  taskCount: 2,
  clientCount: 1,
  taskBreakdown: [],
  ...overrides
});

export const createMockMatrixData = (overrides: MockMatrixDataOptions = {}): DemandMatrixData => ({
  months: [{ key: '2025-01', label: 'Jan 2025' }],
  skills: ['Tax Preparation'],
  dataPoints: [],
  totalDemand: 40,
  totalTasks: 2,
  totalClients: 1,
  skillSummary: {},
  ...overrides
});
