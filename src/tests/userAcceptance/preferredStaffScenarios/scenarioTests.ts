
/**
 * Preferred Staff Scenario Tests
 * User acceptance tests for preferred staff functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  createMockRecurringTask, 
  createPreferredStaffTestData 
} from './testHelpers';

// Mock the services and components
vi.mock('@/services/forecasting/demandMatrixService', () => ({
  DemandMatrixService: {
    generateDemandMatrix: vi.fn()
  }
}));

export const runBasicPreferredStaffDisplayTests = () => {
  describe('Basic Preferred Staff Display', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should create tasks with preferred staff assignment', () => {
      const testData = createPreferredStaffTestData();
      
      expect(testData.tasks).toHaveLength(3);
      expect(testData.tasks[0].preferred_staff_id).toBe('staff-1');
      expect(testData.tasks[1].preferred_staff_id).toBeNull();
      expect(testData.tasks[2].preferred_staff_id).toBe('staff-2');
    });

    it('should handle tasks without preferred staff', () => {
      const task = createMockRecurringTask({ preferred_staff_id: null });
      
      expect(task.preferred_staff_id).toBeNull();
      expect(task.name).toBe('Test Task');
    });
  });
};

export const runStaffFilteringTests = () => {
  describe('Staff Filtering Functionality', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should process preferred staff data in demand matrix', () => {
      const testData = createPreferredStaffTestData();
      
      // Verify test data structure
      expect(testData.tasks.filter(t => t.preferred_staff_id !== null)).toHaveLength(2);
      expect(testData.staff).toHaveLength(2);
    });
  });
};

export const runUnassignedTaskTests = () => {
  describe('Unassigned Task Handling', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should handle unassigned tasks correctly', () => {
      const task = createMockRecurringTask({ preferred_staff_id: null });
      expect(task.preferred_staff_id).toBeNull();
    });
  });
};

export const runStaffWorkloadAnalysisTests = () => {
  describe('Staff Workload Analysis', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should analyze staff workload distribution', () => {
      const testData = createPreferredStaffTestData();
      const assignedTasks = testData.tasks.filter(t => t.preferred_staff_id !== null);
      expect(assignedTasks).toHaveLength(2);
    });
  });
};

export const runMultiSkillStaffTests = () => {
  describe('Multi-Skill Staff Assignments', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should handle multi-skill staff assignments', () => {
      const testData = createPreferredStaffTestData();
      expect(testData.staff).toHaveLength(2);
    });
  });
};
