
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
   * ENHANCED: Filter tasks by preferred staff member with detailed logging
   */
  static filterByPreferredStaff(tasks: FormattedTask[], preferredStaffFilter: string): FormattedTask[] {
    console.log(`🔍 [PREFERRED STAFF FILTER] Filtering ${tasks.length} tasks by preferred staff: "${preferredStaffFilter}"`);
    
    if (preferredStaffFilter === 'all') {
      console.log(`✅ [PREFERRED STAFF FILTER] Showing all tasks (no filter)`);
      return tasks;
    }
    
    // Log task preferred staff assignments for debugging
    tasks.forEach((task, index) => {
      console.log(`📋 [TASK ${index + 1}] "${task.taskName}" - Preferred Staff: ${task.preferredStaffId || 'none'} (${task.preferredStaffName || 'unassigned'})`);
    });

    const filtered = tasks.filter(task => {
      // Handle tasks with no preferred staff (show them when filtering for unassigned)
      if (preferredStaffFilter === 'unassigned') {
        const isUnassigned = !task.preferredStaffId || task.preferredStaffId === '';
        console.log(`🔍 [UNASSIGNED FILTER] Task "${task.taskName}": ${isUnassigned ? 'INCLUDED' : 'EXCLUDED'} (preferredStaffId: ${task.preferredStaffId})`);
        return isUnassigned;
      }
      
      // Filter by specific staff member
      const matches = task.preferredStaffId === preferredStaffFilter;
      console.log(`🔍 [STAFF FILTER] Task "${task.taskName}": ${matches ? 'INCLUDED' : 'EXCLUDED'} (task.preferredStaffId: "${task.preferredStaffId}" vs filter: "${preferredStaffFilter}")`);
      return matches;
    });

    console.log(`✅ [PREFERRED STAFF FILTER] Result: ${filtered.length} tasks match the filter "${preferredStaffFilter}"`);
    filtered.forEach(task => {
      console.log(`  ✓ "${task.taskName}" (Client: ${task.clientName}, Staff: ${task.preferredStaffName || 'unassigned'})`);
    });

    return filtered;
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
    console.log(`🔄 [APPLY ALL FILTERS] Starting with ${tasks.length} tasks, filters:`, filters);
    
    let filtered = [...tasks];
    
    // Apply each filter in sequence with logging
    const initialCount = filtered.length;
    filtered = this.filterBySearchTerm(filtered, filters.searchTerm);
    console.log(`  📝 Search filter: ${initialCount} → ${filtered.length} tasks`);
    
    const afterSearch = filtered.length;
    filtered = this.filterByTaskType(filtered, activeTab);
    console.log(`  📂 Task type filter: ${afterSearch} → ${filtered.length} tasks`);
    
    const afterType = filtered.length;
    filtered = this.filterByClient(filtered, filters.clientFilter);
    console.log(`  🏢 Client filter: ${afterType} → ${filtered.length} tasks`);
    
    const afterClient = filtered.length;
    filtered = this.filterBySkill(filtered, filters.skillFilter);
    console.log(`  🎯 Skill filter: ${afterClient} → ${filtered.length} tasks`);
    
    const afterSkill = filtered.length;
    filtered = this.filterByPriority(filtered, filters.priorityFilter);
    console.log(`  ⚡ Priority filter: ${afterSkill} → ${filtered.length} tasks`);
    
    const afterPriority = filtered.length;
    filtered = this.filterByStatus(filtered, filters.statusFilter);
    console.log(`  📊 Status filter: ${afterPriority} → ${filtered.length} tasks`);
    
    const afterStatus = filtered.length;
    filtered = this.filterByPreferredStaff(filtered, filters.preferredStaffFilter);
    console.log(`  👤 Preferred Staff filter: ${afterStatus} → ${filtered.length} tasks`);
    
    console.log(`✅ [APPLY ALL FILTERS] Final result: ${filtered.length} tasks`);
    return filtered;
  }
}
