
import { useQuery } from '@tanstack/react-query';
import { getActiveStaffForDropdown } from '@/services/staff/staffDropdownService';
import { StaffOption } from '@/types/staffOption';

/**
 * Preferred Staff Option interface for filtering
 */
export interface PreferredStaffOption {
  id: string;
  name: string;
}

/**
 * Hook for managing available preferred staff data
 * 
 * Fetches active staff members and provides them in a filter-friendly format
 * for the Demand Matrix preferred staff filtering functionality.
 */
export const useAvailablePreferredStaff = () => {
  const {
    data: staffData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['available-preferred-staff'],
    queryFn: async (): Promise<StaffOption[]> => {
      console.log('🔍 [PREFERRED STAFF] Fetching available staff for filtering');
      return await getActiveStaffForDropdown();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Transform staff data to filter-friendly format
  const availablePreferredStaff: PreferredStaffOption[] = (staffData || []).map(staff => ({
    id: staff.id,
    name: staff.full_name
  }));

  console.log('📊 [PREFERRED STAFF] Available staff data:', {
    isLoading,
    error: error?.message,
    staffCount: availablePreferredStaff.length,
    staffIds: availablePreferredStaff.map(s => s.id)
  });

  return {
    availablePreferredStaff,
    isLoading,
    error: error as Error | null,
    refetch
  };
};
