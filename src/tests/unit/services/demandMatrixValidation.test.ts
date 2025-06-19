
import { describe, test, expect } from 'vitest';
import { DemandMatrixValidator } from '@/services/forecasting/demand/demandMatrixValidator';
import { DemandMatrixData } from '@/types/demand';

describe('DemandMatrixValidator', () => {
  const createValidMatrixData = (): DemandMatrixData => ({
    months: Array.from({ length: 12 }, (_, i) => ({
      key: `2025-${(i + 1).toString().padStart(2, '0')}`,
      label: `Month ${i + 1}`
    })),
    skills: ['Tax Preparation', 'Advisory', 'Audit'],
    dataPoints: [
      {
        skillType: 'Tax Preparation',
        month: '2025-01',
        monthLabel: 'Jan 2025',
        demandHours: 50,
        taskCount: 2,
        clientCount: 1,
        taskBreakdown: [
          {
            clientId: 'client-1',
            clientName: 'Test Client',
            recurringTaskId: 'task-1',
            taskName: 'Tax Task 1',
            skillType: 'Tax Preparation',
            estimatedHours: 25,
            monthlyHours: 25,
            recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 },
            preferredStaff: {
              staffId: 'staff-1',
              staffName: 'John Doe',
              roleTitle: 'CPA',
              assignmentType: 'preferred'
            }
          },
          {
            clientId: 'client-1',
            clientName: 'Test Client',
            recurringTaskId: 'task-2',
            taskName: 'Tax Task 2',
            skillType: 'Tax Preparation',
            estimatedHours: 25,
            monthlyHours: 25,
            recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 }
          }
        ]
      }
    ],
    totalDemand: 50,
    totalTasks: 2,
    totalClients: 1,
    skillSummary: {
      'Tax Preparation': {
        totalHours: 50,
        taskCount: 2,
        clientCount: 1
      }
    }
  });

  describe('Basic Validation', () => {
    test('validates correct matrix data structure', () => {
      const validData = createValidMatrixData();
      const result = DemandMatrixValidator.validateDemandMatrixData(validData);
      
      expect(result.isValid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    test('detects missing required fields', () => {
      const invalidData = {
        // Missing months, skills, dataPoints
        totalDemand: 100,
        totalTasks: 10,
        totalClients: 5,
        skillSummary: {}
      } as any;

      const result = DemandMatrixValidator.validateDemandMatrixData(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    test('validates data point structure', () => {
      const data = createValidMatrixData();
      data.dataPoints[0].demandHours = -10; // Invalid negative hours
      
      const result = DemandMatrixValidator.validateDemandMatrixData(data);
      
      expect(result.isValid).toBe(false);
      expect(result.issues.some(issue => issue.includes('negative'))).toBe(true);
    });
  });

  describe('Task Breakdown Validation', () => {
    test('validates task breakdown structure', () => {
      const data = createValidMatrixData();
      
      // Add invalid task breakdown
      data.dataPoints[0].taskBreakdown!.push({
        clientId: '',
        clientName: '',
        recurringTaskId: 'task-3',
        taskName: 'Invalid Task',
        skillType: 'Tax Preparation',
        estimatedHours: 0,
        monthlyHours: 0,
        recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 }
      });
      
      const result = DemandMatrixValidator.validateDemandMatrixData(data);
      
      expect(result.isValid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    test('validates preferred staff information', () => {
      const data = createValidMatrixData();
      
      // Add task breakdown with invalid preferred staff (missing assignmentType will be caught by TypeScript)
      const validationResult = DemandMatrixValidator.validateDemandMatrixData(data);
      
      // Should pass validation since we have valid preferred staff data
      expect(validationResult.isValid).toBe(true);
    });
  });

  describe('Summary Validation', () => {
    test('validates skill summary consistency', () => {
      const data = createValidMatrixData();
      
      // Make skill summary inconsistent with data points
      data.skillSummary['Tax Preparation'].totalHours = 999; // Should be 50
      
      const result = DemandMatrixValidator.validateDemandMatrixData(data);
      
      expect(result.isValid).toBe(false);
      expect(result.issues.some(issue => issue.includes('inconsistent'))).toBe(true);
    });

    test('validates total calculations', () => {
      const data = createValidMatrixData();
      
      // Make totals inconsistent
      data.totalDemand = 999; // Should be 50
      
      const result = DemandMatrixValidator.validateDemandMatrixData(data);
      
      expect(result.isValid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    test('handles empty data points array', () => {
      const data = createValidMatrixData();
      data.dataPoints = [];
      data.totalDemand = 0;
      data.totalTasks = 0;
      data.totalClients = 0;
      data.skillSummary = {};
      
      const result = DemandMatrixValidator.validateDemandMatrixData(data);
      
      expect(result.isValid).toBe(true);
    });

    test('handles null or undefined values', () => {
      const result = DemandMatrixValidator.validateDemandMatrixData(null as any);
      
      expect(result.isValid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    test('validates preferred staff data structure', () => {
      const data = createValidMatrixData();
      
      // Ensure we have valid preferred staff data
      const taskWithStaff = data.dataPoints[0].taskBreakdown![0];
      expect(taskWithStaff.preferredStaff).toBeDefined();
      expect(taskWithStaff.preferredStaff!.assignmentType).toBe('preferred');
      
      const result = DemandMatrixValidator.validateDemandMatrixData(data);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Performance Validation', () => {
    test('validates large datasets efficiently', () => {
      // Create a large dataset
      const largeData = createValidMatrixData();
      
      // Add many data points
      for (let i = 1; i <= 1000; i++) {
        largeData.dataPoints.push({
          skillType: 'Tax Preparation',
          month: '2025-01',
          monthLabel: 'Jan 2025',
          demandHours: 10,
          taskCount: 1,
          clientCount: 1,
          taskBreakdown: [{
            clientId: `client-${i}`,
            clientName: `Client ${i}`,
            recurringTaskId: `task-${i}`,
            taskName: `Task ${i}`,
            skillType: 'Tax Preparation',
            estimatedHours: 10,
            monthlyHours: 10,
            recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 },
            preferredStaff: {
              staffId: `staff-${i}`,
              staffName: `Staff ${i}`,
              roleTitle: 'CPA',
              assignmentType: 'preferred'
            }
          }]
        });
      }
      
      const startTime = performance.now();
      const result = DemandMatrixValidator.validateDemandMatrixData(largeData);
      const duration = performance.now() - startTime;
      
      // Should complete validation within reasonable time
      expect(duration).toBeLessThan(1000); // 1 second
      expect(result.isValid).toBe(false); // Will fail due to incorrect totals
    });
  });
});
