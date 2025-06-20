
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface PreferredStaffFilterSectionProps {
  selectedPreferredStaff: string[];
  onPreferredStaffToggle: (staffId: string) => void;
  availablePreferredStaff: Array<{ id: string; name: string }>;
  isAllSelected: boolean;
  filterMode: 'all' | 'specific' | 'none';
  onFilterModeChange: (mode: 'all' | 'specific' | 'none') => void;
  isLoading?: boolean;
}

export const PreferredStaffFilterSection: React.FC<PreferredStaffFilterSectionProps> = ({
  selectedPreferredStaff,
  onPreferredStaffToggle,
  availablePreferredStaff,
  isAllSelected,
  filterMode,
  onFilterModeChange,
  isLoading = false
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium">Preferred Staff Filter</h4>
        <Badge variant="outline">
          {filterMode === 'all' ? 'All' : 
           filterMode === 'none' ? 'None' : 
           `${selectedPreferredStaff.length}/${availablePreferredStaff.length}`}
        </Badge>
      </div>
      
      <div className="space-y-4">
        {/* Filter Mode Selection */}
        <RadioGroup value={filterMode} onValueChange={onFilterModeChange}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="all" />
            <Label htmlFor="all" className="text-sm font-normal">
              All tasks (regardless of staff assignment)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="specific" id="specific" />
            <Label htmlFor="specific" className="text-sm font-normal">
              Only tasks assigned to selected staff
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="none" id="none" />
            <Label htmlFor="none" className="text-sm font-normal">
              Only unassigned tasks
            </Label>
          </div>
        </RadioGroup>

        {/* Staff Selection (only visible in specific mode) */}
        {filterMode === 'specific' && (
          <div className="space-y-2 border-t pt-3">
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Loading preferred staff...</div>
            ) : (
              availablePreferredStaff.map((staff) => (
                <div key={staff.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={staff.id}
                    checked={selectedPreferredStaff.includes(staff.id)}
                    onCheckedChange={() => onPreferredStaffToggle(staff.id)}
                  />
                  <Label htmlFor={staff.id} className="text-sm font-normal">
                    {staff.name}
                  </Label>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
