
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Download, RotateCcw, Users, AlertCircle, RefreshCw, Printer } from 'lucide-react';
import { SkillType } from '@/types/task';

interface PreferredStaffOption {
  id: string;
  name: string;
}

interface DemandMatrixControlsProps {
  selectedSkills: SkillType[];
  selectedClients: string[];
  selectedPreferredStaff: string[]; // Phase 2: Add preferred staff props
  onSkillToggle: (skill: SkillType) => void;
  onClientToggle: (clientId: string) => void;
  onPreferredStaffToggle: (staffId: string) => void; // Phase 2: Add preferred staff handler
  monthRange: { start: number; end: number };
  onMonthRangeChange: (monthRange: { start: number; end: number }) => void;
  onExport: () => void;
  onPrintExport: () => void; // Add missing onPrintExport prop
  onReset: () => void;
  groupingMode: 'skill' | 'client';
  availableSkills: SkillType[];
  availableClients: Array<{ id: string; name: string }>;
  
  // Phase 2: Add preferred staff props
  availablePreferredStaff: PreferredStaffOption[];
  preferredStaffLoading: boolean;
  preferredStaffError: string | null;
  isAllPreferredStaffSelected: boolean;
  onRetryPreferredStaff?: () => void;
  
  className?: string;
}

export const DemandMatrixControls: React.FC<DemandMatrixControlsProps> = ({
  selectedSkills,
  selectedClients,
  selectedPreferredStaff, // Phase 2: Add preferred staff state
  onSkillToggle,
  onClientToggle,
  onPreferredStaffToggle, // Phase 2: Add preferred staff handler
  monthRange,
  onMonthRangeChange,
  onExport,
  onPrintExport, // Add missing onPrintExport prop
  onReset,
  groupingMode,
  availableSkills,
  availableClients,
  
  // Phase 2: Destructure preferred staff props
  availablePreferredStaff,
  preferredStaffLoading,
  preferredStaffError,
  isAllPreferredStaffSelected,
  onRetryPreferredStaff,
  
  className
}) => {
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const handleSelectAllSkills = () => {
    if (selectedSkills.length === availableSkills.length) {
      // Deselect all
      availableSkills.forEach(onSkillToggle);
    } else {
      // Select all
      availableSkills.filter(skill => !selectedSkills.includes(skill)).forEach(onSkillToggle);
    }
  };

  const handleSelectAllClients = () => {
    if (selectedClients.length === availableClients.length) {
      // Deselect all
      availableClients.forEach(client => onClientToggle(client.id));
    } else {
      // Select all
      availableClients.filter(client => !selectedClients.includes(client.id)).forEach(client => onClientToggle(client.id));
    }
  };

  // Phase 2: Add preferred staff select all handler with PHASE 1 LOGGING
  const handleSelectAllPreferredStaff = () => {
    console.log(`🎛️ [MATRIX CONTROLS] PHASE 1 LOGGING: Select All Preferred Staff clicked:`, {
      currentSelection: selectedPreferredStaff,
      currentSelectionTypes: selectedPreferredStaff.map(id => ({ id, type: typeof id })),
      availableStaff: availablePreferredStaff,
      availableStaffTypes: availablePreferredStaff.map(staff => ({ id: staff.id, type: typeof staff.id, name: staff.name })),
      isAllSelected: isAllPreferredStaffSelected,
      willDeselect: isAllPreferredStaffSelected
    });

    if (isAllPreferredStaffSelected) {
      // Deselect all
      console.log(`🎛️ [MATRIX CONTROLS] PHASE 1: Deselecting all ${availablePreferredStaff.length} staff members`);
      availablePreferredStaff.forEach(staff => {
        console.log(`🎛️ [MATRIX CONTROLS] PHASE 1: Deselecting staff:`, { id: staff.id, type: typeof staff.id, name: staff.name });
        onPreferredStaffToggle(staff.id);
      });
    } else {
      // Select all
      console.log(`🎛️ [MATRIX CONTROLS] PHASE 1: Selecting all unselected staff members`);
      availablePreferredStaff
        .filter(staff => {
          const isNotSelected = !selectedPreferredStaff.includes(staff.id);
          console.log(`🎛️ [MATRIX CONTROLS] PHASE 1: Staff ${staff.name} (${staff.id}) - currently selected: ${!isNotSelected}`);
          return isNotSelected;
        })
        .forEach(staff => {
          console.log(`🎛️ [MATRIX CONTROLS] PHASE 1: Selecting staff:`, { id: staff.id, type: typeof staff.id, name: staff.name });
          onPreferredStaffToggle(staff.id);
        });
    }
  };

  // PHASE 1 LOGGING: Enhanced preferred staff toggle handler
  const handlePreferredStaffToggleWithLogging = (staffId: string) => {
    const staff = availablePreferredStaff.find(s => s.id === staffId);
    const isCurrentlySelected = selectedPreferredStaff.includes(staffId);
    
    console.log(`🎛️ [MATRIX CONTROLS] PHASE 1 LOGGING: Individual staff toggle:`, {
      staffId,
      staffIdType: typeof staffId,
      staffName: staff?.name || 'Unknown',
      isCurrentlySelected,
      willBecome: isCurrentlySelected ? 'deselected' : 'selected',
      currentFullSelection: selectedPreferredStaff,
      currentSelectionTypes: selectedPreferredStaff.map(id => ({ id, type: typeof id }))
    });

    onPreferredStaffToggle(staffId);
  };

  const handleMonthRangeSliderChange = (values: number[]) => {
    onMonthRangeChange({ start: values[0], end: values[1] });
  };

  // PHASE 1 LOGGING: Log component render state
  console.log(`🎛️ [MATRIX CONTROLS] PHASE 1 LOGGING: Component render state:`, {
    selectedPreferredStaffCount: selectedPreferredStaff.length,
    selectedPreferredStaff: selectedPreferredStaff,
    selectedPreferredStaffTypes: selectedPreferredStaff.map(id => ({ id, type: typeof id })),
    availablePreferredStaffCount: availablePreferredStaff.length,
    availablePreferredStaff: availablePreferredStaff.map(staff => ({ id: staff.id, type: typeof staff.id, name: staff.name })),
    isAllPreferredStaffSelected,
    preferredStaffLoading,
    preferredStaffError
  });

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Matrix Controls</CardTitle>
          <Button 
            onClick={onReset} 
            variant="outline" 
            size="sm"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Month Range */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Time Period</label>
            <span className="text-xs text-muted-foreground">
              {monthNames[monthRange.start]} - {monthNames[monthRange.end]}
            </span>
          </div>
          <Slider
            value={[monthRange.start, monthRange.end]}
            onValueChange={handleMonthRangeSliderChange}
            max={11}
            min={0}
            step={1}
            className="mb-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Jan</span>
            <span>Dec</span>
          </div>
        </div>

        <Separator />

        {/* Skills Filter */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium">Skills</label>
            <Button 
              onClick={handleSelectAllSkills}
              variant="ghost" 
              size="sm"
              className="text-xs"
            >
              {selectedSkills.length === availableSkills.length ? 'None' : 'All'}
            </Button>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {availableSkills.map((skill) => (
              <div key={skill} className="flex items-center space-x-2">
                <Checkbox
                  id={`skill-${skill}`}
                  checked={selectedSkills.includes(skill)}
                  onCheckedChange={() => onSkillToggle(skill)}
                />
                <label
                  htmlFor={`skill-${skill}`}
                  className="text-sm cursor-pointer flex-1 truncate"
                  title={skill}
                >
                  {skill}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Clients Filter */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium">Clients</label>
            <Button 
              onClick={handleSelectAllClients}
              variant="ghost" 
              size="sm"
              className="text-xs"
            >
              {selectedClients.length === availableClients.length ? 'None' : 'All'}
            </Button>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {availableClients.map((client) => (
              <div key={client.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`client-${client.id}`}
                  checked={selectedClients.includes(client.id)}
                  onCheckedChange={() => onClientToggle(client.id)}
                />
                <label
                  htmlFor={`client-${client.id}`}
                  className="text-sm cursor-pointer flex-1 truncate"
                  title={client.name}
                >
                  {client.name}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Phase 2: Preferred Staff Filter Section with PHASE 1 LOGGING */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <label 
                className="text-sm font-medium"
                id="preferred-staff-label"
              >
                Preferred Staff
              </label>
              {preferredStaffLoading && (
                <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />
              )}
            </div>
            <div className="flex items-center gap-1">
              {preferredStaffError && onRetryPreferredStaff && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={onRetryPreferredStaff}
                  className="text-xs h-auto p-1"
                  aria-label="Retry loading preferred staff"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry
                </Button>
              )}
              <Button 
                onClick={handleSelectAllPreferredStaff}
                variant="ghost" 
                size="sm"
                className="text-xs"
                disabled={preferredStaffLoading || availablePreferredStaff.length === 0}
                aria-label={isAllPreferredStaffSelected ? 'Deselect all preferred staff' : 'Select all preferred staff'}
              >
                {isAllPreferredStaffSelected ? 'None' : 'All'}
              </Button>
            </div>
          </div>

          {/* Preferred Staff Error State */}
          {preferredStaffError && (
            <div 
              className="text-xs text-destructive bg-destructive/10 p-2 rounded flex items-center gap-2 mb-2"
              role="alert"
              aria-live="polite"
            >
              <AlertCircle className="h-3 w-3 flex-shrink-0" />
              <span>Failed to load preferred staff: {preferredStaffError}</span>
            </div>
          )}

          {/* Preferred Staff Loading State */}
          {preferredStaffLoading && (
            <div className="space-y-2 mb-2" aria-live="polite" aria-label="Loading preferred staff">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-muted animate-pulse rounded" />
                  <div className="h-3 bg-muted animate-pulse rounded flex-1" />
                </div>
              ))}
            </div>
          )}

          {/* Preferred Staff List with PHASE 1 LOGGING */}
          {!preferredStaffLoading && !preferredStaffError && (
            <div 
              className="space-y-2 max-h-32 overflow-y-auto"
              role="group"
              aria-labelledby="preferred-staff-label"
            >
              {availablePreferredStaff.length === 0 ? (
                <div className="text-xs text-muted-foreground italic p-2 text-center">
                  No preferred staff available. Add staff members in the Staff module.
                </div>
              ) : (
                availablePreferredStaff.map((staff) => (
                  <div key={staff.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`preferred-staff-${staff.id}`}
                      checked={selectedPreferredStaff.includes(staff.id)}
                      onCheckedChange={() => handlePreferredStaffToggleWithLogging(staff.id)}
                      aria-describedby={`preferred-staff-${staff.id}-name`}
                    />
                    <label
                      htmlFor={`preferred-staff-${staff.id}`}
                      id={`preferred-staff-${staff.id}-name`}
                      className="text-sm cursor-pointer flex-1 truncate"
                      title={staff.name}
                    >
                      {staff.name}
                    </label>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Preferred Staff Selection Summary with PHASE 1 LOGGING */}
          {!preferredStaffLoading && (
            <div className="flex flex-wrap gap-1 mt-2">
              <div className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                {selectedPreferredStaff.length} of {availablePreferredStaff.length} selected
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Actions */}
        <div>
          <label className="text-sm font-medium mb-3 block">Actions</label>
          <div className="space-y-2">
            <Button 
              onClick={onExport} 
              variant="outline" 
              size="sm"
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button 
              onClick={onPrintExport} 
              variant="outline" 
              size="sm"
              className="w-full"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Export
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
