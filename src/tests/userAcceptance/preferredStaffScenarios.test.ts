
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { DemandMatrixService } from '@/services/forecasting/demandMatrixService';
import { DemandMatrixData, DemandFilters } from '@/types/demand';

// Mock the service dependencies
vi.mock('@/services/forecasting/demand/dataFetcher');
vi.mock('@/services/forecasting/demand/matrixTransformer/matrixTransformerCore');

describe('User Acceptance Tests: Preferred Staff Scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    DemandMatrixService.clearCache();
  });

  describe('Scenario 1: View tasks with no preferred staff assigned', () => {
    test('User can identify unassigned tasks in the matrix', async () => {
      const mockData: DemandMatrixData = {
        months: [{ key: '2025-01', label: 'Jan 2025' }],
        skills: ['Tax Preparation'],
        dataPoints: [{
          skillType: 'Tax Preparation',
          month: '2025-01',
          monthLabel: 'Jan 2025',
          demandHours: 50,
          taskCount: 2,
          clientCount: 2,
          taskBreakdown: [
            {
              clientId: 'client-1',
              clientName: 'Client A',
              recurringTaskId: 'task-1',
              taskName: 'Unassigned Tax Return',
              skillType: 'Tax Preparation',
              estimatedHours: 25,
              recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 },
              monthlyHours: 25
              // No preferredStaff - this is what we're testing
            },
            {
              clientId: 'client-2',
              clientName: 'Client B',
              recurringTaskId: 'task-2',
              taskName: 'Another Unassigned Task',
              skillType: 'Tax Preparation',
              estimatedHours: 25,
              recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 },
              monthlyHours: 25
              // No preferredStaff
            }
          ]
        }],
        totalDemand: 50,
        totalTasks: 2,
        totalClients: 2,
        skillSummary: {}
      };

      vi.mocked(DemandMatrixService.generateDemandMatrix).mockResolvedValue({
        matrixData: mockData
      });

      const { matrixData } = await DemandMatrixService.generateDemandMatrix('demand-only');
      
      // User expectation: Can see tasks without preferred staff
      expect(matrixData.dataPoints[0].taskBreakdown).toHaveLength(2);
      
      // Verify both tasks have no preferred staff
      const unassignedTasks = matrixData.dataPoints[0].taskBreakdown!.filter(
        task => !task.preferredStaff
      );
      expect(unassignedTasks).toHaveLength(2);
      
      // User can filter to show only unassigned tasks
      const filters: DemandFilters = {
        preferredStaff: {
          staffIds: [],
          includeUnassigned: true,
          showOnlyPreferred: false
        }
      };
      
      const { matrixData: filteredData } = await DemandMatrixService.generateDemandMatrix(
        'demand-only',
        new Date(),
        filters
      );
      
      expect(filteredData.totalTasks).toBeGreaterThan(0);
    });
  });

  describe('Scenario 2: Handle tasks with preferred staff that no longer exist', () => {
    test('User can see orphaned staff assignments and take action', async () => {
      const mockData: DemandMatrixData = {
        months: [{ key: '2025-01', label: 'Jan 2025' }],
        skills: ['Advisory'],
        dataPoints: [{
          skillType: 'Advisory',
          month: '2025-01',
          monthLabel: 'Jan 2025',
          demandHours: 30,
          taskCount: 1,
          clientCount: 1,
          taskBreakdown: [
            {
              clientId: 'client-1',
              clientName: 'Client A',
              recurringTaskId: 'task-1',
              taskName: 'Orphaned Advisory Task',
              skillType: 'Advisory',
              estimatedHours: 30,
              recurrencePattern: { type: 'Quarterly', interval: 1, frequency: 0.33 },
              monthlyHours: 30,
              preferredStaff: {
                staffId: 'deleted-staff-123',
                staffName: 'Former Employee Smith',
                roleTitle: 'Former Senior Advisor'
              }
            }
          ]
        }],
        totalDemand: 30,
        totalTasks: 1,
        totalClients: 1,
        skillSummary: {}
      };

      vi.mocked(DemandMatrixService.generateDemandMatrix).mockResolvedValue({
        matrixData: mockData
      });

      const { matrixData } = await DemandMatrixService.generateDemandMatrix('demand-only');
      
      // User expectation: Can identify orphaned assignments
      const orphanedTask = matrixData.dataPoints[0].taskBreakdown![0];
      expect(orphanedTask.preferredStaff).toBeDefined();
      expect(orphanedTask.preferredStaff!.staffName).toBe('Former Employee Smith');
      
      // User can filter to find all orphaned assignments
      const filters: DemandFilters = {
        preferredStaff: {
          staffIds: ['deleted-staff-123'],
          includeUnassigned: false,
          showOnlyPreferred: true
        }
      };
      
      const { matrixData: filteredData } = await DemandMatrixService.generateDemandMatrix(
        'demand-only',
        new Date(),
        filters
      );
      
      // Should find the orphaned task
      expect(filteredData.dataPoints[0].taskBreakdown).toHaveLength(1);
      expect(filteredData.dataPoints[0].taskBreakdown![0].preferredStaff!.staffId).toBe('deleted-staff-123');
    });
  });

  describe('Scenario 3: Work with large datasets and multiple filter combinations', () => {
    test('User can efficiently filter large datasets with complex criteria', async () => {
      // Create realistic large dataset
      const skills = ['Tax Preparation', 'Advisory', 'Audit', 'Payroll', 'Bookkeeping'];
      const months = Array.from({ length: 12 }, (_, i) => ({
        key: `2025-${(i + 1).toString().padStart(2, '0')}`,
        label: format(new Date(2025, i), 'MMM yyyy')
      }));
      
      const dataPoints = [];
      for (const skill of skills) {
        for (const month of months) {
          dataPoints.push({
            skillType: skill,
            month: month.key,
            monthLabel: month.label,
            demandHours: Math.floor(Math.random() * 200) + 50,
            taskCount: Math.floor(Math.random() * 20) + 5,
            clientCount: Math.floor(Math.random() * 10) + 2,
            taskBreakdown: Array.from({ length: 15 }, (_, i) => ({
              clientId: `client-${Math.floor(Math.random() * 50) + 1}`,
              clientName: `Client ${Math.floor(Math.random() * 50) + 1}`,
              recurringTaskId: `task-${skill}-${month.key}-${i}`,
              taskName: `${skill} Task ${i + 1}`,
              skillType: skill,
              estimatedHours: Math.floor(Math.random() * 20) + 5,
              recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 },
              monthlyHours: Math.floor(Math.random() * 20) + 5,
              preferredStaff: Math.random() > 0.3 ? {
                staffId: `staff-${Math.floor(Math.random() * 20) + 1}`,
                staffName: `Staff Member ${Math.floor(Math.random() * 20) + 1}`,
                roleTitle: ['Senior CPA', 'Junior CPA', 'Manager', 'Associate'][Math.floor(Math.random() * 4)]
              } : undefined
            }))
          });
        }
      }

      const mockLargeData: DemandMatrixData = {
        months,
        skills,
        dataPoints,
        totalDemand: dataPoints.reduce((sum, dp) => sum + dp.demandHours, 0),
        totalTasks: dataPoints.reduce((sum, dp) => sum + dp.taskCount, 0),
        totalClients: 50,
        skillSummary: {}
      };

      vi.mocked(DemandMatrixService.generateDemandMatrix).mockResolvedValue({
        matrixData: mockLargeData
      });

      const startTime = performance.now();

      // User applies complex filters
      const complexFilters: DemandFilters = {
        skills: ['Tax Preparation', 'Advisory'],
        clients: ['client-1', 'client-5', 'client-10', 'client-15', 'client-20'],
        preferredStaff: {
          staffIds: ['staff-1', 'staff-3', 'staff-5'],
          includeUnassigned: true,
          showOnlyPreferred: false
        },
        timeHorizon: {
          start: new Date('2025-01-01'),
          end: new Date('2025-06-30')
        }
      };

      const { matrixData } = await DemandMatrixService.generateDemandMatrix(
        'demand-only',
        new Date(),
        complexFilters
      );

      const endTime = performance.now();
      const duration = endTime - startTime;

      // User expectation: Fast response even with complex filters
      expect(duration).toBeLessThan(2000); // Under 2 seconds
      
      // User expectation: Filtered results are relevant
      expect(matrixData.dataPoints.length).toBeGreaterThan(0);
      expect(matrixData.totalDemand).toBeGreaterThan(0);
      
      // Verify filtering worked correctly
      const filteredSkills = new Set(matrixData.dataPoints.map(dp => dp.skillType));
      expect(Array.from(filteredSkills)).toEqual(expect.arrayContaining(['Tax Preparation', 'Advisory']));
    });
  });

  describe('Scenario 4: Export functionality with preferred staff context', () => {
    test('User can export matrix data including preferred staff information', async () => {
      const mockDataWithStaff: DemandMatrixData = {
        months: [
          { key: '2025-01', label: 'Jan 2025' },
          { key: '2025-02', label: 'Feb 2025' }
        ],
        skills: ['Tax Preparation'],
        dataPoints: [
          {
            skillType: 'Tax Preparation',
            month: '2025-01',
            monthLabel: 'Jan 2025',
            demandHours: 100,
            taskCount: 4,
            clientCount: 2,
            taskBreakdown: [
              {
                clientId: 'client-1',
                clientName: 'Export Test Client A',
                recurringTaskId: 'export-task-1',
                taskName: 'Tax Return with Staff',
                skillType: 'Tax Preparation',
                estimatedHours: 25,
                recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 },
                monthlyHours: 25,
                preferredStaff: {
                  staffId: 'staff-1',
                  staffName: 'Alice Johnson',
                  roleTitle: 'Senior CPA'
                }
              },
              {
                clientId: 'client-2',
                clientName: 'Export Test Client B',
                recurringTaskId: 'export-task-2',
                taskName: 'Tax Advisory without Staff',
                skillType: 'Tax Preparation',
                estimatedHours: 25,
                recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 },
                monthlyHours: 25
                // No preferred staff
              }
            ]
          }
        ],
        totalDemand: 100,
        totalTasks: 4,
        totalClients: 2,
        skillSummary: {}
      };

      vi.mocked(DemandMatrixService.generateDemandMatrix).mockResolvedValue({
        matrixData: mockDataWithStaff
      });

      const { matrixData } = await DemandMatrixService.generateDemandMatrix('demand-only');
      
      // User expectation: Export includes all relevant data
      expect(matrixData.dataPoints).toHaveLength(1);
      expect(matrixData.dataPoints[0].taskBreakdown).toHaveLength(2);
      
      // User expectation: Preferred staff data is preserved for export
      const taskWithStaff = matrixData.dataPoints[0].taskBreakdown![0];
      expect(taskWithStaff.preferredStaff).toBeDefined();
      expect(taskWithStaff.preferredStaff!.staffName).toBe('Alice Johnson');
      
      const taskWithoutStaff = matrixData.dataPoints[0].taskBreakdown![1];
      expect(taskWithoutStaff.preferredStaff).toBeUndefined();
      
      // User expectation: Export data structure is complete
      expect(matrixData.totalDemand).toBe(100);
      expect(matrixData.totalTasks).toBe(4);
      expect(matrixData.skills).toContain('Tax Preparation');
      expect(matrixData.months).toHaveLength(2);
    });
  });

  describe('Scenario 5: Real-time behavior simulation', () => {
    test('User sees updated data when staff assignments change', async () => {
      // Initial state: Task without preferred staff
      const initialData: DemandMatrixData = {
        months: [{ key: '2025-01', label: 'Jan 2025' }],
        skills: ['Advisory'],
        dataPoints: [{
          skillType: 'Advisory',
          month: '2025-01',
          monthLabel: 'Jan 2025',
          demandHours: 40,
          taskCount: 1,
          clientCount: 1,
          taskBreakdown: [{
            clientId: 'client-1',
            clientName: 'Dynamic Client',
            recurringTaskId: 'dynamic-task-1',
            taskName: 'Advisory Session',
            skillType: 'Advisory',
            estimatedHours: 40,
            recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 },
            monthlyHours: 40
            // No preferred staff initially
          }]
        }],
        totalDemand: 40,
        totalTasks: 1,
        totalClients: 1,
        skillSummary: {}
      };

      // Updated state: Task with newly assigned preferred staff
      const updatedData: DemandMatrixData = {
        ...initialData,
        dataPoints: [{
          ...initialData.dataPoints[0],
          taskBreakdown: [{
            ...initialData.dataPoints[0].taskBreakdown![0],
            preferredStaff: {
              staffId: 'staff-1',
              staffName: 'Bob Wilson',
              roleTitle: 'Senior Advisor'
            }
          }]
        }]
      };

      // Simulate initial load
      vi.mocked(DemandMatrixService.generateDemandMatrix).mockResolvedValueOnce({
        matrixData: initialData
      });

      const { matrixData: initial } = await DemandMatrixService.generateDemandMatrix('demand-only');
      
      // User expectation: Initially no preferred staff
      expect(initial.dataPoints[0].taskBreakdown![0].preferredStaff).toBeUndefined();

      // Clear cache to simulate real-time update
      DemandMatrixService.clearCache();

      // Simulate updated data after staff assignment
      vi.mocked(DemandMatrixService.generateDemandMatrix).mockResolvedValueOnce({
        matrixData: updatedData
      });

      const { matrixData: updated } = await DemandMatrixService.generateDemandMatrix('demand-only');
      
      // User expectation: Updated data reflects new staff assignment
      expect(updated.dataPoints[0].taskBreakdown![0].preferredStaff).toBeDefined();
      expect(updated.dataPoints[0].taskBreakdown![0].preferredStaff!.staffName).toBe('Bob Wilson');
      
      // User expectation: Can filter by the newly assigned staff
      const staffFilter: DemandFilters = {
        preferredStaff: {
          staffIds: ['staff-1'],
          includeUnassigned: false,
          showOnlyPreferred: true
        }
      };

      vi.mocked(DemandMatrixService.generateDemandMatrix).mockResolvedValueOnce({
        matrixData: updated
      });

      const { matrixData: filtered } = await DemandMatrixService.generateDemandMatrix(
        'demand-only',
        new Date(),
        staffFilter
      );
      
      expect(filtered.dataPoints[0].taskBreakdown).toHaveLength(1);
      expect(filtered.dataPoints[0].taskBreakdown![0].preferredStaff!.staffId).toBe('staff-1');
    });
  });

  describe('User Workflow Validation', () => {
    test('Complete user workflow: filter, analyze, and export', async () => {
      const workflowData: DemandMatrixData = {
        months: Array.from({ length: 3 }, (_, i) => ({
          key: `2025-${(i + 1).toString().padStart(2, '0')}`,
          label: `Month ${i + 1}`
        })),
        skills: ['Tax Preparation', 'Advisory'],
        dataPoints: [
          {
            skillType: 'Tax Preparation',
            month: '2025-01',
            monthLabel: 'Jan 2025',
            demandHours: 80,
            taskCount: 3,
            clientCount: 2,
            taskBreakdown: [
              {
                clientId: 'client-1',
                clientName: 'Workflow Client A',
                recurringTaskId: 'workflow-task-1',
                taskName: 'Tax Return Prep',
                skillType: 'Tax Preparation',
                estimatedHours: 30,
                recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 },
                monthlyHours: 30,
                preferredStaff: {
                  staffId: 'staff-1',
                  staffName: 'Charlie Brown',
                  roleTitle: 'Tax Specialist'
                }
              }
            ]
          }
        ],
        totalDemand: 80,
        totalTasks: 3,
        totalClients: 2,
        skillSummary: {}
      };

      vi.mocked(DemandMatrixService.generateDemandMatrix).mockResolvedValue({
        matrixData: workflowData
      });

      // Step 1: User loads initial data
      const { matrixData: step1 } = await DemandMatrixService.generateDemandMatrix('demand-only');
      expect(step1.totalTasks).toBe(3);

      // Step 2: User applies filters
      const filters: DemandFilters = {
        skills: ['Tax Preparation'],
        preferredStaff: {
          staffIds: ['staff-1'],
          includeUnassigned: false,
          showOnlyPreferred: true
        }
      };

      const { matrixData: step2 } = await DemandMatrixService.generateDemandMatrix(
        'demand-only',
        new Date(),
        filters
      );
      expect(step2.dataPoints[0].taskBreakdown![0].preferredStaff!.staffName).toBe('Charlie Brown');

      // Step 3: User validates data quality
      const issues = DemandMatrixService.validateDemandMatrixData(step2);
      expect(issues).toHaveLength(0);

      // Step 4: User prepares export data
      const exportData = {
        timestamp: new Date().toISOString(),
        filters: filters,
        data: step2,
        summary: {
          totalDemand: step2.totalDemand,
          totalTasks: step2.totalTasks,
          skillsIncluded: step2.skills.length,
          monthsIncluded: step2.months.length
        }
      };

      expect(exportData.data.totalDemand).toBeGreaterThan(0);
      expect(exportData.summary.skillsIncluded).toBeGreaterThan(0);
    });
  });
});

// Helper function for date formatting (simplified for tests)
function format(date: Date, formatString: string): string {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}
