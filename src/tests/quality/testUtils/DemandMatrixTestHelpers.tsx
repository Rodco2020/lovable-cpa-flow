
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
      demandHours: 40,
      taskCount: 5,
      clientCount: 2,
      taskBreakdown: [
        { clientName: 'Client A', monthlyHours: 25, taskCount: 3 },
        { clientName: 'Client B', monthlyHours: 15, taskCount: 2 }
      ]
    },
    {
      skillType: 'Senior',
      month: '2024-01',
      demandHours: 60,
      taskCount: 3,
      clientCount: 2,
      taskBreakdown: [
        { clientName: 'Client A', monthlyHours: 35, taskCount: 2 },
        { clientName: 'Client C', monthlyHours: 25, taskCount: 1 }
      ]
    }
  ],
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
