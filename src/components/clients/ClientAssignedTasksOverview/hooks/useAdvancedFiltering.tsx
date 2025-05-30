
import { useState, useMemo } from 'react';
import { FormattedTask } from '../types';
import { AdvancedFilterState } from '../components/AdvancedFilters';

/**
 * Hook for managing advanced filtering functionality
 * 
 * Handles the complex multi-criteria filtering logic that was previously
 * inline in the main component. Provides advanced filter state management
 * and applies multi-select filters, date ranges, and preset filters.
 */
export const useAdvancedFiltering = (filteredTasks: FormattedTask[]) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilterState>({
    skillFilters: [],
    clientFilters: [],
    priorityFilters: [],
    statusFilters: [],
    dateRange: { from: undefined, to: undefined },
    preset: null
  });

  // Apply advanced filters to the already filtered tasks
  const finalFilteredTasks = useMemo(() => {
    if (!showAdvancedFilters) return filteredTasks;

    let filtered = [...filteredTasks];

    console.log('Advanced filtering - initial tasks:', filtered.length);
    console.log('Advanced filters state:', advancedFilters);

    // Apply multi-select filters
    if (advancedFilters.skillFilters.length > 0) {
      filtered = filtered.filter(task => 
        advancedFilters.skillFilters.some(skill => task.requiredSkills.includes(skill))
      );
      console.log('After skill filter:', filtered.length);
    }

    if (advancedFilters.clientFilters.length > 0) {
      filtered = filtered.filter(task => 
        advancedFilters.clientFilters.includes(task.clientId)
      );
      console.log('After client filter:', filtered.length);
    }

    if (advancedFilters.priorityFilters.length > 0) {
      filtered = filtered.filter(task => 
        advancedFilters.priorityFilters.includes(task.priority)
      );
      console.log('After priority filter:', filtered.length);
    }

    if (advancedFilters.statusFilters.length > 0) {
      filtered = filtered.filter(task => {
        return advancedFilters.statusFilters.some(status => {
          if (status === 'active') {
            return (task.taskType === 'Recurring' && task.isActive === true) || 
                   (task.taskType === 'Ad-hoc' && task.status !== 'Canceled');
          } else if (status === 'paused') {
            return (task.taskType === 'Recurring' && task.isActive === false) ||
                   (task.taskType === 'Ad-hoc' && task.status === 'Canceled');
          } else if (status === 'recurring') {
            return task.taskType === 'Recurring';
          } else if (status === 'adhoc') {
            return task.taskType === 'Ad-hoc';
          }
          return false;
        });
      });
      console.log('After status filter:', filtered.length);
    }

    // Apply date range filter
    if (advancedFilters.dateRange.from || advancedFilters.dateRange.to) {
      filtered = filtered.filter(task => {
        if (!task.dueDate) return false;
        const taskDate = task.dueDate;
        
        if (advancedFilters.dateRange.from && taskDate < advancedFilters.dateRange.from) {
          return false;
        }
        if (advancedFilters.dateRange.to && taskDate > advancedFilters.dateRange.to) {
          return false;
        }
        return true;
      });
      console.log('After date filter:', filtered.length);
    }

    // Apply preset-specific filters
    if (advancedFilters.preset === 'multi-skill') {
      filtered = filtered.filter(task => task.requiredSkills.length > 1);
      console.log('After multi-skill preset:', filtered.length);
    }

    return filtered;
  }, [filteredTasks, advancedFilters, showAdvancedFilters]);

  const resetAdvancedFilters = () => {
    setAdvancedFilters({
      skillFilters: [],
      clientFilters: [],
      priorityFilters: [],
      statusFilters: [],
      dateRange: { from: undefined, to: undefined },
      preset: null
    });
  };

  return {
    showAdvancedFilters,
    setShowAdvancedFilters,
    advancedFilters,
    setAdvancedFilters,
    finalFilteredTasks,
    resetAdvancedFilters
  };
};
