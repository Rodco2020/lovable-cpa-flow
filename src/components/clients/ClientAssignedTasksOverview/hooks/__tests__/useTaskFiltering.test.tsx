
import { renderHook, act } from '@testing-library/react';
import { useTaskFiltering } from '../useTaskFiltering';
import { FormattedTask } from '../../types';

describe('useTaskFiltering', () => {
  const mockTasks: FormattedTask[] = [
    {
      id: '1',
      clientId: 'client1',
      clientName: 'ABC Corp',
      taskName: 'Tax Preparation',
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
      clientId: 'client2',
      clientName: 'XYZ Ltd',
      taskName: 'Audit Review',
      taskType: 'Ad-hoc',
      dueDate: new Date('2024-01-10'),
      estimatedHours: 3,
      requiredSkills: ['Audit'],
      priority: 'Medium',
      status: 'Scheduled'
    }
  ];

  it('should initialize with all tasks filtered', () => {
    const { result } = renderHook(() => useTaskFiltering(mockTasks, 'all'));
    
    expect(result.current.filteredTasks).toEqual(mockTasks);
    expect(result.current.filters.searchTerm).toBe('');
  });

  it('should filter tasks when search term changes', () => {
    const { result } = renderHook(() => useTaskFiltering(mockTasks, 'all'));
    
    act(() => {
      result.current.updateFilter('searchTerm', 'tax');
    });
    
    expect(result.current.filteredTasks).toHaveLength(1);
    expect(result.current.filteredTasks[0].taskName).toBe('Tax Preparation');
  });

  it('should filter tasks by active tab', () => {
    const { result, rerender } = renderHook(
      ({ tasks, tab }) => useTaskFiltering(tasks, tab),
      { initialProps: { tasks: mockTasks, tab: 'all' } }
    );
    
    expect(result.current.filteredTasks).toHaveLength(2);
    
    rerender({ tasks: mockTasks, tab: 'recurring' });
    
    expect(result.current.filteredTasks).toHaveLength(1);
    expect(result.current.filteredTasks[0].taskType).toBe('Recurring');
  });

  it('should reset filters correctly', () => {
    const { result } = renderHook(() => useTaskFiltering(mockTasks, 'all'));
    
    // Apply some filters
    act(() => {
      result.current.updateFilter('searchTerm', 'test');
      result.current.updateFilter('clientFilter', 'client1');
    });
    
    expect(result.current.filters.searchTerm).toBe('test');
    expect(result.current.filters.clientFilter).toBe('client1');
    
    // Reset filters
    act(() => {
      result.current.resetFilters();
    });
    
    expect(result.current.filters.searchTerm).toBe('');
    expect(result.current.filters.clientFilter).toBe('all');
    expect(result.current.filteredTasks).toEqual(mockTasks);
  });

  it('should handle task list updates correctly', () => {
    const { result, rerender } = renderHook(
      ({ tasks }) => useTaskFiltering(tasks, 'all'),
      { initialProps: { tasks: mockTasks } }
    );
    
    expect(result.current.filteredTasks).toHaveLength(2);
    
    const newTasks = [...mockTasks, {
      id: '3',
      clientId: 'client3',
      clientName: 'New Client',
      taskName: 'New Task',
      taskType: 'Ad-hoc' as const,
      dueDate: new Date('2024-01-20'),
      estimatedHours: 4,
      requiredSkills: ['Advisory'],
      priority: 'Low',
      status: 'Pending'
    }];
    
    rerender({ tasks: newTasks });
    
    expect(result.current.filteredTasks).toHaveLength(3);
  });
});
