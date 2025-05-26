
import { useState, useEffect } from 'react';
import { FormattedTask, FilterState } from '../types';

export const useTaskFiltering = (formattedTasks: FormattedTask[], activeTab: string) => {
  const [filteredTasks, setFilteredTasks] = useState<FormattedTask[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    clientFilter: 'all',
    skillFilter: 'all',
    priorityFilter: 'all',
    statusFilter: 'all'
  });

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      searchTerm: '',
      clientFilter: 'all',
      skillFilter: 'all',
      priorityFilter: 'all',
      statusFilter: 'all'
    });
  };

  // Apply filters when any filter changes
  useEffect(() => {
    let filtered = [...formattedTasks];
    
    // Filter by search term (task name, client name)
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(task => 
        task.taskName.toLowerCase().includes(term) ||
        task.clientName.toLowerCase().includes(term)
      );
    }
    
    // Filter by tab (all, recurring, ad-hoc)
    if (activeTab === 'recurring') {
      filtered = filtered.filter(task => task.taskType === 'Recurring');
    } else if (activeTab === 'adhoc') {
      filtered = filtered.filter(task => task.taskType === 'Ad-hoc');
    }
    
    // Filter by client
    if (filters.clientFilter !== 'all') {
      filtered = filtered.filter(task => task.clientId === filters.clientFilter);
    }
    
    // Filter by skill
    if (filters.skillFilter !== 'all') {
      filtered = filtered.filter(task => 
        task.requiredSkills.includes(filters.skillFilter)
      );
    }
    
    // Filter by priority
    if (filters.priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === filters.priorityFilter);
    }
    
    // Filter by status (active/paused for recurring, or status for ad-hoc)
    if (filters.statusFilter !== 'all') {
      if (filters.statusFilter === 'active') {
        filtered = filtered.filter(task => 
          (task.taskType === 'Recurring' && task.isActive === true) || 
          (task.taskType === 'Ad-hoc' && task.status !== 'Canceled')
        );
      } else if (filters.statusFilter === 'paused') {
        filtered = filtered.filter(task => 
          (task.taskType === 'Recurring' && task.isActive === false) ||
          (task.taskType === 'Ad-hoc' && task.status === 'Canceled')
        );
      }
    }
    
    setFilteredTasks(filtered);
  }, [formattedTasks, filters, activeTab]);

  return {
    filteredTasks,
    filters,
    updateFilter,
    resetFilters
  };
};
