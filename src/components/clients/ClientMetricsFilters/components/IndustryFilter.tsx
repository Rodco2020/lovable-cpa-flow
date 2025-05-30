
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface IndustryFilterProps {
  value: string | undefined;
  onChange: (value: string) => void;
  availableIndustries: string[];
}

/**
 * Industry Filter Component
 * 
 * Renders a dropdown for filtering by industry with validation
 * to prevent empty string values from appearing in the dropdown
 */
export const IndustryFilter: React.FC<IndustryFilterProps> = ({
  value,
  onChange,
  availableIndustries
}) => {
  // Comprehensive validation to prevent empty strings
  const validIndustries = React.useMemo(() => {
    console.log('Available industries:', availableIndustries);
    if (!Array.isArray(availableIndustries)) return [];
    return availableIndustries.filter(industry => 
      industry && 
      typeof industry === 'string' && 
      industry.trim() !== ''
    );
  }, [availableIndustries]);

  return (
    <Select
      value={value || 'all'}
      onValueChange={onChange}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Filter by industry" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Industries</SelectItem>
        {validIndustries.map((industry) => (
          <SelectItem key={industry} value={industry}>
            {industry}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
