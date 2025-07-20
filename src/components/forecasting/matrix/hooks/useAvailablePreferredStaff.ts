
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { normalizeStaffId } from '@/utils/staffIdUtils';

interface PreferredStaffMember {
  id: string;
  name: string;
  roleTitle?: string;
}

/**
 * PHASE 2 FIX: Hook to fetch available preferred staff with normalized IDs
 * 
 * Enhanced with consistent staff ID normalization to prevent filtering mismatches
 */
export const useAvailablePreferredStaff = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['available-preferred-staff'],
    queryFn: async (): Promise<PreferredStaffMember[]> => {
      console.log('🔍 [PREFERRED STAFF HOOK] PHASE 2: Fetching with normalized staff IDs');

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
          .eq('status', 'active')
          .not('preferred_staff_id', 'is', null);

        if (tasksError) {
          console.error('❌ [PREFERRED STAFF HOOK] Error fetching tasks:', tasksError);
          throw tasksError;
        }

        if (!tasks || tasks.length === 0) {
          console.log('⚠️ [PREFERRED STAFF HOOK] No tasks with preferred staff found');
          return [];
        }

        console.log(`🔍 [PREFERRED STAFF HOOK] PHASE 2: Processing ${tasks.length} tasks with normalization`);

        // Extract unique staff members with normalized IDs
        const staffMap = new Map<string, PreferredStaffMember>();
        
        tasks.forEach((task, index) => {
          if (task.staff && task.preferred_staff_id) {
            const staff = Array.isArray(task.staff) ? task.staff[0] : task.staff;
            if (staff && staff.id && staff.full_name) {
              // PHASE 2 FIX: Use normalized staff ID
              const normalizedStaffId = normalizeStaffId(staff.id);
              
              if (normalizedStaffId) {
                console.log(`🔍 [PREFERRED STAFF HOOK] PHASE 2: Normalizing staff ${index + 1}:`, {
                  originalId: staff.id,
                  originalIdType: typeof staff.id,
                  normalizedId: normalizedStaffId,
                  name: staff.full_name
                });

                staffMap.set(normalizedStaffId, {
                  id: normalizedStaffId, // Use normalized ID consistently
                  name: staff.full_name,
                  roleTitle: staff.role_title || undefined
                });
              }
            }
          }
        });

        const uniqueStaff = Array.from(staffMap.values()).sort((a, b) => 
          a.name.localeCompare(b.name)
        );

        console.log(`✅ [PREFERRED STAFF HOOK] PHASE 2 COMPLETE: Found ${uniqueStaff.length} normalized staff members:`, 
          uniqueStaff.map(s => ({
            id: s.id,
            name: s.name,
            role: s.roleTitle || 'No title',
            idLength: s.id.length,
            isNormalized: s.id === s.id.toLowerCase()
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
