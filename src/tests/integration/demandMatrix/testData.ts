
/**
 * Test Data for Demand Matrix Integration Tests
 * Centralized mock data and test scenarios
 */

export const mockDemandData = {
  months: Array.from({ length: 12 }, (_, i) => ({
    key: `2025-${(i + 1).toString().padStart(2, '0')}`,
    label: `Month ${i + 1}`
  })),
  skills: ['Tax Preparation', 'Audit', 'Advisory'],
  dataPoints: [
    {
      skillType: 'Tax Preparation',
      month: '2025-01',
      monthLabel: 'January 2025',
      demandHours: 120,
      taskCount: 8,
      clientCount: 3,
      taskBreakdown: [
        {
          clientId: 'client-1',
          clientName: 'Test Client 1',
          recurringTaskId: 'task-1',
          taskName: 'Monthly Tax Review',
          skillType: 'Tax Preparation',
          estimatedHours: 15,
          monthlyHours: 15,
          recurrencePattern: { type: 'Monthly', frequency: 1 }
        }
      ]
    }
  ],
  totalDemand: 120,
  totalTasks: 8,
  totalClients: 3,
  skillSummary: {}
};

export const createLargeMockData = () => ({
  ...mockDemandData,
  dataPoints: Array.from({ length: 1000 }, (_, i) => ({
    skillType: `Skill ${i % 10}`,
    month: `2025-${((i % 12) + 1).toString().padStart(2, '0')}`,
    monthLabel: `Month ${(i % 12) + 1}`,
    demandHours: Math.random() * 100,
    taskCount: Math.floor(Math.random() * 10) + 1,
    clientCount: Math.floor(Math.random() * 5) + 1,
    taskBreakdown: []
  }))
});

export const createEmptyMockData = () => ({
  months: [],
  skills: [],
  dataPoints: [],
  totalDemand: 0,
  totalTasks: 0,
  totalClients: 0,
  skillSummary: {}
});
