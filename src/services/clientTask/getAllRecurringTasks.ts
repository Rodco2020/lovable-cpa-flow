
/**
 * Client Task Service - Get All Recurring Tasks
 * 
 * Handles fetching all recurring tasks across the system
 */

import { supabase } from '@/lib/supabaseClient';
import { RecurringTask } from '@/types/task';
import { mapDatabaseToRecurringTask } from './mappers';

/**
 * Fetch all recurring tasks in the system
 * Returns RecurringTask[] (application-level interface)
 */
export const getAllRecurringTasks = async (activeOnly: boolean = true): Promise<RecurringTask[]> => {
  try {
    console.log('🔍 [GET ALL RECURRING TASKS] Fetching recurring tasks:', { activeOnly });
    
    let query = supabase
      .from('recurring_tasks')
      .select(`
        *,
        clients!inner(
          id,
          legal_name
        ),
        staff(
          id,
          full_name,
          role_title
        )
      `)
      .order('created_at', { ascending: false });
    
    if (activeOnly) {
      query = query.eq('is_active', true);
    }
    
    const { data, error } = await query;
      
    if (error) {
      console.error('❌ [GET ALL RECURRING TASKS] Error fetching recurring tasks:', error);
      throw error;
    }
    
    console.log('✅ [GET ALL RECURRING TASKS] Raw database results:', {
      totalCount: data?.length || 0,
      sampleTask: data?.[0] ? {
        id: data[0].id,
        name: data[0].name,
        estimated_hours: data[0].estimated_hours,
        recurrence_type: data[0].recurrence_type,
        preferred_staff_id: data[0].preferred_staff_id,
        client_id: data[0].client_id
      } : null
    });
    
    // Map the database results to our RecurringTask type
    const mappedTasks = data?.map(mapDatabaseToRecurringTask) || [];
    
    console.log('✅ [GET ALL RECURRING TASKS] Mapped to RecurringTask[]:', {
      mappedCount: mappedTasks.length,
      sampleMapped: mappedTasks[0] ? {
        id: mappedTasks[0].id,
        name: mappedTasks[0].name,
        estimatedHours: mappedTasks[0].estimatedHours,
        recurrenceType: mappedTasks[0].recurrencePattern?.type,
        preferredStaffId: mappedTasks[0].preferredStaffId,
        clientId: mappedTasks[0].clientId
      } : null
    });
    
    return mappedTasks;
  } catch (error) {
    console.error('❌ [GET ALL RECURRING TASKS] Error in getAllRecurringTasks:', error);
    throw error;
  }
};
