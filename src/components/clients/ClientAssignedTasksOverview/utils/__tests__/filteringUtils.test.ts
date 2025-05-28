
import { FormattedTask } from '../../types';
import { FilteringUtils } from '../filteringUtils';

describe('FilteringUtils', () => {
  const mockTasks: FormattedTask[] = [
    {
      id: '1',
      clientId: 'client1',
      clientName: 'ABC Corp',
      taskName: 'Tax Preparation',
      taskType: 'Recurring',
      dueDate: new Date('2024-01-15'),
      estimatedHours: 5,
      requiredSkills: ['Tax', 'Accounting'],
      priority: 'High',
      status: 'Active',
      isActive: true
    },
    {
      id: '2',
      clientId: 'client2',
      clientName: 'XYZ Ltd',
      taskName: 'Audit Review',
      taskType: 'Ad-hoc',
      dueDate: new Date('2024-01-10'),
      estimatedHours: 3,
      requiredSkills: ['Audit'],
      priority: 'Medium',
      status: 'Scheduled'
    },
    {
      id: '3',
      clientId: 'client1',
      clientName: 'ABC Corp',
      taskName: 'Monthly Bookkeeping',
      taskType: 'Recurring',
      dueDate: new Date('2024-02-01'),
      estimatedHours: 2,
      requiredSkills: ['Bookkeeping'],
      priority: 'Low',
      status: 'Active',
      isActive: false
    }
  ];

  describe('filterBySearchTerm', () => {
    it('should return all tasks when search term is empty', () => {
      const result = FilteringUtils.filterBySearchTerm(mockTasks, '');
      expect(result).toEqual(mockTasks);
    });

    it('should filter by task name', () => {
      const result = FilteringUtils.filterBySearchTerm(mockTasks, 'tax');
      expect(result).toHaveLength(1);
      expect(result[0].taskName).toBe('Tax Preparation');
    });

    it('should filter by client name', () => {
      const result = FilteringUtils.filterBySearchTerm(mockTasks, 'abc');
      expect(result).toHaveLength(2);
      expect(result.every(task => task.clientName === 'ABC Corp')).toBe(true);
    });

    it('should be case insensitive', () => {
      const result = FilteringUtils.filterBySearchTerm(mockTasks, 'AUDIT');
      expect(result).toHaveLength(1);
      expect(result[0].taskName).toBe('Audit Review');
    });
  });

  describe('filterByTaskType', () => {
    it('should return all tasks for "all" tab', () => {
      const result = FilteringUtils.filterByTaskType(mockTasks, 'all');
      expect(result).toEqual(mockTasks);
    });

    it('should filter recurring tasks for "recurring" tab', () => {
      const result = FilteringUtils.filterByTaskType(mockTasks, 'recurring');
      expect(result).toHaveLength(2);
      expect(result.every(task => task.taskType === 'Recurring')).toBe(true);
    });

    it('should filter ad-hoc tasks for "adhoc" tab', () => {
      const result = FilteringUtils.filterByTaskType(mockTasks, 'adhoc');
      expect(result).toHaveLength(1);
      expect(result[0].taskType).toBe('Ad-hoc');
    });
  });

  describe('filterByClient', () => {
    it('should return all tasks when filter is "all"', () => {
      const result = FilteringUtils.filterByClient(mockTasks, 'all');
      expect(result).toEqual(mockTasks);
    });

    it('should filter by specific client ID', () => {
      const result = FilteringUtils.filterByClient(mockTasks, 'client1');
      expect(result).toHaveLength(2);
      expect(result.every(task => task.clientId === 'client1')).toBe(true);
    });
  });

  describe('filterBySkill', () => {
    it('should return all tasks when filter is "all"', () => {
      const result = FilteringUtils.filterBySkill(mockTasks, 'all');
      expect(result).toEqual(mockTasks);
    });

    it('should filter by specific skill', () => {
      const result = FilteringUtils.filterBySkill(mockTasks, 'Tax');
      expect(result).toHaveLength(1);
      expect(result[0].requiredSkills).toContain('Tax');
    });
  });

  describe('filterByPriority', () => {
    it('should return all tasks when filter is "all"', () => {
      const result = FilteringUtils.filterByPriority(mockTasks, 'all');
      expect(result).toEqual(mockTasks);
    });

    it('should filter by specific priority', () => {
      const result = FilteringUtils.filterByPriority(mockTasks, 'High');
      expect(result).toHaveLength(1);
      expect(result[0].priority).toBe('High');
    });
  });

  describe('filterByStatus', () => {
    it('should return all tasks when filter is "all"', () => {
      const result = FilteringUtils.filterByStatus(mockTasks, 'all');
      expect(result).toEqual(mockTasks);
    });

    it('should filter active tasks correctly', () => {
      const result = FilteringUtils.filterByStatus(mockTasks, 'active');
      expect(result).toHaveLength(2); // One active recurring + one non-canceled ad-hoc
    });

    it('should filter paused tasks correctly', () => {
      const result = FilteringUtils.filterByStatus(mockTasks, 'paused');
      expect(result).toHaveLength(1); // One inactive recurring task
    });
  });

  describe('applyAllFilters', () => {
    const filters = {
      searchTerm: '',
      clientFilter: 'all',
      skillFilter: 'all',
      priorityFilter: 'all',
      statusFilter: 'all'
    };

    it('should apply all filters and return correct results', () => {
      const result = FilteringUtils.applyAllFilters(mockTasks, filters, 'all');
      expect(result).toEqual(mockTasks);
    });

    it('should apply multiple filters in sequence', () => {
      const complexFilters = {
        ...filters,
        searchTerm: 'abc',
        statusFilter: 'active'
      };
      const result = FilteringUtils.applyAllFilters(mockTasks, complexFilters, 'recurring');
      expect(result).toHaveLength(1);
      expect(result[0].taskName).toBe('Tax Preparation');
    });
  });
});
