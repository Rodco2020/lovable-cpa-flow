
import { TaskTemplate, TaskPriority, TaskCategory } from '@/types/task';
import { AssignmentConfig } from '@/components/clients/TaskWizard/AssignmentConfiguration';

/**
 * Template Assignment Service Types
 * 
 * Defines the interfaces and types used throughout the template assignment process.
 */

export interface TemplateAssignment {
  templateId: string;
  clientIds: string[];
  config: AssignmentConfig;
}

export interface AssignmentResult {
  success: boolean;
  tasksCreated: number;
  errors: string[];
}

export interface AssignmentOperation {
  templateId: string;
  clientId: string;
  config: AssignmentConfig;
  templateData: any;
}
