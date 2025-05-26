
/**
 * Client Task Service Types
 * 
 * Type definitions for client task operations
 */

export interface RecurringTaskData {
  id: string;
  templateId: string;
  clientId: string;
  name: string;
  description: string;
  estimatedHours: number;
  requiredSkills: string[];
  priority: string;
  category: string;
  status: string;
  dueDate: Date | null;
  recurrencePattern: any;
  lastGeneratedDate: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

export interface TaskInstanceData {
  id: string;
  templateId: string;
  clientId: string;
  name: string;
  description: string;
  estimatedHours: number;
  requiredSkills: string[];
  priority: string;
  category: string;
  status: string;
  dueDate: Date | null;
  completedAt?: Date;
  assignedStaffId?: string;
  scheduledStartTime?: Date;
  scheduledEndTime?: Date;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
  recurringTaskId?: string;
}
