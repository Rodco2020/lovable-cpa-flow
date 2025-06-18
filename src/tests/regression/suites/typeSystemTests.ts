
/**
 * Type System Compatibility Test Suite
 * 
 * Ensures the unified type system maintains backward compatibility.
 */

import { RecurringTask } from '@/types/task';

export interface TypeSystemTestConfig {
  mockRecurringTasks: RecurringTask[];
}

export const runTypeSystemCompatibilityTests = ({ mockRecurringTasks }: TypeSystemTestConfig) => {
  describe('Type System Compatibility', () => {
    test('maintains compatibility with existing RecurringTask interface', () => {
      const task: RecurringTask = mockRecurringTasks[0];

      // Verify all required properties are present
      expect(task.id).toBeDefined();
      expect(task.templateId).toBeDefined();
      expect(task.clientId).toBeDefined();
      expect(task.name).toBeDefined();
      expect(task.estimatedHours).toBeDefined();
      expect(task.requiredSkills).toBeDefined();
      expect(task.priority).toBeDefined();
      expect(task.category).toBeDefined();
      expect(task.status).toBeDefined();
      expect(task.createdAt).toBeDefined();
      expect(task.updatedAt).toBeDefined();
      expect(task.recurrencePattern).toBeDefined();
      expect(task.isActive).toBeDefined();

      // Verify optional properties can be null/undefined
      expect(task.preferredStaffId).toBeNull();
      expect(task.lastGeneratedDate).toBeNull();
      expect(task.dueDate).toBeInstanceOf(Date);
    });

    test('supports all task priorities', () => {
      const priorities: Array<RecurringTask['priority']> = ['Low', 'Medium', 'High', 'Urgent'];
      
      priorities.forEach(priority => {
        const task: Partial<RecurringTask> = { priority };
        expect(task.priority).toBe(priority);
      });
    });

    test('supports all task categories', () => {
      const categories: Array<RecurringTask['category']> = [
        'Tax', 'Audit', 'Advisory', 'Compliance', 'Bookkeeping', 'Other'
      ];
      
      categories.forEach(category => {
        const task: Partial<RecurringTask> = { category };
        expect(task.category).toBe(category);
      });
    });

    test('supports all recurrence pattern types', () => {
      const recurrenceTypes: Array<RecurringTask['recurrencePattern']['type']> = [
        'Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annually', 'Custom'
      ];
      
      recurrenceTypes.forEach(type => {
        const task: Partial<RecurringTask> = {
          recurrencePattern: { type }
        };
        expect(task.recurrencePattern?.type).toBe(type);
      });
    });
  });
};
