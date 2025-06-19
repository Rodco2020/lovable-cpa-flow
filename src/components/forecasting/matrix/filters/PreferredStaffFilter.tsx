
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { StaffOption } from '@/types/staffOption';

interface PreferredStaffFilterProps {
  selectedStaffIds: string[];
  onStaffSelection: (staffIds: string[]) => void;
  includeUnassigned: boolean;
  onIncludeUnassignedChange: (include: boolean) => void;
  showOnlyPreferred: boolean;
  onShowOnlyPreferredChange: (showOnly: boolean) => void;
  staffOptions: StaffOption[];
  isLoading: boolean;
}

export const PreferredStaffFilter: React.FC<PreferredStaffFilterProps> = ({
  selectedStaffIds,
  onStaffSelection,
  includeUnassigned,
  onIncludeUnassignedChange,
  showOnlyPreferred,
  onShowOnlyPreferredChange,
  staffOptions,
  isLoading
}) => {
  const handleStaffToggle = (staffId: string) => {
    const isSelected = selectedStaffIds.includes(staffId);
    if (isSelected) {
      onStaffSelection(selectedStaffIds.filter(id => id !== staffId));
    } else {
      onStaffSelection([...selectedStaffIds, staffId]);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>Filter by Preferred Staff</Label>
        <div className="text-sm text-muted-foreground">Loading staff...</div>
      </div>
    );
  }

  if (!staffOptions || staffOptions.length === 0) {
    return (
      <div className="space-y-2">
        <Label>Filter by Preferred Staff</Label>
        <div className="text-sm text-muted-foreground">No staff available</div>
      </div>
    );
  }

  const validStaffOptions = staffOptions.filter(staff => staff.full_name && staff.full_name.trim().length > 0);

  return (
    <div className="space-y-4">
      <Label>Filter by Preferred Staff</Label>
      
      {/* Staff Selection */}
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {validStaffOptions.map(staff => (
          <Button
            key={staff.id}
            variant={selectedStaffIds.includes(staff.id) ? "default" : "outline"}
            size="sm"
            onClick={() => handleStaffToggle(staff.id)}
            className={`w-full justify-start text-left ${
              selectedStaffIds.includes(staff.id) ? 'selected' : ''
            }`}
          >
            {staff.full_name}
          </Button>
        ))}
      </div>

      {/* Options */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="include-unassigned"
            checked={includeUnassigned}
            onCheckedChange={onIncludeUnassignedChange}
          />
          <Label htmlFor="include-unassigned" className="text-sm">
            Include unassigned tasks
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="show-only-preferred"
            checked={showOnlyPreferred}
            onCheckedChange={onShowOnlyPreferredChange}
          />
          <Label htmlFor="show-only-preferred" className="text-sm">
            Show only tasks with preferred staff
          </Label>
        </div>
      </div>
    </div>
  );
};
