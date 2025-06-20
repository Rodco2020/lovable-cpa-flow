
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { IntegratedMatrixControlsProps } from './types';
import {
  ControlHeader,
  TimeRangeControls,
  FilterControls,
  ActionControls,
  StatusSummary
} from './components';

/**
 * Integrated Matrix Controls Component
 * 
 * Refactored modular component that consolidates matrix control functionality
 * with improved maintainability and consistent behavior across the application.
 */
export const IntegratedMatrixControls: React.FC<IntegratedMatrixControlsProps> = (props) => {
  const {
    selectedSkills,
    onSkillToggle,
    availableSkills,
    isAllSkillsSelected,
    selectedClients,
    onClientToggle,
    availableClients,
    isAllClientsSelected,
    selectedPreferredStaff,
    onPreferredStaffToggle,
    availablePreferredStaff,
    isAllPreferredStaffSelected,
    monthRange,
    onMonthRangeChange,
    isControlsExpanded,
    onToggleControls,
    groupingMode,
    onExport,
    onReset,
    onPrintExport,
    skillsLoading = false,
    clientsLoading = false,
    preferredStaffLoading = false
  } = props;

  return (
    <Card>
      <CardHeader>
        <ControlHeader
          isControlsExpanded={isControlsExpanded}
          onToggleControls={onToggleControls}
          onReset={onReset}
        />
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Time Range Control */}
        <TimeRangeControls
          monthRange={monthRange}
          onMonthRangeChange={onMonthRangeChange}
          isExpanded={isControlsExpanded}
        />

        <Separator />

        {/* Filter Controls */}
        <FilterControls
          selectedSkills={selectedSkills}
          selectedClients={selectedClients}
          selectedPreferredStaff={selectedPreferredStaff}
          onSkillToggle={onSkillToggle}
          onClientToggle={onClientToggle}
          onPreferredStaffToggle={onPreferredStaffToggle}
          availableSkills={availableSkills}
          availableClients={availableClients}
          availablePreferredStaff={availablePreferredStaff}
          isAllSkillsSelected={isAllSkillsSelected}
          isAllClientsSelected={isAllClientsSelected}
          isAllPreferredStaffSelected={isAllPreferredStaffSelected}
          isExpanded={isControlsExpanded}
        />

        <Separator />

        {/* Action Controls */}
        <ActionControls
          onExport={onExport}
          onPrintExport={onPrintExport}
        />

        {/* Status Summary */}
        <StatusSummary
          groupingMode={groupingMode}
          monthRange={monthRange}
          selectedSkills={selectedSkills}
          selectedClients={selectedClients}
          selectedPreferredStaff={selectedPreferredStaff}
          isAllSkillsSelected={isAllSkillsSelected}
          isAllClientsSelected={isAllClientsSelected}
          isAllPreferredStaffSelected={isAllPreferredStaffSelected}
          availablePreferredStaff={availablePreferredStaff}
        />
      </CardContent>
    </Card>
  );
};

export default IntegratedMatrixControls;
