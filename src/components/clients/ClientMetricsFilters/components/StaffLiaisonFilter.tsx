
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
 * Renders a dropdown for filtering by staff liaison with validation
 * to ensure only valid staff options are displayed
 */
export const StaffLiaisonFilter: React.FC<StaffLiaisonFilterProps> = ({
  value,
  onChange,
  staffOptions,
  isLoading = false
}) => {
  // Comprehensive validation to prevent empty strings
  const validStaffOptions = React.useMemo(() => {
    console.log('Available staff options:', staffOptions);
    if (!Array.isArray(staffOptions)) return [];
    return staffOptions.filter(staff => 
      staff && 
      typeof staff === 'object' && 
      staff.id && 
      typeof staff.id === 'string' && 
      staff.id.trim() !== '' &&
      staff.full_name &&
      typeof staff.full_name === 'string' &&
      staff.full_name.trim() !== ''
    );
  }, [staffOptions]);

  if (validStaffOptions.length === 0) {
    return null;
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
