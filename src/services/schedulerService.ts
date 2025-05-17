import { v4 as uuidv4 } from 'uuid';
import { StaffMember } from '@/types/staff';
import { TaskInstance } from '@/types/task';
import { getUnscheduledTaskInstances } from '@/services/taskService';

// Simulated scheduling logic - replace with a real scheduling algorithm
export const scheduleTasks = async (staff: StaffMember[]): Promise<TaskInstance[]> => {
  const unscheduledTasks = await getUnscheduledTaskInstances();
  const scheduledTasks: TaskInstance[] = [];
  
  // Basic scheduling logic: assign tasks to the first available staff member
  for (const task of unscheduledTasks) {
    for (const member of staff) {
      // Check if the staff member has the required skills
      const hasSkills = task.requiredSkills.every(skill => member.skills.includes(skill));
      
      if (hasSkills) {
        // Assign the task to the staff member
        task.assignedStaffId = member.id;
        task.status = 'Scheduled';
        task.scheduledStartTime = new Date(); // Placeholder
        task.scheduledEndTime = new Date();   // Placeholder
        
        scheduledTasks.push(task);
        break; // Task assigned, move to the next task
      }
    }
  }
  
  return scheduledTasks;
};

export default {
  scheduleTasks
};
