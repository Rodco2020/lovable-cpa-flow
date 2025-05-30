
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface StatusFilterProps {
  value: 'Active' | 'Inactive' | undefined;
  onChange: (value: string) => void;
  availableStatuses: Array<'Active' | 'Inactive'>;
}

/**
 * Status Filter Component
 * 
 * Renders a dropdown for filtering by client status (Active/Inactive)
 * with validation to ensure only valid status values are displayed
 */
export const StatusFilter: React.FC<StatusFilterProps> = ({
  value,
  onChange,
  availableStatuses
}) => {
  // Comprehensive validation to prevent empty strings
  const validStatuses = React.useMemo(() => {
    console.log('Available statuses:', availableStatuses);
    if (!Array.isArray(availableStatuses)) return [];
    return availableStatuses.filter(status => 
      status && 
      typeof status === 'string' && 
      status.trim() !== '' &&
      (status === 'Active' || status === 'Inactive')
    );
  }, [availableStatuses]);

  return (
    <Select
      value={value || 'all'}
      onValueChange={onChange}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Filter by status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Statuses</SelectItem>
        {validStatuses.map((status) => (
          <SelectItem key={status} value={status}>
            {status}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
