
import React from 'react';
import { DemandMatrixData } from '@/types/demand';

/**
 * Test helpers for DemandMatrixGrid testing
 */

/**
 * Create mock demand matrix data for testing
 */
export const createMockDemandMatrixData = (): DemandMatrixData => ({
  skills: ['Junior', 'Senior', 'CPA'],
  months: [
    { key: '2024-01', label: 'Jan 2024' },
    { key: '2024-02', label: 'Feb 2024' },
    { key: '2024-03', label: 'Mar 2024' }
  ],
  dataPoints: [
    {
      skillType: 'Junior',
      month: '2024-01',
      monthLabel: 'Jan 2024',
      demandHours: 40,
      taskCount: 5,
      clientCount: 2,
      taskBreakdown: [
        { 
          clientId: 'client-a',
          clientName: 'Client A', 
          recurringTaskId: 'task-1',
          taskName: 'Monthly Bookkeeping',
          skillType: 'Junior',
          estimatedHours: 15,
          recurrencePattern: { type: 'monthly', interval: 1, frequency: 1 },
          monthlyHours: 25
        },
        { 
          clientId: 'client-b',
          clientName: 'Client B', 
          recurringTaskId: 'task-2',
          taskName: 'Data Entry',
          skillType: 'Junior',
          estimatedHours: 10,
          recurrencePattern: { type: 'monthly', interval: 1, frequency: 1 },
          monthlyHours: 15
        }
      ]
    },
    {
      skillType: 'Senior',
      month: '2024-01',
      monthLabel: 'Jan 2024',
      demandHours: 60,
      taskCount: 3,
      clientCount: 2,
      taskBreakdown: [
        { 
          clientId: 'client-a',
          clientName: 'Client A', 
          recurringTaskId: 'task-3',
          taskName: 'Tax Preparation',
          skillType: 'Senior',
          estimatedHours: 20,
          recurrencePattern: { type: 'monthly', interval: 1, frequency: 1 },
          monthlyHours: 35
        },
        { 
          clientId: 'client-c',
          clientName: 'Client C', 
          recurringTaskId: 'task-4',
          taskName: 'Financial Review',
          skillType: 'Senior',
          estimatedHours: 15,
          recurrencePattern: { type: 'monthly', interval: 1, frequency: 1 },
          monthlyHours: 25
        }
      ]
    }
  ],
  totalDemand: 100,
  totalTasks: 8,
  totalClients: 3,
  skillSummary: {
    'Junior': {
      totalHours: 40,
      taskCount: 5,
      clientCount: 2
    },
    'Senior': {
      totalHours: 60,
      taskCount: 3,
      clientCount: 2
    }
  },
  clientTotals: new Map([
    ['Client A', 120],
    ['Client B', 80],
    ['Client C', 50]
  ]),
  clientRevenue: new Map([
    ['Client A', 12000],
    ['Client B', 8000],
    ['Client C', 5000]
  ]),
  clientHourlyRates: new Map([
    ['Client A', 100],
    ['Client B', 100],
    ['Client C', 100]
  ]),
  clientSuggestedRevenue: new Map([
    ['Client A', 11000],
    ['Client B', 7500],
    ['Client C', 4800]
  ]),
  clientExpectedLessSuggested: new Map([
    ['Client A', 1000],
    ['Client B', 500],
    ['Client C', 200]
  ])
});

/**
 * Mock props for DemandMatrixGrid component
 */
export const createMockDemandMatrixGridProps = (overrides = {}) => ({
  filteredData: createMockDemandMatrixData(),
  groupingMode: 'skill' as const,
  ...overrides
});

/**
 * Test wrapper for components that need specific context
 */
export const DemandMatrixTestWrapper: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  return (
    <div className="test-wrapper">
      {children}
    </div>
  );
};
