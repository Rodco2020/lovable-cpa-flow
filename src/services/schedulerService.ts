
import { v4 as uuidv4 } from 'uuid';
import { add, set, format, addMinutes } from 'date-fns';
import { TaskInstance } from '@/types/task';
import { StaffMember, TimeSlot } from '@/types/staff';

// Alias for scheduleTasks for backward compatibility
export const scheduleTask = scheduleTasks;

/**
 * Schedules one or more tasks for staff members
 */
export async function scheduleTasks(
  taskIds: string[],
  staffId: string,
  startTime: Date,
  endTime: Date
): Promise<{ success: boolean, message: string }> {
  try {
    console.log(`Scheduling ${taskIds.length} tasks for staff ${staffId} from ${startTime} to ${endTime}`);
    
    // This would call the backend API to schedule tasks
    return {
      success: true,
      message: `${taskIds.length} tasks scheduled successfully`
    };
  } catch (error) {
    console.error("Error scheduling tasks:", error);
    return {
      success: false,
      message: "Failed to schedule tasks"
    };
  }
}

/**
 * Fetches unscheduled tasks
 */
export async function getUnscheduledTasks(): Promise<TaskInstance[]> {
  try {
    // Mock data for unscheduled tasks
    const tasks: TaskInstance[] = [];
    
    for (let i = 0; i < 10; i++) {
      tasks.push({
        id: uuidv4(),
        clientId: uuidv4(),
        name: `Task ${i + 1}`,
        description: `Description for task ${i + 1}`,
        templateId: uuidv4(),
        requiredSkills: ['Tax', 'Bookkeeping', 'Advisory', 'Audit'][i % 4],
        priority: ['Low', 'Medium', 'High', 'Urgent'][i % 4],
        estimatedHours: Math.floor(Math.random() * 8) + 1,
        status: 'Unscheduled',
        category: 'Tax',
        dueDate: add(new Date(), { days: Math.floor(Math.random() * 14) + 1 }),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    
    return tasks;
  } catch (error) {
    console.error("Error fetching unscheduled tasks:", error);
    return [];
  }
}

/**
 * Fetches staff schedule for a date range
 */
export async function getStaffSchedule(
  staffId: string,
  startDate: Date,
  endDate: Date
): Promise<TimeSlot[]> {
  try {
    const schedule: TimeSlot[] = [];
    const currentDate = new Date(startDate);
    
    // Create schedule for each day in the range
    while (currentDate <= endDate) {
      const dayStart = set(new Date(currentDate), { hours: 9, minutes: 0, seconds: 0 });
      let slotStart = dayStart;
      
      // Create slots for the day (9am to 5pm)
      for (let i = 0; i < 16; i++) { // 30-minute slots for 8 hours
        const slotEnd = addMinutes(slotStart, 30);
        const isAvailable = Math.random() > 0.3; // 70% chance of availability
        
        schedule.push({
          id: uuidv4(),
          staffId,
          startTime: slotStart,
          endTime: slotEnd,
          isAvailable,
          taskId: isAvailable ? undefined : (Math.random() > 0.5 ? uuidv4() : undefined)
        });
        
        slotStart = slotEnd;
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return schedule;
  } catch (error) {
    console.error("Error fetching staff schedule:", error);
    return [];
  }
}

// Added missing functions used by components
export const getUnscheduledTaskInstances = getUnscheduledTasks;

