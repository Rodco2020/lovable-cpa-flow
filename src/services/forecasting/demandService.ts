
import { DemandMatrixData, DemandMatrixMode } from '@/types/demand';

/**
 * Demand Service
 * 
 * Service for fetching and managing demand matrix data
 */

// Mock data for now - this would typically come from an API
const mockDemandData: DemandMatrixData = {
  dataPoints: [
    {
      skillType: 'Tax Preparation',
      month: '2025-01',
      monthLabel: 'Jan 2025',
      demandHours: 120,
      taskCount: 8,
      clientCount: 3,
      taskBreakdown: [
        {
          clientId: 'client-1',
          clientName: 'Client 1',
          recurringTaskId: 'task-1',
          taskName: 'Monthly Tax Review',
          skillType: 'Tax Preparation',
          estimatedHours: 15,
          recurrencePattern: {
            type: 'monthly',
            interval: 1,
            frequency: 12
          },
          monthlyHours: 60,
          preferredStaff: {
            staffId: 'staff-1',
            staffName: 'John Smith',
            assignmentType: 'preferred'
          }
        }
      ]
    },
    {
      skillType: 'Advisory',
      month: '2025-01',
      monthLabel: 'Jan 2025',
      demandHours: 80,
      taskCount: 5,
      clientCount: 2,
      taskBreakdown: []
    }
  ],
  skills: ['Tax Preparation', 'Advisory', 'Audit'],
  months: Array.from({ length: 12 }, (_, i) => ({
    key: `2025-${(i + 1).toString().padStart(2, '0')}`,
    label: new Date(2025, i).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  })),
  totalDemand: 200,
  totalTasks: 13,
  totalClients: 5,
  skillSummary: {
    'Tax Preparation': {
      totalHours: 120,
      taskCount: 8,
      clientCount: 3
    },
    'Advisory': {
      totalHours: 80,
      taskCount: 5,
      clientCount: 2
    }
  }
};

export const getDemandMatrixData = async (groupingMode: 'skill' | 'client'): Promise<DemandMatrixData> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  console.log(`🔍 [DEMAND SERVICE] Fetching demand matrix data for grouping mode: ${groupingMode}`);
  
  return mockDemandData;
};

export const getDemandDataByMode = async (mode: DemandMatrixMode): Promise<DemandMatrixData> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  console.log(`🔍 [DEMAND SERVICE] Fetching demand data for mode: ${mode}`);
  
  return mockDemandData;
};
