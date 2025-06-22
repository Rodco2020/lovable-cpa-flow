
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronDown, 
  ChevronUp, 
  Download, 
  RotateCcw, 
  Printer 
} from 'lucide-react';
import { PreferredStaffFilter } from './components/PreferredStaffFilter';
import { TimeRangeControls } from './components/TimeRangeControls';
import { SkillsFilterSection } from './components/SkillsFilterSection';
import { ClientsFilterSection } from './components/ClientsFilterSection';
import { ActionButtonsSection } from './components/ActionButtonsSection';
import { SelectionSummary } from './components/SelectionSummary';

interface DemandMatrixControlsPanelProps {
  isControlsExpanded: boolean;
  onToggleControls: () => void;
  selectedSkills: string[];
  selectedClients: string[];
  selectedPreferredStaff: string[];
  onSkillToggle: (skill: string) => void;
  onClientToggle: (client: string) => void;
  onPreferredStaffToggle: (staffId: string) => void;
  monthRange: { start: number; end: number };
  onMonthRangeChange: (range: { start: number; end: number }) => void;
  onExport: () => void;
  onReset: () => void;
  groupingMode: 'skill' | 'client';
  availableSkills: string[];
  availableClients: Array<{ id: string; name: string }>;
  availablePreferredStaff: Array<{ id: string; name: string }>;
  isAllSkillsSelected: boolean;
  isAllClientsSelected: boolean;
  isAllPreferredStaffSelected: boolean;
  onPrintExport?: () => void;
}

/**
 * Refactored DemandMatrixControlsPanel Component
 * 
 * REFACTORING IMPROVEMENTS:
 * - Extracted smaller, focused components for better maintainability
 * - Separated concerns into logical sections (time range, filters, actions)
 * - Improved code organization and readability
 * - Maintained exact UI and functionality
 * 
 * PRESERVED FUNCTIONALITY:
 * - All existing prop interfaces and behavior
 * - Exact same UI layout and styling
 * - Complete filter functionality for skills, clients, and preferred staff
 * - Time range controls with month selection
 * - Export and reset functionality
 * - Expand/collapse behavior
 * - Selection summary display
 */
export const DemandMatrixControlsPanel: React.FC<DemandMatrixControlsPanelProps> = ({
  isControlsExpanded,
  onToggleControls,
  selectedSkills,
  selectedClients,
  selectedPreferredStaff,
  onSkillToggle,
  onClientToggle,
  onPreferredStaffToggle,
  monthRange,
  onMonthRangeChange,
  onExport,
  onReset,
  groupingMode,
  availableSkills,
  availableClients,
  availablePreferredStaff,
  isAllSkillsSelected,
  isAllClientsSelected,
  isAllPreferredStaffSelected,
  onPrintExport
}) => {
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Matrix Controls</h3>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onToggleControls}
              className="flex items-center gap-1"
            >
              {isControlsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {isControlsExpanded ? 'Collapse' : 'Expand'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Time Range Control */}
        <TimeRangeControls
          monthRange={monthRange}
          onMonthRangeChange={onMonthRangeChange}
          monthNames={monthNames}
        />

        <Separator />

        {/* Skills Filter */}
        <SkillsFilterSection
          availableSkills={availableSkills}
          selectedSkills={selectedSkills}
          onSkillToggle={onSkillToggle}
          isAllSkillsSelected={isAllSkillsSelected}
          isControlsExpanded={isControlsExpanded}
        />

        <Separator />

        {/* Clients Filter */}
        <ClientsFilterSection
          availableClients={availableClients}
          selectedClients={selectedClients}
          onClientToggle={onClientToggle}
          isAllClientsSelected={isAllClientsSelected}
          isControlsExpanded={isControlsExpanded}
        />

        <Separator />

        {/* Preferred Staff Filter */}
        {availablePreferredStaff.length > 0 && (
          <>
            <div>
              <PreferredStaffFilter
                availablePreferredStaff={availablePreferredStaff}
                selectedPreferredStaff={selectedPreferredStaff}
                onPreferredStaffToggle={onPreferredStaffToggle}
                isAllPreferredStaffSelected={isAllPreferredStaffSelected}
              />
              
              {!isControlsExpanded && (
                <div className="text-xs text-muted-foreground mt-1">
                  {isAllPreferredStaffSelected 
                    ? 'All preferred staff visible' 
                    : `${selectedPreferredStaff.length}/${availablePreferredStaff.length} preferred staff selected`
                  }
                </div>
              )}
            </div>
            <Separator />
          </>
        )}

        {/* Action Buttons */}
        <ActionButtonsSection
          onPrintExport={onPrintExport}
          onExport={onExport}
          onReset={onReset}
        />

        {/* Current Selection Summary */}
        <SelectionSummary
          groupingMode={groupingMode}
          monthRange={monthRange}
          monthNames={monthNames}
          isAllSkillsSelected={isAllSkillsSelected}
          selectedSkills={selectedSkills}
          isAllClientsSelected={isAllClientsSelected}
          selectedClients={selectedClients}
          availablePreferredStaff={availablePreferredStaff}
          isAllPreferredStaffSelected={isAllPreferredStaffSelected}
          selectedPreferredStaff={selectedPreferredStaff}
        />
      </CardContent>
    </Card>
  );
};
