
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StaffOption } from '@/types/staffOption';

interface StaffLiaisonFilterProps {
  value: string | undefined;
  onChange: (value: string) => void;
  staffOptions: StaffOption[];
  isLoading?: boolean;
}

/**
 * Staff Liaison Filter Component
 * 
 * Renders a dropdown for filtering by staff liaison with enhanced validation
 * and performance optimizations for better reliability
 */
export const StaffLiaisonFilter: React.FC<StaffLiaisonFilterProps> = ({
  value,
  onChange,
  staffOptions,
  isLoading = false
}) => {
  // Enhanced validation to prevent empty strings and ensure data integrity
  const validStaffOptions = React.useMemo(() => {
    console.log('StaffLiaisonFilter: Processing staff options:', staffOptions?.length || 0);
    
    if (!Array.isArray(staffOptions)) {
      console.warn('StaffLiaisonFilter: staffOptions is not an array');
      return [];
    }
    
    const filtered = staffOptions.filter(staff => 
      staff && 
      typeof staff === 'object' && 
      staff.id && 
      typeof staff.id === 'string' && 
      staff.id.trim() !== '' &&
      staff.full_name &&
      typeof staff.full_name === 'string' &&
      staff.full_name.trim() !== ''
    );
    
    console.log(`StaffLiaisonFilter: ${filtered.length} valid staff options after filtering`);
    return filtered;
  }, [staffOptions]);

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Loading staff..." />
        </SelectTrigger>
      </Select>
    );
  }

  if (validStaffOptions.length === 0) {
    return (
      <Select disabled>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="No staff available" />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select
      value={value || 'all'}
      onValueChange={onChange}
      disabled={isLoading}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Filter by staff liaison" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Staff</SelectItem>
        {validStaffOptions.map((staff) => (
          <SelectItem key={staff.id} value={staff.id}>
            {staff.full_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
