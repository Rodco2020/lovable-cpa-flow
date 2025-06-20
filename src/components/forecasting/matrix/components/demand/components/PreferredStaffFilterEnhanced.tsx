
import React from 'react';
import { Check, ChevronDown, Users, Globe, Target, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface PreferredStaffOption {
  id: string;
  name: string;
}

interface PreferredStaffFilterEnhancedProps {
  availablePreferredStaff: PreferredStaffOption[];
  selectedPreferredStaff: string[];
  onPreferredStaffToggle: (staffId: string) => void;
  preferredStaffFilterMode: 'all' | 'specific' | 'none';
  onPreferredStaffFilterModeChange: (mode: 'all' | 'specific' | 'none') => void;
  className?: string;
}

/**
 * Phase 3: Enhanced Preferred Staff Filter Component
 * 
 * Provides three distinct filtering modes with clear visual indicators:
 * - 'all' mode: Shows all tasks (with and without preferred staff)
 * - 'specific' mode: Shows only tasks assigned to selected preferred staff
 * - 'none' mode: Shows only tasks without preferred staff assignments
 */
export const PreferredStaffFilterEnhanced: React.FC<PreferredStaffFilterEnhancedProps> = ({
  availablePreferredStaff,
  selectedPreferredStaff,
  onPreferredStaffToggle,
  preferredStaffFilterMode,
  onPreferredStaffFilterModeChange,
  className
}) => {
  // Helper function to get mode icon with color
  const getModeIcon = (mode: 'all' | 'specific' | 'none', isActive = false) => {
    const iconClass = cn("h-4 w-4", {
      "text-green-600": mode === 'all' && isActive,
      "text-blue-600": mode === 'specific' && isActive,
      "text-orange-600": mode === 'none' && isActive,
      "text-gray-500": !isActive
    });

    switch (mode) {
      case 'all':
        return <Globe className={iconClass} />;
      case 'specific':
        return <Target className={iconClass} />;
      case 'none':
        return <UserX className={iconClass} />;
      default:
        return <Users className={iconClass} />;
    }
  };

  // Helper function to get mode description
  const getModeDescription = () => {
    switch (preferredStaffFilterMode) {
      case 'all':
        return `All Tasks (${availablePreferredStaff.length} staff available)`;
      case 'specific':
        return selectedPreferredStaff.length > 0 
          ? `${selectedPreferredStaff.length} Staff Selected`
          : 'Select Staff Members';
      case 'none':
        return 'Unassigned Tasks Only';
      default:
        return 'Select Filter Mode';
    }
  };

  // Helper function to get button variant based on mode
  const getButtonVariant = () => {
    switch (preferredStaffFilterMode) {
      case 'all':
        return "outline";
      case 'specific':
        return selectedPreferredStaff.length > 0 ? "default" : "outline";
      case 'none':
        return "outline";
      default:
        return "outline";
    }
  };

  console.log(`🎨 [ENHANCED PREFERRED STAFF FILTER] Phase 3 - Rendering enhanced filter:`, {
    availableCount: availablePreferredStaff.length,
    selectedCount: selectedPreferredStaff.length,
    currentMode: preferredStaffFilterMode,
    description: getModeDescription()
  });

  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      <Label className="text-sm font-medium text-gray-700">
        Preferred Staff Filter
      </Label>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant={getButtonVariant()}
            className={cn(
              "w-full justify-between bg-white hover:bg-gray-50 border-gray-200",
              "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
              preferredStaffFilterMode === 'all' && "border-green-300 bg-green-50",
              preferredStaffFilterMode === 'specific' && selectedPreferredStaff.length > 0 && "border-blue-300 bg-blue-50",
              preferredStaffFilterMode === 'none' && "border-orange-300 bg-orange-50"
            )}
          >
            <div className="flex items-center space-x-2">
              {getModeIcon(preferredStaffFilterMode, true)}
              <span className="truncate">{getModeDescription()}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-xs",
                  preferredStaffFilterMode === 'all' && "bg-green-100 text-green-800",
                  preferredStaffFilterMode === 'specific' && "bg-blue-100 text-blue-800",
                  preferredStaffFilterMode === 'none' && "bg-orange-100 text-orange-800"
                )}
              >
                {preferredStaffFilterMode.toUpperCase()}
              </Badge>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          className="w-80 max-h-96 overflow-y-auto bg-white border border-gray-200 shadow-lg z-50"
          align="start"
        >
          {/* Phase 3: Three Distinct Sections */}
          
          {/* Section 1: Show All */}
          <div className="p-2 bg-green-50 border-b border-green-200">
            <div className="text-xs font-semibold text-green-800 mb-1">SHOW ALL TASKS</div>
            <DropdownMenuItem
              onClick={() => onPreferredStaffFilterModeChange('all')}
              className={cn(
                "flex items-center space-x-3 hover:bg-green-100 cursor-pointer rounded p-2",
                preferredStaffFilterMode === 'all' && "bg-green-200 border border-green-400"
              )}
            >
              <div className={cn(
                "flex h-5 w-5 items-center justify-center border-2 rounded-full",
                preferredStaffFilterMode === 'all' ? "bg-green-600 border-green-600" : "border-green-400"
              )}>
                {preferredStaffFilterMode === 'all' && <Check className="h-3 w-3 text-white" />}
              </div>
              <Globe className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <div className="font-medium text-green-800">All Tasks</div>
                <div className="text-xs text-green-600">Shows tasks with and without preferred staff</div>
              </div>
            </DropdownMenuItem>
          </div>
          
          <DropdownMenuSeparator />

          {/* Section 2: Specific Staff */}
          <div className="p-2 bg-blue-50 border-b border-blue-200">
            <div className="text-xs font-semibold text-blue-800 mb-1">FILTER BY SPECIFIC STAFF</div>
            <DropdownMenuItem
              onClick={() => onPreferredStaffFilterModeChange('specific')}
              className={cn(
                "flex items-center space-x-3 hover:bg-blue-100 cursor-pointer rounded p-2",
                preferredStaffFilterMode === 'specific' && "bg-blue-200 border border-blue-400"
              )}
            >
              <div className={cn(
                "flex h-5 w-5 items-center justify-center border-2 rounded-full",
                preferredStaffFilterMode === 'specific' ? "bg-blue-600 border-blue-600" : "border-blue-400"
              )}>
                {preferredStaffFilterMode === 'specific' && <Check className="h-3 w-3 text-white" />}
              </div>
              <Target className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <div className="font-medium text-blue-800">Specific Staff</div>
                <div className="text-xs text-blue-600">Filter to selected staff members only</div>
              </div>
              {selectedPreferredStaff.length > 0 && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                  {selectedPreferredStaff.length}
                </Badge>
              )}
            </DropdownMenuItem>

            {/* Staff Selection (only shown when specific mode is active) */}
            {preferredStaffFilterMode === 'specific' && (
              <div className="mt-2 space-y-1 max-h-40 overflow-y-auto border rounded p-2 bg-white">
                {availablePreferredStaff.length === 0 ? (
                  <div className="text-xs text-gray-500 p-2 text-center italic">
                    No preferred staff available
                  </div>
                ) : (
                  availablePreferredStaff.map((staff) => {
                    const isSelected = selectedPreferredStaff.includes(staff.id);
                    
                    return (
                      <DropdownMenuItem
                        key={staff.id}
                        onClick={() => onPreferredStaffToggle(staff.id)}
                        className="flex items-center space-x-2 hover:bg-blue-50 cursor-pointer text-xs p-1 rounded"
                      >
                        <div className={cn(
                          "flex h-4 w-4 items-center justify-center border border-gray-300 rounded",
                          isSelected && "bg-blue-600 border-blue-600"
                        )}>
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <span className="truncate flex-1" title={staff.name}>
                          {staff.name}
                        </span>
                      </DropdownMenuItem>
                    );
                  })
                )}
              </div>
            )}
          </div>
          
          <DropdownMenuSeparator />

          {/* Section 3: No Preferred Staff */}
          <div className="p-2 bg-orange-50">
            <div className="text-xs font-semibold text-orange-800 mb-1">UNASSIGNED TASKS ONLY</div>
            <DropdownMenuItem
              onClick={() => onPreferredStaffFilterModeChange('none')}
              className={cn(
                "flex items-center space-x-3 hover:bg-orange-100 cursor-pointer rounded p-2",
                preferredStaffFilterMode === 'none' && "bg-orange-200 border border-orange-400"
              )}
            >
              <div className={cn(
                "flex h-5 w-5 items-center justify-center border-2 rounded-full",
                preferredStaffFilterMode === 'none' ? "bg-orange-600 border-orange-600" : "border-orange-400"
              )}>
                {preferredStaffFilterMode === 'none' && <Check className="h-3 w-3 text-white" />}
              </div>
              <UserX className="h-5 w-5 text-orange-600" />
              <div className="flex-1">
                <div className="font-medium text-orange-800">Unassigned Tasks</div>
                <div className="text-xs text-orange-600">Shows only tasks without preferred staff</div>
              </div>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Current Mode Status Indicator */}
      <div className={cn(
        "text-xs p-2 rounded border",
        preferredStaffFilterMode === 'all' && "bg-green-50 border-green-200 text-green-700",
        preferredStaffFilterMode === 'specific' && "bg-blue-50 border-blue-200 text-blue-700",
        preferredStaffFilterMode === 'none' && "bg-orange-50 border-orange-200 text-orange-700"
      )}>
        <div className="flex items-center gap-2">
          {getModeIcon(preferredStaffFilterMode, true)}
          <strong>Active:</strong> {getModeDescription()}
        </div>
      </div>
    </div>
  );
};

export default PreferredStaffFilterEnhanced;
