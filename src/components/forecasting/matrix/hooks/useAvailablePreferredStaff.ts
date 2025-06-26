
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PreferredStaffMember {
  id: string;
  name: string;
  roleTitle?: string;
}

/**
 * Hook to fetch available preferred staff from recurring tasks
 * 
 * This hook extracts unique preferred staff members from active recurring tasks
 * and provides them for the Preferred Staff filter in the demand matrix.
 */
export const useAvailablePreferredStaff = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['available-preferred-staff'],
    queryFn: async (): Promise<PreferredStaffMember[]> => {
      console.log('🔍 [PREFERRED STAFF HOOK] Fetching available preferred staff');

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

        // Extract unique staff members
        const staffMap = new Map<string, PreferredStaffMember>();
        
        tasks.forEach(task => {
          if (task.staff && task.preferred_staff_id) {
            const staff = Array.isArray(task.staff) ? task.staff[0] : task.staff;
            if (staff && staff.id && staff.full_name) {
              staffMap.set(staff.id, {
                id: staff.id,
                name: staff.full_name,
                roleTitle: staff.role_title || undefined
              });
            }
          }
        });

        const uniqueStaff = Array.from(staffMap.values()).sort((a, b) => 
          a.name.localeCompare(b.name)
        );

        console.log(`✅ [PREFERRED STAFF HOOK] Found ${uniqueStaff.length} preferred staff members:`, 
          uniqueStaff.map(s => `${s.name} (${s.roleTitle || 'No title'})`));

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
