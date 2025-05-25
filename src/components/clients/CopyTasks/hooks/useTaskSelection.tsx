
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getClientRecurringTasks, getClientAdHocTasks } from '@/services/clientService';
import { RecurringTask, TaskInstance } from '@/types/task';
import { TaskFilterOption } from '../types';

export const useTaskSelection = (clientId: string) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<TaskFilterOption>('all');

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

  // Filter tasks based on search term and active filter
  const filteredTasks = [...(recurringTasks as RecurringTask[]), ...(adHocTasks as TaskInstance[])].filter(task => {
    const matchesSearch = task?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeFilter === 'all') {
      return matchesSearch;
    } else if (activeFilter === 'recurring') {
      return matchesSearch && 'recurrencePattern' in task;
    } else if (activeFilter === 'adhoc') {
      return matchesSearch && !('recurrencePattern' in task);
    }
    return false;
  });

  const recurringTasksCount = recurringTasks.length;
  const adHocTasksCount = adHocTasks.length;

  // Determine the display type based on active filter
  const displayType = activeFilter === 'adhoc' ? 'ad-hoc' : 'recurring';

  return {
    searchTerm,
    setSearchTerm,
    activeFilter,
    setActiveFilter,
    filteredTasks,
    recurringTasksCount,
    adHocTasksCount,
    displayType,
    isLoading,
    hasError
  };
};
