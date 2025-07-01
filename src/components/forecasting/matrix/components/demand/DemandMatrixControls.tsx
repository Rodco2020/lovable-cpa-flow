
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { SkillType } from '@/types/task';
import { 
  Eye, EyeOff, Download, Printer, RotateCcw, 
  RefreshCw, AlertCircle, Calendar, Filter
} from 'lucide-react';

// Phase 2: Add preferred staff interface
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
  onPrintExport: () => void;
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
}

/**
 * FIXED: Demand Matrix Controls Component
 * Now properly handles data extraction and empty states
 */
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
  onPrintExport,
  onReset,
  groupingMode,
  availableSkills,
  availableClients,
  
  // Phase 2: Destructure preferred staff props
  availablePreferredStaff,
  preferredStaffLoading,
  preferredStaffError,
  isAllPreferredStaffSelected,
  onRetryPreferredStaff
}) => {
  console.log('🎛️ [DEMAND MATRIX CONTROLS] Rendering with data:', {
    availableSkills: availableSkills.length,
    availableClients: availableClients.length,
    selectedSkills: selectedSkills.length,
    selectedClients: selectedClients.length,
    groupingMode
  });

  // FIXED: Skills filter section with proper empty state handling
  const handleSelectAllSkills = (): void => {
    if (selectedSkills.length === availableSkills.length) {
      // Deselect all
      availableSkills.forEach(skill => onSkillToggle(skill));
    } else {
      // Select all missing skills
      availableSkills.forEach(skill => {
        if (!selectedSkills.includes(skill)) {
          onSkillToggle(skill);
        }
      });
    }
  };

  // FIXED: Clients filter section with proper empty state handling
  const handleSelectAllClients = (): void => {
    if (selectedClients.length === availableClients.length) {
      // Deselect all
      availableClients.forEach(client => onClientToggle(client.id));
    } else {
      // Select all missing clients
      availableClients.forEach(client => {
        if (!selectedClients.includes(client.id)) {
          onClientToggle(client.id);
        }
      });
    }
  };

  // Phase 2: Preferred staff filter section
  const handleSelectAllPreferredStaff = (): void => {
    if (selectedPreferredStaff.length === availablePreferredStaff.length) {
      // Deselect all
      availablePreferredStaff.forEach(staff => onPreferredStaffToggle(staff.id));
    } else {
      // Select all missing staff
      availablePreferredStaff.forEach(staff => {
        if (!selectedPreferredStaff.includes(staff.id)) {
          onPreferredStaffToggle(staff.id);
        }
      });
    }
  };

  // Enhanced validation for empty states
  const hasValidSkills = availableSkills && availableSkills.length > 0;
  const hasValidClients = availableClients && availableClients.length > 0;
  const hasValidPreferredStaff = availablePreferredStaff && availablePreferredStaff.length > 0;
  const allSkillsSelected = hasValidSkills && selectedSkills.length === availableSkills.length;
  const allClientsSelected = hasValidClients && selectedClients.length === availableClients.length;

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Demand Matrix Controls</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onReset}
            className="text-xs"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Month Range Section */}
        <div className="space-y-3">
          <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Time Period
          </Label>
          <div className="text-xs text-muted-foreground">
            Showing months {monthRange.start + 1} to {monthRange.end + 1}
          </div>
        </div>

        <Separator />

        {/* FIXED: Skills Filter Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Filter className="h-3 w-3" />
              Skills Filter
            </Label>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSelectAllSkills}
              className="text-xs h-auto p-1"
              disabled={!hasValidSkills}
            >
              {allSkillsSelected ? (
                <>
                  <EyeOff className="h-3 w-3 mr-1" />
                  Hide All
                </>
              ) : (
                <>
                  <Eye className="h-3 w-3 mr-1" />
                  Show All
                </>
              )}
            </Button>
          </div>
          
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {!hasValidSkills ? (
              <div className="text-xs text-muted-foreground italic flex items-center gap-2">
                <AlertCircle className="h-3 w-3" />
                Loading skills from demand data...
              </div>
            ) : (
              availableSkills.map((skill) => (
                <div key={skill} className="flex items-center space-x-2">
                  <Checkbox
                    id={`skill-${skill}`}
                    checked={selectedSkills.includes(skill)}
                    onCheckedChange={() => onSkillToggle(skill)}
                  />
                  <Label
                    htmlFor={`skill-${skill}`}
                    className="text-xs flex-1 cursor-pointer"
                    title={skill}
                  >
                    {skill}
                  </Label>
                </div>
              ))
            )}
          </div>
          
          <div className="flex flex-wrap gap-1">
            <Badge variant="outline" className="text-xs">
              {selectedSkills.length} of {availableSkills.length} selected
            </Badge>
            {hasValidSkills && (
              <Badge variant="secondary" className="text-xs">
                Resolved
              </Badge>
            )}
            {!hasValidSkills && (
              <Badge variant="destructive" className="text-xs">
                Loading
              </Badge>
            )}
          </div>
        </div>

        <Separator />

        {/* FIXED: Clients Filter Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Filter className="h-3 w-3" />
              Clients Filter
            </Label>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSelectAllClients}
              className="text-xs h-auto p-1"
              disabled={!hasValidClients}
            >
              {allClientsSelected ? (
                <>
                  <EyeOff className="h-3 w-3 mr-1" />
                  Hide All
                </>
              ) : (
                <>
                  <Eye className="h-3 w-3 mr-1" />
                  Show All
                </>
              )}
            </Button>
          </div>
          
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {!hasValidClients ? (
              <div className="text-xs text-muted-foreground italic flex items-center gap-2">
                <AlertCircle className="h-3 w-3" />
                Loading clients from demand data...
              </div>
            ) : (
              availableClients.map((client) => (
                <div key={client.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`client-${client.id}`}
                    checked={selectedClients.includes(client.id)}
                    onCheckedChange={() => onClientToggle(client.id)}
                  />
                  <Label
                    htmlFor={`client-${client.id}`}
                    className="text-xs flex-1 cursor-pointer"
                    title={client.name}
                  >
                    {client.name}
                  </Label>
                </div>
              ))
            )}
          </div>
          
          <div className="flex flex-wrap gap-1">
            <Badge variant="outline" className="text-xs">
              {selectedClients.length} of {availableClients.length} selected
            </Badge>
            {hasValidClients && (
              <Badge variant="secondary" className="text-xs">
                Resolved
              </Badge>
            )}
            {!hasValidClients && (
              <Badge variant="destructive" className="text-xs">
                Loading
              </Badge>
            )}
          </div>
        </div>

        {/* Phase 2: Preferred Staff Filter Section */}
        {hasValidPreferredStaff && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Filter className="h-3 w-3" />
                  Preferred Staff Filter
                  {preferredStaffLoading && (
                    <RefreshCw className="h-3 w-3 ml-1 animate-spin" />
                  )}
                </Label>
                <div className="flex items-center gap-1">
                  {preferredStaffError && onRetryPreferredStaff && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={onRetryPreferredStaff}
                      className="text-xs h-auto p-1"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Retry
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleSelectAllPreferredStaff}
                    className="text-xs h-auto p-1"
                    disabled={preferredStaffLoading || !hasValidPreferredStaff}
                  >
                    {isAllPreferredStaffSelected ? (
                      <>
                        <EyeOff className="h-3 w-3 mr-1" />
                        Hide All
                      </>
                    ) : (
                      <>
                        <Eye className="h-3 w-3 mr-1" />
                        Show All
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              {preferredStaffError && (
                <div className="text-xs text-destructive bg-destructive/10 p-2 rounded flex items-center gap-2">
                  <AlertCircle className="h-3 w-3" />
                  {preferredStaffError}
                </div>
              )}
              
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {preferredStaffLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-muted animate-pulse rounded" />
                        <div className="h-3 bg-muted animate-pulse rounded flex-1" />
                      </div>
                    ))}
                  </div>
                ) : (
                  availablePreferredStaff.map((staff) => (
                    <div key={staff.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`staff-${staff.id}`}
                        checked={selectedPreferredStaff.includes(staff.id)}
                        onCheckedChange={() => onPreferredStaffToggle(staff.id)}
                      />
                      <Label
                        htmlFor={`staff-${staff.id}`}
                        className="text-xs flex-1 cursor-pointer"
                        title={staff.name}
                      >
                        {staff.name}
                      </Label>
                    </div>
                  ))
                )}
              </div>
              
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-xs">
                  {selectedPreferredStaff.length} of {availablePreferredStaff.length} selected
                </Badge>
                {hasValidPreferredStaff && !preferredStaffLoading && (
                  <Badge variant="secondary" className="text-xs">
                    Available
                  </Badge>
                )}
                {preferredStaffLoading && (
                  <Badge variant="destructive" className="text-xs">
                    Loading
                  </Badge>
                )}
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Actions Section */}
        <div className="space-y-3">
          <Label className="text-xs font-medium text-muted-foreground">
            Actions
          </Label>
          <div className="flex flex-col gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onExport}
              className="w-full justify-start text-xs"
            >
              <Download className="h-3 w-3 mr-2" />
              Export to Excel
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onPrintExport}
              className="w-full justify-start text-xs"
            >
              <Printer className="h-3 w-3 mr-2" />
              Print Export
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
