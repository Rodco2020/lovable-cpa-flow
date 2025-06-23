
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Eye, EyeOff, Users } from 'lucide-react';
import { useSelectAllLogic } from '@/components/forecasting/matrix/DemandMatrixControls/hooks/useSelectAllLogic';

interface PreferredStaffFilterSectionProps {
  selectedPreferredStaff: string[];
  setSelectedPreferredStaff: (staff: string[]) => void;
  availablePreferredStaff: Array<{ id: string; name: string; }>;
  isControlsExpanded: boolean;
}

export const PreferredStaffFilterSection: React.FC<PreferredStaffFilterSectionProps> = ({
  selectedPreferredStaff,
  setSelectedPreferredStaff,
  availablePreferredStaff,
  isControlsExpanded = true
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

  // Three-state selection logic
  const getSelectionState = () => {
    if (selectedPreferredStaff.length === 0) return 'all';
    if (selectedPreferredStaff.length === availablePreferredStaff.length) return 'selected';
    return 'partial';
  };

  const getSelectionLabel = () => {
    const state = getSelectionState();
    switch (state) {
      case 'all':
        return 'All Preferred Staff';
      case 'selected':
        return 'All Preferred Staff';
      case 'partial':
        return `${selectedPreferredStaff.length} of ${availablePreferredStaff.length} Staff`;
      default:
        return 'Preferred Staff';
    }
  };

  const getSelectionBadge = () => {
    const state = getSelectionState();
    switch (state) {
      case 'all':
        return <Badge variant="secondary" className="text-xs">All</Badge>;
      case 'selected':
        return <Badge variant="secondary" className="text-xs">All</Badge>;
      case 'partial':
        return <Badge variant="outline" className="text-xs">{selectedPreferredStaff.length}/{availablePreferredStaff.length}</Badge>;
      default:
        return null;
    }
  };

  if (availablePreferredStaff.length === 0) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            Preferred Staff
          </Label>
          <Badge variant="outline" className="text-xs">No staff assigned</Badge>
        </div>
        <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded">
          No tasks have preferred staff assignments
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            Preferred Staff
          </Label>
          {getSelectionBadge()}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSelectAll}
          className="h-6 px-2 text-xs flex items-center gap-1"
        >
          {isAllSelected ? (
            <>
              <EyeOff className="h-3 w-3" />
              Hide All
            </>
          ) : (
            <>
              <Eye className="h-3 w-3" />
              Show All
            </>
          )}
        </Button>
      </div>
      
      {isControlsExpanded && (
        <ScrollArea className="h-32">
          <div className="space-y-2 pr-2">
            {availablePreferredStaff.map((staff) => (
              <div key={staff.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`preferred-staff-${staff.id}`}
                  checked={isAllSelected || selectedPreferredStaff.includes(staff.id)}
                  onCheckedChange={() => handleStaffToggle(staff.id)}
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label
                        htmlFor={`preferred-staff-${staff.id}`}
                        className="text-sm cursor-pointer flex-1 truncate max-w-[180px]"
                      >
                        {staff.name}
                      </Label>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">{staff.name}</p>
                      <p className="text-xs text-muted-foreground">ID: {staff.id.slice(0, 8)}...</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
      
      {!isControlsExpanded && (
        <div className="text-xs text-muted-foreground">
          {getSelectionLabel()}
        </div>
      )}
    </div>
  );
};
