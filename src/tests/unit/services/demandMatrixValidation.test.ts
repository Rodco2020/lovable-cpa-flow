
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
        demandHours: 100,
        taskCount: 5,
        clientCount: 3,
        taskBreakdown: [
          {
            clientId: 'client-1',
            clientName: 'Test Client 1',
            recurringTaskId: 'task-1',
            taskName: 'Tax Return Prep',
            skillType: 'Tax Preparation',
            estimatedHours: 20,
            recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 },
            monthlyHours: 20,
            preferredStaff: {
              staffId: 'staff-1',
              staffName: 'Alice Johnson',
              roleTitle: 'Senior CPA'
            }
          }
        ]
      }
    ],
    totalDemand: 100,
    totalTasks: 5,
    totalClients: 3,
    skillSummary: {}
  });

  describe('Basic Validation', () => {
    test('validates correct matrix data', () => {
      const validData = createValidMatrixData();
      const result = DemandMatrixValidator.validateDemandMatrixData(validData);
      
      expect(result.isValid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    test('detects null/undefined data', () => {
      const result = DemandMatrixValidator.validateDemandMatrixData(null as any);
      
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Demand matrix data is null or undefined');
    });

    test('validates months array structure', () => {
      const invalidData = createValidMatrixData();
      invalidData.months = [{ key: '2025-01', label: 'Jan 2025' }]; // Only 1 month instead of 12
      
      const result = DemandMatrixValidator.validateDemandMatrixData(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Expected 12 months, got 1');
    });

    test('validates skills array', () => {
      const invalidData = createValidMatrixData();
      invalidData.skills = [];
      
      const result = DemandMatrixValidator.validateDemandMatrixData(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('No skills found in demand matrix data');
    });
  });

  describe('Data Points Validation', () => {
    test('detects negative demand hours', () => {
      const invalidData = createValidMatrixData();
      invalidData.dataPoints[0].demandHours = -50;
      
      const result = DemandMatrixValidator.validateDemandMatrixData(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.issues.some(issue => issue.includes('negative demand hours'))).toBe(true);
    });

    test('validates skill type references', () => {
      const invalidData = createValidMatrixData();
      invalidData.dataPoints[0].skillType = 'Invalid Skill';
      
      const result = DemandMatrixValidator.validateDemandMatrixData(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.issues.some(issue => issue.includes('invalid skill type'))).toBe(true);
    });

    test('validates month references', () => {
      const invalidData = createValidMatrixData();
      invalidData.dataPoints[0].month = '2025-13'; // Invalid month
      
      const result = DemandMatrixValidator.validateDemandMatrixData(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.issues.some(issue => issue.includes('invalid month'))).toBe(true);
    });

    test('detects negative task counts', () => {
      const invalidData = createValidMatrixData();
      invalidData.dataPoints[0].taskCount = -1;
      
      const result = DemandMatrixValidator.validateDemandMatrixData(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.issues.some(issue => issue.includes('negative task count'))).toBe(true);
    });
  });

  describe('Total Consistency Validation', () => {
    test('detects total demand mismatch', () => {
      const invalidData = createValidMatrixData();
      invalidData.totalDemand = 200; // Doesn't match calculated total (100)
      
      const result = DemandMatrixValidator.validateDemandMatrixData(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.issues.some(issue => issue.includes('Total demand mismatch'))).toBe(true);
    });

    test('detects total tasks mismatch', () => {
      const invalidData = createValidMatrixData();
      invalidData.totalTasks = 10; // Doesn't match calculated total (5)
      
      const result = DemandMatrixValidator.validateDemandMatrixData(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.issues.some(issue => issue.includes('Total tasks mismatch'))).toBe(true);
    });
  });

  describe('Preferred Staff Validation', () => {
    test('validates preferred staff data structure', () => {
      const data = createValidMatrixData();
      data.dataPoints[0].taskBreakdown![0].preferredStaff = {
        staffId: 'staff-1',
        staffName: '', // Missing staff name
        roleTitle: 'Senior CPA'
      };
      
      const result = DemandMatrixValidator.validatePreferredStaffData(data);
      
      expect(result.isValid).toBe(false);
      expect(result.issues.some(issue => issue.includes('missing staff name'))).toBe(true);
    });

    test('calculates preferred staff statistics', () => {
      const data = createValidMatrixData();
      // Add another task without preferred staff
      data.dataPoints[0].taskBreakdown!.push({
        clientId: 'client-2',
        clientName: 'Test Client 2',
        recurringTaskId: 'task-2',
        taskName: 'Advisory Session',
        skillType: 'Advisory',
        estimatedHours: 15,
        recurrencePattern: { type: 'Weekly', interval: 1, frequency: 4 },
        monthlyHours: 15
        // No preferredStaff field
      });
      
      const result = DemandMatrixValidator.validatePreferredStaffData(data);
      
      expect(result.stats.totalTasks).toBe(2);
      expect(result.stats.tasksWithPreferredStaff).toBe(1);
      expect(result.stats.tasksWithoutPreferredStaff).toBe(1);
      expect(result.stats.preferredStaffCoverage).toBe(50);
    });

    test('handles tasks with no breakdown', () => {
      const data = createValidMatrixData();
      data.dataPoints[0].taskBreakdown = undefined;
      
      const result = DemandMatrixValidator.validatePreferredStaffData(data);
      
      expect(result.stats.totalTasks).toBe(0);
      expect(result.stats.preferredStaffCoverage).toBe(0);
    });
  });
});
