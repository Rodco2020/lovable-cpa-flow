
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PreferredStaffMember {
  id: string;
  name: string;
  roleTitle?: string;
}

/**
 * INVESTIGATION FIX: Hook to fetch available preferred staff from recurring tasks
 * 
 * Enhanced with staff ID flow tracing to ensure consistent data types
 */
export const useAvailablePreferredStaff = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['available-preferred-staff'],
    queryFn: async (): Promise<PreferredStaffMember[]> => {
      console.log('🔍 [PREFERRED STAFF HOOK] INVESTIGATION: Fetching available preferred staff with ID tracing');

      try {
        // Query recurring tasks with their preferred staff information
        const { data: tasks, error: tasksError } = await supabase
          .from('recurring_tasks')
          .select(`
            preferred_staff_id,
            staff:preferred_staff_id (
              id,
              full_name,
              role_title
            )
          `)
          .eq('is_active', true)
          .not('preferred_staff_id', 'is', null);

        if (tasksError) {
          console.error('❌ [PREFERRED STAFF HOOK] Error fetching tasks:', tasksError);
          throw tasksError;
        }

        if (!tasks || tasks.length === 0) {
          console.log('⚠️ [PREFERRED STAFF HOOK] No tasks with preferred staff found');
          return [];
        }

        console.log(`🔍 [PREFERRED STAFF HOOK] INVESTIGATION: Raw task data:`, {
          totalTasks: tasks.length,
          sampleTask: tasks[0] ? {
            preferred_staff_id: tasks[0].preferred_staff_id,
            preferred_staff_id_type: typeof tasks[0].preferred_staff_id,
            staff_data: tasks[0].staff
          } : null
        });

        // Extract unique staff members with ID normalization
        const staffMap = new Map<string, PreferredStaffMember>();
        
        tasks.forEach((task, index) => {
          console.log(`🔍 [PREFERRED STAFF HOOK] Processing task ${index + 1}:`, {
            preferred_staff_id: task.preferred_staff_id,
            staff_data: task.staff
          });

          if (task.staff && task.preferred_staff_id) {
            const staff = Array.isArray(task.staff) ? task.staff[0] : task.staff;
            if (staff && staff.id && staff.full_name) {
              // INVESTIGATION FIX: Normalize staff ID to string for consistency
              const normalizedStaffId = String(staff.id).trim();
              
              console.log(`🔍 [PREFERRED STAFF HOOK] Adding staff member:`, {
                originalId: staff.id,
                normalizedId: normalizedStaffId,
                name: staff.full_name,
                role: staff.role_title
              });

              staffMap.set(normalizedStaffId, {
                id: normalizedStaffId, // Use normalized ID
                name: staff.full_name,
                roleTitle: staff.role_title || undefined
              });
            }
          }
        });

        const uniqueStaff = Array.from(staffMap.values()).sort((a, b) => 
          a.name.localeCompare(b.name)
        );

        console.log(`✅ [PREFERRED STAFF HOOK] INVESTIGATION COMPLETE: Found ${uniqueStaff.length} preferred staff members:`, 
          uniqueStaff.map(s => ({
            id: s.id,
            name: s.name,
            role: s.roleTitle || 'No title',
            idLength: s.id.length,
            idFormat: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s.id) ? 'UUID' : 'Other'
          })));

        return uniqueStaff;

      } catch (error) {
        console.error('❌ [PREFERRED STAFF HOOK] Failed to fetch preferred staff:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  return {
    availablePreferredStaff: data || [],
    isLoading,
    error,
    refetch
  };
};
