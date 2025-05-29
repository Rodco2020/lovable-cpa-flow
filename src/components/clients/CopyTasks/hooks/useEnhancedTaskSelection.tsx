
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getClientRecurringTasks, getClientAdHocTasks } from '@/services/clientService';
import { RecurringTask, TaskInstance } from '@/types/task';
import { TaskFilterOption } from '../types';

export interface TaskWithType extends RecurringTask {
  taskType: 'recurring';
}

export interface AdHocTaskWithType extends TaskInstance {
  taskType: 'ad-hoc';
}

export type UnifiedTask = TaskWithType | AdHocTaskWithType;

export const useEnhancedTaskSelection = (clientId: string) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<TaskFilterOption>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'priority' | 'estimatedHours' | 'dueDate'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Fetch recurring tasks
  const { data: recurringTasks = [], isLoading: recurringLoading, error: recurringError } = useQuery({
    queryKey: ['client', clientId, 'recurring-tasks'],
    queryFn: () => getClientRecurringTasks(clientId),
    enabled: !!clientId,
  });

  // Fetch ad-hoc tasks
  const { data: adHocTasks = [], isLoading: adHocLoading, error: adHocError } = useQuery({
    queryKey: ['client', clientId, 'adhoc-tasks'],
    queryFn: () => getClientAdHocTasks(clientId),
    enabled: !!clientId,
  });

  const isLoading = recurringLoading || adHocLoading;
  const hasError = recurringError || adHocError;

  // Combine and unify tasks with type information
  const unifiedTasks: UnifiedTask[] = useMemo(() => {
    const recurringWithType: TaskWithType[] = (recurringTasks as RecurringTask[]).map(task => ({
      ...task,
      taskType: 'recurring' as const
    }));

    const adHocWithType: AdHocTaskWithType[] = (adHocTasks as TaskInstance[]).map(task => ({
      ...task,
      taskType: 'ad-hoc' as const
    }));

    return [...recurringWithType, ...adHocWithType];
  }, [recurringTasks, adHocTasks]);

  // Get unique categories and priorities for filters
  const availableCategories = useMemo(() => {
    const categories = new Set(unifiedTasks.map(task => task.category).filter(Boolean));
    return Array.from(categories).sort();
  }, [unifiedTasks]);

  const availablePriorities = useMemo(() => {
    const priorities = new Set(unifiedTasks.map(task => task.priority).filter(Boolean));
    return Array.from(priorities).sort();
  }, [unifiedTasks]);

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = unifiedTasks.filter(task => {
      // Search filter
      const matchesSearch = task?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task?.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Type filter
      let matchesType = true;
      if (activeFilter === 'recurring') {
        matchesType = task.taskType === 'recurring';
      } else if (activeFilter === 'adhoc') {
        matchesType = task.taskType === 'ad-hoc';
      }

      // Category filter
      const matchesCategory = !categoryFilter || task.category === categoryFilter;

      // Priority filter
      const matchesPriority = !priorityFilter || task.priority === priorityFilter;

      return matchesSearch && matchesType && matchesCategory && matchesPriority;
    });

    // Sort tasks
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'priority':
          const priorityOrder = { 'Urgent': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
          comparison = (priorityOrder[a.priority as keyof typeof priorityOrder] || 0) - 
                      (priorityOrder[b.priority as keyof typeof priorityOrder] || 0);
          break;
        case 'estimatedHours':
          comparison = (a.estimatedHours || 0) - (b.estimatedHours || 0);
          break;
        case 'dueDate':
          const aDate = a.dueDate ? new Date(a.dueDate).getTime() : 0;
          const bDate = b.dueDate ? new Date(b.dueDate).getTime() : 0;
          comparison = aDate - bDate;
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [unifiedTasks, searchTerm, activeFilter, categoryFilter, priorityFilter, sortBy, sortOrder]);

  const recurringTasksCount = recurringTasks.length;
  const adHocTasksCount = adHocTasks.length;

  return {
    // Search and filters
    searchTerm,
    setSearchTerm,
    activeFilter,
    setActiveFilter,
    categoryFilter,
    setCategoryFilter,
    priorityFilter,
    setPriorityFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,

    // Data
    unifiedTasks,
    filteredTasks: filteredAndSortedTasks,
    recurringTasksCount,
    adHocTasksCount,
    
    // Filter options
    availableCategories,
    availablePriorities,

    // State
    isLoading,
    hasError
  };
};
