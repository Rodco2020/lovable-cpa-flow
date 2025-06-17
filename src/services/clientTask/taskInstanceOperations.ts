
/**
 * Client Task Service - Task Instance Operations
 * 
 * Handles operations specific to task instances (ad-hoc tasks)
 */

import { supabase } from '@/lib/supabaseClient';
import { TaskInstance } from '@/types/task';

export interface TaskInstanceWithClientInfo {
  taskInstance: TaskInstance;
  clientName: string;
  templateName: string;
}

/**
 * Get a task instance by ID
 */
export const getTaskInstanceById = async (taskId: string): Promise<TaskInstanceWithClientInfo | null> => {
  try {
    const { data, error } = await supabase
      .from('task_instances')
      .select(`
        *,
        clients!inner(legal_name),
        task_templates!inner(name)
      `)
      .eq('id', taskId)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching task instance:', error);
      throw error;
    }
    
    const taskInstance: TaskInstance = {
      id: data.id,
      templateId: data.template_id,
      clientId: data.client_id,
      name: data.name,
      description: data.description || '',
      estimatedHours: Number(data.estimated_hours),
      requiredSkills: data.required_skills || [],
      priority: data.priority,
      category: data.category,
      status: data.status,
      dueDate: data.due_date ? new Date(data.due_date) : null,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      notes: data.notes || undefined,
      recurringTaskId: data.recurring_task_id || undefined,
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      assignedStaffId: data.assigned_staff_id || undefined,
      scheduledStartTime: data.scheduled_start_time ? new Date(data.scheduled_start_time) : undefined,
      scheduledEndTime: data.scheduled_end_time ? new Date(data.scheduled_end_time) : undefined
    };
    
    return {
      taskInstance,
      clientName: data.clients.legal_name,
      templateName: data.task_templates.name
    };
  } catch (error) {
    console.error('Error in getTaskInstanceById:', error);
    throw error;
  }
};

/**
 * Fetch ad-hoc tasks (task instances without recurring_task_id) for a specific client
 */
export const getClientAdHocTasks = async (clientId: string): Promise<TaskInstanceWithClientInfo[]> => {
  try {
    const { data, error } = await supabase
      .from('task_instances')
      .select(`
        *,
        clients!inner(legal_name),
        task_templates!inner(name)
      `)
      .eq('client_id', clientId)
      .is('recurring_task_id', null)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching client ad-hoc tasks:', error);
      throw error;
    }
    
    return data.map(taskData => {
      const taskInstance: TaskInstance = {
        id: taskData.id,
        templateId: taskData.template_id,
        clientId: taskData.client_id,
        name: taskData.name,
        description: taskData.description || '',
        estimatedHours: Number(taskData.estimated_hours),
        requiredSkills: taskData.required_skills || [],
        priority: taskData.priority,
        category: taskData.category,
        status: taskData.status,
        dueDate: taskData.due_date ? new Date(taskData.due_date) : null,
        createdAt: new Date(taskData.created_at),
        updatedAt: new Date(taskData.updated_at),
        notes: taskData.notes || undefined,
        recurringTaskId: taskData.recurring_task_id || undefined,
        completedAt: taskData.completed_at ? new Date(taskData.completed_at) : undefined,
        assignedStaffId: taskData.assigned_staff_id || undefined,
        scheduledStartTime: taskData.scheduled_start_time ? new Date(taskData.scheduled_start_time) : undefined,
        scheduledEndTime: taskData.scheduled_end_time ? new Date(taskData.scheduled_end_time) : undefined
      };
      
      return {
        taskInstance,
        clientName: taskData.clients.legal_name,
        templateName: taskData.task_templates.name
      };
    });
  } catch (error) {
    console.error('Error in getClientAdHocTasks:', error);
    throw error;
  }
};
