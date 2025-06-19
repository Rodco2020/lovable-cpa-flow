
import React from 'react';
import { Check, ChevronDown, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PreferredStaffOption {
  id: string;
  name: string;
}

interface PreferredStaffFilterProps {
  availablePreferredStaff: PreferredStaffOption[];
  selectedPreferredStaff: string[];
  onPreferredStaffToggle: (staffId: string) => void;
  isAllPreferredStaffSelected: boolean;
  className?: string;
}

/**
 * Preferred Staff Filter Component
 * 
 * Provides a dropdown filter for selecting preferred staff members in the demand matrix.
 * Follows the same design patterns as existing skill and client filters.
 */
export const PreferredStaffFilter: React.FC<PreferredStaffFilterProps> = ({
  availablePreferredStaff,
  selectedPreferredStaff,
  onPreferredStaffToggle,
  isAllPreferredStaffSelected,
  className
}) => {
  // Handle "Select All" / "Deselect All" toggle
  const handleSelectAllToggle = () => {
    if (isAllPreferredStaffSelected) {
      // Deselect all - clear selections
      selectedPreferredStaff.forEach(staffId => {
        onPreferredStaffToggle(staffId);
      });
    } else {
      // Select all - add any missing staff
      availablePreferredStaff.forEach(staff => {
        if (!selectedPreferredStaff.includes(staff.id)) {
          onPreferredStaffToggle(staff.id);
        }
      });
    }
  };

  // Get display text for the trigger button
  const getDisplayText = () => {
    if (availablePreferredStaff.length === 0) {
      return 'No Preferred Staff';
    }
    
    if (selectedPreferredStaff.length === 0) {
      return 'Select Preferred Staff';
    }
    
    if (isAllPreferredStaffSelected) {
      return 'All Preferred Staff';
    }
    
    if (selectedPreferredStaff.length === 1) {
      const staff = availablePreferredStaff.find(s => s.id === selectedPreferredStaff[0]);
      return staff?.name || 'Unknown Staff';
    }
    
    return `${selectedPreferredStaff.length} Staff Selected`;
  };

  console.log(`👥 [PREFERRED STAFF FILTER] Rendering filter:`, {
    availableCount: availablePreferredStaff.length,
    selectedCount: selectedPreferredStaff.length,
    isAllSelected: isAllPreferredStaffSelected,
    displayText: getDisplayText()
  });

  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      <label className="text-sm font-medium text-gray-700">
        Preferred Staff
      </label>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className={cn(
              "w-full justify-between bg-white hover:bg-gray-50 border-gray-200",
              "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
              selectedPreferredStaff.length > 0 && "border-blue-300 bg-blue-50"
            )}
            disabled={availablePreferredStaff.length === 0}
          >
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="truncate">{getDisplayText()}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              {selectedPreferredStaff.length > 0 && !isAllPreferredStaffSelected && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {selectedPreferredStaff.length}
                </Badge>
              )}
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          className="w-80 max-h-80 overflow-y-auto bg-white border border-gray-200 shadow-lg z-50"
          align="start"
        >
          {availablePreferredStaff.length === 0 ? (
            <DropdownMenuItem disabled className="text-gray-500 italic">
              No preferred staff available
            </DropdownMenuItem>
          ) : (
            <>
              {/* Select All / Deselect All Option */}
              <DropdownMenuItem
                onClick={handleSelectAllToggle}
                className="flex items-center space-x-2 hover:bg-gray-100 cursor-pointer"
              >
                <div className={cn(
                  "flex h-4 w-4 items-center justify-center border border-gray-300 rounded",
                  isAllPreferredStaffSelected && "bg-blue-600 border-blue-600"
                )}>
                  {isAllPreferredStaffSelected && <Check className="h-3 w-3 text-white" />}
                </div>
                <span className="font-medium">
                  {isAllPreferredStaffSelected ? 'Deselect All' : 'Select All'}
                </span>
                <span className="text-gray-500 text-sm">
                  ({availablePreferredStaff.length})
                </span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />

              {/* Individual Staff Options */}
              {availablePreferredStaff.map((staff) => {
                const isSelected = selectedPreferredStaff.includes(staff.id);
                
                return (
                  <DropdownMenuItem
                    key={staff.id}
                    onClick={() => onPreferredStaffToggle(staff.id)}
                    className="flex items-center space-x-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <div className={cn(
                      "flex h-4 w-4 items-center justify-center border border-gray-300 rounded",
                      isSelected && "bg-blue-600 border-blue-600"
                    )}>
                      {isSelected && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <span className="truncate" title={staff.name}>
                      {staff.name}
                    </span>
                  </DropdownMenuItem>
                );
              })}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Selection Summary */}
      {selectedPreferredStaff.length > 0 && (
        <div className="text-xs text-gray-600">
          {isAllPreferredStaffSelected 
            ? `Showing tasks for all ${availablePreferredStaff.length} preferred staff members`
            : `Showing tasks for ${selectedPreferredStaff.length} of ${availablePreferredStaff.length} preferred staff members`
          }
        </div>
      )}
    </div>
  );
};

export default PreferredStaffFilter;
