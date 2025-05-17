
import { RecurringTask } from '@/types/task';
import { StaffMember } from '@/types/staff';
import { estimateRecurringTaskInstances, validateForecastSystem } from '@/services/forecastingService';

// Check for invalid recurrence patterns in tasks
export const validateRecurrenceTasks = async (tasks: RecurringTask[]): Promise<string[]> => {
  const issues: string[] = [];
  
  tasks.forEach(task => {
    // Check required fields based on recurrence type
    switch (task.recurrencePattern.type) {
      case 'Weekly':
        if (!task.recurrencePattern.weekdays || task.recurrencePattern.weekdays.length === 0) {
          issues.push(`Task ${task.name} (${task.id}): Weekly recurrence missing weekdays`);
        }
        break;
        
      case 'Monthly':
        if (!task.recurrencePattern.dayOfMonth) {
          issues.push(`Task ${task.name} (${task.id}): Monthly recurrence missing day of month`);
        }
        break;
        
      case 'Custom':
        if (!task.recurrencePattern.customOffsetDays) {
          issues.push(`Task ${task.name} (${task.id}): Custom recurrence missing offset days`);
        }
        break;
    }
    
    // Check for conflicts between end date and due date
    if (task.endDate && task.dueDate && task.endDate < task.dueDate) {
      issues.push(`Task ${task.name} (${task.id}): End date is before due date`);
    }
    
    // Check for tasks with active status but past end date
    if (task.isActive && task.endDate && task.endDate < new Date()) {
      issues.push(`Task ${task.name} (${task.id}): Task is active but end date has passed`);
    }
  });
  
  return issues;
};

// Check for staff with missing skills
export const validateStaffSkills = async (staff: StaffMember[], requiredSkills: string[]): Promise<string[]> => {
  const issues: string[] = [];
  
  // Find all unique skills across all tasks
  const allSkills = new Set(requiredSkills);
  
  // Check if each skill has at least one staff member
  allSkills.forEach(skill => {
    const staffWithSkill = staff.filter(s => 
      s.skills.includes(skill) && s.status === 'Active'
    );
    
    if (staffWithSkill.length === 0) {
      issues.push(`No active staff found with skill: ${skill}`);
    }
  });
  
  return issues;
};

// Run a full forecast system validation
export const runForecastValidation = async (): Promise<{
  isValid: boolean;
  issues: string[];
}> => {
  // Call the service function
  const issues = await validateForecastSystem();
  
  return {
    isValid: issues.length === 0,
    issues
  };
};
