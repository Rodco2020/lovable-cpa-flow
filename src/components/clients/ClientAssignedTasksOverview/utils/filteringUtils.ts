
import { FormattedTask } from '../types';

/**
 * Utility functions for filtering task data
 * These are pure functions that handle specific filtering logic
 */
export class FilteringUtils {
  /**
   * Filter tasks by search term (task name or client name)
   */
  static filterBySearchTerm(tasks: FormattedTask[], searchTerm: string): FormattedTask[] {
    if (!searchTerm) return tasks;
    
    const term = searchTerm.toLowerCase();
    return tasks.filter(task => 
      task.taskName.toLowerCase().includes(term) ||
      task.clientName.toLowerCase().includes(term)
    );
  }

  /**
   * Filter tasks by task type based on active tab
   */
  static filterByTaskType(tasks: FormattedTask[], activeTab: string): FormattedTask[] {
    if (activeTab === 'recurring') {
      return tasks.filter(task => task.taskType === 'Recurring');
    } else if (activeTab === 'adhoc') {
      return tasks.filter(task => task.taskType === 'Ad-hoc');
    }
    return tasks; // 'all' tab shows all tasks
  }

  /**
   * Filter tasks by client ID
   */
  static filterByClient(tasks: FormattedTask[], clientFilter: string): FormattedTask[] {
    if (clientFilter === 'all') return tasks;
    return tasks.filter(task => task.clientId === clientFilter);
  }

  /**
   * Filter tasks by required skill
   */
  static filterBySkill(tasks: FormattedTask[], skillFilter: string): FormattedTask[] {
    if (skillFilter === 'all') return tasks;
    return tasks.filter(task => task.requiredSkills.includes(skillFilter));
  }

  /**
   * Filter tasks by priority
   */
  static filterByPriority(tasks: FormattedTask[], priorityFilter: string): FormattedTask[] {
    if (priorityFilter === 'all') return tasks;
    return tasks.filter(task => task.priority === priorityFilter);
  }

  /**
   * Filter tasks by status (active/paused for recurring, or status for ad-hoc)
   */
  static filterByStatus(tasks: FormattedTask[], statusFilter: string): FormattedTask[] {
    if (statusFilter === 'all') return tasks;
    
    if (statusFilter === 'active') {
      return tasks.filter(task => 
        (task.taskType === 'Recurring' && task.isActive === true) || 
        (task.taskType === 'Ad-hoc' && task.status !== 'Canceled')
      );
    } else if (statusFilter === 'paused') {
      return tasks.filter(task => 
        (task.taskType === 'Recurring' && task.isActive === false) ||
        (task.taskType === 'Ad-hoc' && task.status === 'Canceled')
      );
    }
    
    return tasks;
  }

  /**
   * Filter tasks by preferred staff
   * Phase 3 Enhancement: Improved edge case handling for inactive/deleted staff
   */
  static filterByPreferredStaff(tasks: FormattedTask[], preferredStaffFilter: string): FormattedTask[] {
    if (!preferredStaffFilter || preferredStaffFilter === 'all') return tasks;
    
    // Handle "No Staff Assigned" filter
    if (preferredStaffFilter === 'no-staff') {
      return tasks.filter(task => !task.preferredStaffId);
    }
    
    return tasks.filter(task => {
      // Handle edge case where preferredStaffId might be null/undefined
      if (!task.preferredStaffId) return false;
      
      // Match the exact staff ID
      const matches = task.preferredStaffId === preferredStaffFilter;
      
      // Log potential issues with inactive staff in development
      if (process.env.NODE_ENV === 'development' && matches && !task.preferredStaffName) {
        console.warn(`⚠️ [Phase 3] Task "${task.taskName}" references potentially inactive staff ID: ${task.preferredStaffId}`);
      }
      
      return matches;
    });
  }

  /**
   * Apply all filters to a task list in sequence
   * This is the main filtering orchestrator
   */
  static applyAllFilters(
    tasks: FormattedTask[],
    filters: {
      searchTerm: string;
      clientFilter: string;
      skillFilter: string;
      priorityFilter: string;
      statusFilter: string;
      preferredStaffFilter: string;
    },
    activeTab: string
  ): FormattedTask[] {
    let filtered = [...tasks];
    
    // Apply each filter in sequence
    filtered = this.filterBySearchTerm(filtered, filters.searchTerm);
    filtered = this.filterByTaskType(filtered, activeTab);
    filtered = this.filterByClient(filtered, filters.clientFilter);
    filtered = this.filterBySkill(filtered, filters.skillFilter);
    filtered = this.filterByPriority(filtered, filters.priorityFilter);
    filtered = this.filterByStatus(filtered, filters.statusFilter);
    filtered = this.filterByPreferredStaff(filtered, filters.preferredStaffFilter);
    
    return filtered;
  }
}
