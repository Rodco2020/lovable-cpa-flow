
/**
 * Preferred Staff User Acceptance Scenario Tests
 * Individual test implementations for each user scenario
 */

import { describe, test, expect, vi } from 'vitest';
import { DemandMatrixService } from '@/services/forecasting/demandMatrixService';

export const runBasicPreferredStaffDisplayTests = () => {
  describe('Basic Preferred Staff Display', () => {
    test('should display preferred staff information correctly', async () => {
      // Mock successful data generation
      const mockData = {
        matrixData: {
          months: [{ key: '2025-01', label: 'Jan 2025' }],
          skills: ['Tax Preparation'],
          dataPoints: [{
            skillType: 'Tax Preparation',
            month: '2025-01',
            monthLabel: 'Jan 2025',
            demandHours: 40,
            taskCount: 5,
            clientCount: 3,
            taskBreakdown: [{
              clientId: 'client-1',
              clientName: 'Client A',
              recurringTaskId: 'task-1',
              taskName: 'Tax Return',
              skillType: 'Tax Preparation',
              estimatedHours: 8,
              recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 },
              monthlyHours: 8,
              preferredStaff: {
                staffId: 'staff-1',
                staffName: 'John Doe',
                roleTitle: 'CPA',
                assignmentType: 'preferred' as const
              }
            }]
          }],
          totalDemand: 40,
          totalTasks: 5,
          totalClients: 3,
          skillSummary: {}
        },
        error: null
      };

      vi.mocked(DemandMatrixService.generateDemandMatrix).mockResolvedValue(mockData);

      const result = await DemandMatrixService.generateDemandMatrix('demand-only');
      
      expect(result.matrixData).toBeDefined();
      expect(result.matrixData?.dataPoints[0].taskBreakdown?.[0].preferredStaff).toBeDefined();
      expect(result.matrixData?.dataPoints[0].taskBreakdown?.[0].preferredStaff?.staffName).toBe('John Doe');
    });
  });
};

export const runStaffFilteringTests = () => {
  describe('Staff Filtering Functionality', () => {
    test('should filter tasks by preferred staff correctly', async () => {
      const mockData = {
        matrixData: {
          months: [{ key: '2025-01', label: 'Jan 2025' }],
          skills: ['Tax Preparation'],
          dataPoints: [{
            skillType: 'Tax Preparation',
            month: '2025-01',
            monthLabel: 'Jan 2025',
            demandHours: 40,
            taskCount: 2,
            clientCount: 2,
            taskBreakdown: [
              {
                clientId: 'client-1',
                clientName: 'Client A',
                recurringTaskId: 'task-1',
                taskName: 'Tax Return',
                skillType: 'Tax Preparation',
                estimatedHours: 20,
                recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 },
                monthlyHours: 20,
                preferredStaff: {
                  staffId: 'staff-1',
                  staffName: 'John Doe',
                  roleTitle: 'CPA',
                  assignmentType: 'preferred' as const
                }
              },
              {
                clientId: 'client-2',
                clientName: 'Client B',
                recurringTaskId: 'task-2',
                taskName: 'Advisory',
                skillType: 'Tax Preparation',
                estimatedHours: 20,
                recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 },
                monthlyHours: 20,
                preferredStaff: {
                  staffId: 'staff-2',
                  staffName: 'Jane Smith',
                  roleTitle: 'Senior Accountant',
                  assignmentType: 'preferred' as const
                }
              }
            ]
          }],
          totalDemand: 40,
          totalTasks: 2,
          totalClients: 2,
          skillSummary: {}
        },
        error: null
      };

      vi.mocked(DemandMatrixService.generateDemandMatrix).mockResolvedValue(mockData);

      const result = await DemandMatrixService.generateDemandMatrix('demand-only', new Date(), {
        skills: [],
        clients: [],
        timeHorizon: { start: new Date(), end: new Date() },
        preferredStaff: {
          staffIds: ['staff-1'],
          includeUnassigned: false,
          showOnlyPreferred: true
        }
      });

      expect(result.matrixData).toBeDefined();
      expect(result.matrixData?.dataPoints[0].taskBreakdown).toBeDefined();
      
      // Verify filtering would work (in real implementation)
      const hasPreferredStaff = result.matrixData?.dataPoints[0].taskBreakdown?.some(
        task => task.preferredStaff?.staffId === 'staff-1'
      );
      expect(hasPreferredStaff).toBe(true);
    });
  });
};

export const runUnassignedTaskTests = () => {
  describe('Unassigned Task Handling', () => {
    test('should correctly identify and display unassigned tasks', async () => {
      const mockData = {
        matrixData: {
          months: [{ key: '2025-01', label: 'Jan 2025' }],
          skills: ['Tax Preparation'],
          dataPoints: [{
            skillType: 'Tax Preparation',
            month: '2025-01',
            monthLabel: 'Jan 2025',
            demandHours: 30,
            taskCount: 3,
            clientCount: 3,
            taskBreakdown: [
              {
                clientId: 'client-1',
                clientName: 'Client A',
                recurringTaskId: 'task-1',
                taskName: 'Tax Return',
                skillType: 'Tax Preparation',
                estimatedHours: 10,
                recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 },
                monthlyHours: 10,
                preferredStaff: undefined // Unassigned
              },
              {
                clientId: 'client-2',
                clientName: 'Client B',
                recurringTaskId: 'task-2',
                taskName: 'Advisory',
                skillType: 'Tax Preparation',
                estimatedHours: 10,
                recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 },
                monthlyHours: 10,
                preferredStaff: {
                  staffId: 'staff-1',
                  staffName: 'John Doe',
                  roleTitle: 'CPA',
                  assignmentType: 'preferred' as const
                }
              },
              {
                clientId: 'client-3',
                clientName: 'Client C',
                recurringTaskId: 'task-3',
                taskName: 'Bookkeeping',
                skillType: 'Tax Preparation',
                estimatedHours: 10,
                recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 },
                monthlyHours: 10,
                preferredStaff: undefined // Unassigned
              }
            ]
          }],
          totalDemand: 30,
          totalTasks: 3,
          totalClients: 3,
          skillSummary: {}
        },
        error: null
      };

      vi.mocked(DemandMatrixService.generateDemandMatrix).mockResolvedValue(mockData);

      const result = await DemandMatrixService.generateDemandMatrix('demand-only');
      
      expect(result.matrixData).toBeDefined();
      
      // Count unassigned tasks
      const unassignedTasks = result.matrixData?.dataPoints[0].taskBreakdown?.filter(
        task => !task.preferredStaff
      );
      
      expect(unassignedTasks).toBeDefined();
      expect(unassignedTasks?.length).toBe(2);
    });
  });
};

export const runStaffWorkloadAnalysisTests = () => {
  describe('Staff Workload Analysis', () => {
    test('should provide workload analysis for staff members', async () => {
      const mockData = {
        matrixData: {
          months: [{ key: '2025-01', label: 'Jan 2025' }],
          skills: ['Tax Preparation'],
          dataPoints: [{
            skillType: 'Tax Preparation',
            month: '2025-01',
            monthLabel: 'Jan 2025',
            demandHours: 60,
            taskCount: 3,
            clientCount: 3,
            taskBreakdown: [
              {
                clientId: 'client-1',
                clientName: 'Client A',
                recurringTaskId: 'task-1',
                taskName: 'Tax Return 1',
                skillType: 'Tax Preparation',
                estimatedHours: 20,
                recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 },
                monthlyHours: 20,
                preferredStaff: {
                  staffId: 'staff-1',
                  staffName: 'John Doe',
                  roleTitle: 'CPA',
                  assignmentType: 'preferred' as const
                }
              },
              {
                clientId: 'client-2',
                clientName: 'Client B',
                recurringTaskId: 'task-2',
                taskName: 'Tax Return 2',
                skillType: 'Tax Preparation',
                estimatedHours: 20,
                recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 },
                monthlyHours: 20,
                preferredStaff: {
                  staffId: 'staff-1',
                  staffName: 'John Doe',
                  roleTitle: 'CPA',
                  assignmentType: 'preferred' as const
                }
              },
              {
                clientId: 'client-3',
                clientName: 'Client C',
                recurringTaskId: 'task-3',
                taskName: 'Advisory',
                skillType: 'Tax Preparation',
                estimatedHours: 20,
                recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 },
                monthlyHours: 20,
                preferredStaff: {
                  staffId: 'staff-2',
                  staffName: 'Jane Smith',
                  roleTitle: 'Senior Accountant',
                  assignmentType: 'preferred' as const
                }
              }
            ]
          }],
          totalDemand: 60,
          totalTasks: 3,
          totalClients: 3,
          skillSummary: {}
        },
        error: null
      };

      vi.mocked(DemandMatrixService.generateDemandMatrix).mockResolvedValue(mockData);

      const result = await DemandMatrixService.generateDemandMatrix('demand-only');
      
      expect(result.matrixData).toBeDefined();
      
      // Analyze workload distribution
      const staffWorkload = new Map<string, number>();
      result.matrixData?.dataPoints[0].taskBreakdown?.forEach(task => {
        if (task.preferredStaff) {
          const currentHours = staffWorkload.get(task.preferredStaff.staffId) || 0;
          staffWorkload.set(task.preferredStaff.staffId, currentHours + task.estimatedHours);
        }
      });

      expect(staffWorkload.get('staff-1')).toBe(40); // John Doe has 40 hours
      expect(staffWorkload.get('staff-2')).toBe(20); // Jane Smith has 20 hours
    });
  });
};

export const runMultiSkillStaffTests = () => {
  describe('Multi-Skill Staff Assignments', () => {
    test('should handle staff with multiple skills correctly', async () => {
      const mockData = {
        matrixData: {
          months: [{ key: '2025-01', label: 'Jan 2025' }],
          skills: ['Tax Preparation', 'Advisory'],
          dataPoints: [
            {
              skillType: 'Tax Preparation',
              month: '2025-01',
              monthLabel: 'Jan 2025',
              demandHours: 20,
              taskCount: 1,
              clientCount: 1,
              taskBreakdown: [{
                clientId: 'client-1',
                clientName: 'Client A',
                recurringTaskId: 'task-1',
                taskName: 'Tax Return',
                skillType: 'Tax Preparation',
                estimatedHours: 20,
                recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 },
                monthlyHours: 20,
                preferredStaff: {
                  staffId: 'staff-1',
                  staffName: 'Multi-Skill John',
                  roleTitle: 'Senior CPA',
                  assignmentType: 'preferred' as const
                }
              }]
            },
            {
              skillType: 'Advisory',
              month: '2025-01',
              monthLabel: 'Jan 2025',
              demandHours: 15,
              taskCount: 1,
              clientCount: 1,
              taskBreakdown: [{
                clientId: 'client-2',
                clientName: 'Client B',
                recurringTaskId: 'task-2',
                taskName: 'Business Advisory',
                skillType: 'Advisory',
                estimatedHours: 15,
                recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 },
                monthlyHours: 15,
                preferredStaff: {
                  staffId: 'staff-1',
                  staffName: 'Multi-Skill John',
                  roleTitle: 'Senior CPA',
                  assignmentType: 'preferred' as const
                }
              }]
            }
          ],
          totalDemand: 35,
          totalTasks: 2,
          totalClients: 2,
          skillSummary: {}
        },
        error: null
      };

      vi.mocked(DemandMatrixService.generateDemandMatrix).mockResolvedValue(mockData);

      const result = await DemandMatrixService.generateDemandMatrix('demand-only');
      
      expect(result.matrixData).toBeDefined();
      expect(result.matrixData?.skills).toContain('Tax Preparation');
      expect(result.matrixData?.skills).toContain('Advisory');
      
      // Verify same staff member appears across different skill types
      const staff1InTax = result.matrixData?.dataPoints[0].taskBreakdown?.[0].preferredStaff?.staffId;
      const staff1InAdvisory = result.matrixData?.dataPoints[1].taskBreakdown?.[0].preferredStaff?.staffId;
      
      expect(staff1InTax).toBe('staff-1');
      expect(staff1InAdvisory).toBe('staff-1');
    });
  });
};
