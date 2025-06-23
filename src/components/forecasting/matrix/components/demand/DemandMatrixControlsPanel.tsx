
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PreferredStaffFilterSection } from './components/PreferredStaffFilterSection';
import { ControlsPanelHeader } from './components/ControlsPanelHeader';
import { TimeRangeControlSection } from './components/TimeRangeControlSection';
import { SkillsFilterSection } from './components/SkillsFilterSection';
import { ClientsFilterSection } from './components/ClientsFilterSection';
import { ActionButtonsSection } from './components/ActionButtonsSection';
import { CurrentSelectionSummary } from './components/CurrentSelectionSummary';
import { createToggleToSetterAdapter } from './components/utils/selectionUtils';

/**
 * Props interface for the Demand Matrix Controls Panel
 */
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
  onPrintExport?: () => void;
}

/**
 * Demand Matrix Controls Panel Component
 * 
 * A comprehensive control panel for managing demand matrix filtering and display options.
 * Provides controls for:
 * - Time range selection (start and end months)
 * - Skills filtering with select all/none functionality
 * - Clients filtering with select all/none functionality  
 * - Preferred staff filtering with advanced selection options
 * - Export and print functionality
 * - Filter reset capability
 * - Current selection summary display
 * 
 * The component is designed to be collapsible for better space utilization
 * and maintains state consistency across all filter selections.
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
  onPrintExport
}) => {
  // Convert toggle function to setter function for PreferredStaffFilterSection compatibility
  const handlePreferredStaffChange = createToggleToSetterAdapter(
    selectedPreferredStaff,
    onPreferredStaffToggle
  );

  return (
    <Card>
      <CardHeader>
        <ControlsPanelHeader
          isControlsExpanded={isControlsExpanded}
          onToggleControls={onToggleControls}
        />
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Time Range Control */}
        <TimeRangeControlSection
          monthRange={monthRange}
          onMonthRangeChange={onMonthRangeChange}
        />

        <Separator />

        {/* Skills Filter */}
        <SkillsFilterSection
          selectedSkills={selectedSkills}
          availableSkills={availableSkills}
          onSkillToggle={onSkillToggle}
          isControlsExpanded={isControlsExpanded}
        />

        <Separator />

        {/* Clients Filter */}
        <ClientsFilterSection
          selectedClients={selectedClients}
          availableClients={availableClients}
          onClientToggle={onClientToggle}
          isControlsExpanded={isControlsExpanded}
        />

        <Separator />

        {/* Preferred Staff Filter */}
        <PreferredStaffFilterSection
          selectedPreferredStaff={selectedPreferredStaff}
          setSelectedPreferredStaff={handlePreferredStaffChange}
          availablePreferredStaff={availablePreferredStaff}
          isControlsExpanded={isControlsExpanded}
        />

        <Separator />

        {/* Action Buttons */}
        <ActionButtonsSection
          onExport={onExport}
          onReset={onReset}
          onPrintExport={onPrintExport}
        />

        {/* Current Selection Summary */}
        <CurrentSelectionSummary
          groupingMode={groupingMode}
          monthRange={monthRange}
          selectedSkills={selectedSkills}
          selectedClients={selectedClients}
          selectedPreferredStaff={selectedPreferredStaff}
          availableSkills={availableSkills}
          availableClients={availableClients}
          availablePreferredStaff={availablePreferredStaff}
        />
      </CardContent>
    </Card>
  );
};
