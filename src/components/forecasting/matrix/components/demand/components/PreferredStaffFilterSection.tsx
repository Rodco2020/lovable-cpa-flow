
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useSelectAllLogic } from '@/components/forecasting/matrix/DemandMatrixControls/hooks/useSelectAllLogic';

interface PreferredStaffFilterSectionProps {
  selectedPreferredStaff: string[];
  setSelectedPreferredStaff: (staff: string[]) => void;
  availablePreferredStaff: Array<{ id: string; name: string; }>;
}

export const PreferredStaffFilterSection: React.FC<PreferredStaffFilterSectionProps> = ({
  selectedPreferredStaff,
  setSelectedPreferredStaff,
  availablePreferredStaff
}) => {
  // Extract staff IDs for the select all logic
  const staffIds = availablePreferredStaff.map(staff => staff.id);
  
  const { isAllSelected, handleSelectAll } = useSelectAllLogic({
    selectedItems: selectedPreferredStaff,
    setSelectedItems: setSelectedPreferredStaff,
    availableItems: staffIds,
    itemType: 'preferred staff'
  });

  const handleStaffToggle = (staffId: string) => {
    setSelectedPreferredStaff(
      selectedPreferredStaff.includes(staffId)
        ? selectedPreferredStaff.filter(id => id !== staffId)
        : [...selectedPreferredStaff, staffId]
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Preferred Staff</Label>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSelectAll}
          className="text-xs"
        >
          {isAllSelected ? 'Deselect All' : 'Select All'}
        </Button>
      </div>
      
      <ScrollArea className="h-32">
        <div className="space-y-2">
          {availablePreferredStaff.map((staff) => (
            <div key={staff.id} className="flex items-center space-x-2">
              <Checkbox
                id={`preferred-staff-${staff.id}`}
                checked={selectedPreferredStaff.includes(staff.id)}
                onCheckedChange={() => handleStaffToggle(staff.id)}
              />
              <Label
                htmlFor={`preferred-staff-${staff.id}`}
                className="text-sm cursor-pointer"
              >
                {staff.name}
              </Label>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
