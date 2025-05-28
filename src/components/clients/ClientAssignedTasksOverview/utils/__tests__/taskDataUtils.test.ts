
import { FormattedTask } from '../../types';
import { TaskDataUtils } from '../taskDataUtils';

describe('TaskDataUtils', () => {
  const mockTasks: FormattedTask[] = [
    {
      id: '1',
      clientId: 'client1',
      clientName: 'Client A',
      taskName: 'Task 1',
      taskType: 'Recurring',
      dueDate: new Date('2024-01-15'),
      estimatedHours: 5,
      requiredSkills: ['Tax'],
      priority: 'High',
      status: 'Active',
      isActive: true
    },
    {
      id: '2',
      clientId: 'client1',
      clientName: 'Client A',
      taskName: 'Task 2',
      taskType: 'Ad-hoc',
      dueDate: new Date('2024-01-10'),
      estimatedHours: 3,
      requiredSkills: ['Audit'],
      priority: 'Medium',
      status: 'Scheduled'
    }
  ];

  describe('sortTasksByDueDate', () => {
    it('should sort tasks by due date in ascending order', () => {
      const sorted = TaskDataUtils.sortTasksByDueDate(mockTasks);
      expect(sorted[0].dueDate).toEqual(new Date('2024-01-10'));
      expect(sorted[1].dueDate).toEqual(new Date('2024-01-15'));
    });

    it('should place tasks with null due dates at the end', () => {
      const tasksWithNull = [...mockTasks, {
        ...mockTasks[0],
        id: '3',
        dueDate: null
      }];
      const sorted = TaskDataUtils.sortTasksByDueDate(tasksWithNull);
      expect(sorted[2].dueDate).toBeNull();
    });
  });

  describe('generateFilterOptions', () => {
    it('should convert Sets to sorted arrays', () => {
      const skills = new Set(['Tax', 'Audit', 'Advisory']);
      const priorities = new Set(['High', 'Medium', 'Low']);
      
      const options = TaskDataUtils.generateFilterOptions(skills, priorities);
      
      expect(options.availableSkills).toEqual(['Advisory', 'Audit', 'Tax']);
      expect(options.availablePriorities).toEqual(['High', 'Low', 'Medium']);
    });
  });

  describe('validateTaskData', () => {
    it('should return true for valid task data', () => {
      expect(TaskDataUtils.validateTaskData(mockTasks)).toBe(true);
    });

    it('should return false for invalid task data', () => {
      const invalidTask = { ...mockTasks[0], id: '' };
      expect(TaskDataUtils.validateTaskData([invalidTask])).toBe(false);
    });
  });
});
