
import { supabase } from '@/integrations/supabase/client';
import { TaskInstance } from '@/types/task';
import { Database } from '@/types/supabase';

// Define a custom error class for consistency
class TaskServiceError extends Error {
  constructor(message: string, public code?: string, public details?: any) {
    super(message);
    this.name = 'TaskServiceError';
  }
}

type TaskInstanceRow = Database['public']['Tables']['task_instances']['Row'];

export interface TaskInstanceData {
  taskInstance: TaskInstance;
  clientName: string;
  templateName: string;
}

/**
 * Get task instance by ID with enhanced error handling
 */
export const getTaskInstanceById = async (instanceId: string): Promise<TaskInstanceData | null> => {
  try {
    console.log('Fetching task instance by ID:', instanceId);
    
    const { data, error } = await supabase
      .from('task_instances')
      .select(`
        *,
        clients!inner(legal_name),
        task_templates!inner(name)
      `)
      .eq('id', instanceId)
      .single();

    if (error) {
      console.error('Error fetching task instance:', error);
      throw new TaskServiceError(`Failed to fetch task instance: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return {
      taskInstance: mapTaskInstanceFromDB(data),
      clientName: (data.clients as any)?.legal_name || 'Unknown Client',
      templateName: (data.task_templates as any)?.name || 'Unknown Template'
    };
  } catch (error) {
    console.error('Failed to fetch task instance:', error);
    if (error instanceof TaskServiceError) {
      throw error;
    }
    throw new TaskServiceError('Unexpected error fetching task instance');
  }
};

/**
 * Get client ad-hoc tasks with enhanced error handling
 */
export const getClientAdHocTasks = async (clientId: string): Promise<TaskInstanceData[]> => {
  try {
    console.log('Fetching client ad-hoc tasks for client:', clientId);
    
    // Validate client exists first
    const { data: clientExists, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('id', clientId)
      .single();

    if (clientError || !clientExists) {
      throw new TaskServiceError(`Client with ID ${clientId} not found`);
    }

    const { data, error } = await supabase
      .from('task_instances')
      .select(`
        *,
        clients!inner(legal_name),
        task_templates!inner(name)
      `)
      .eq('client_id', clientId)
      .is('recurring_task_id', null) // Ad-hoc tasks don't have recurring_task_id
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching client ad-hoc tasks:', error);
      throw new TaskServiceError(`Failed to fetch client ad-hoc tasks: ${error.message}`);
    }

    const tasks = (data || []).map(row => ({
      taskInstance: mapTaskInstanceFromDB(row),
      clientName: (row.clients as any)?.legal_name || 'Unknown Client',
      templateName: (row.task_templates as any)?.name || 'Unknown Template'
    }));

    console.log(`Found ${tasks.length} ad-hoc tasks for client ${clientId}`);
    return tasks;
  } catch (error) {
    console.error('Failed to fetch client ad-hoc tasks:', error);
    if (error instanceof TaskServiceError) {
      throw error;
    }
    throw new TaskServiceError('Unexpected error fetching client ad-hoc tasks');
  }
};

/**
 * Helper function to map database rows to TaskInstance objects
 */
const mapTaskInstanceFromDB = (row: TaskInstanceRow): TaskInstance => ({
  id: row.id,
  templateId: row.template_id,
  clientId: row.client_id,
  name: row.name,
  description: row.description || '',
  estimatedHours: Number(row.estimated_hours),
  requiredSkills: row.required_skills || [],
  priority: row.priority as TaskInstance['priority'],
  category: row.category as TaskInstance['category'],
  status: row.status as TaskInstance['status'],
  dueDate: row.due_date ? new Date(row.due_date) : null,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
  notes: row.notes,
  recurringTaskId: row.recurring_task_id || undefined,
  completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
  assignedStaffId: row.assigned_staff_id || undefined,
  scheduledStartTime: row.scheduled_start_time ? new Date(row.scheduled_start_time) : undefined,
  scheduledEndTime: row.scheduled_end_time ? new Date(row.scheduled_end_time) : undefined
});
