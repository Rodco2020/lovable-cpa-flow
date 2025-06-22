
import React from 'react';
import { CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TimeRangeControls } from './TimeRangeControls';
import { SkillsFilterSection } from './SkillsFilterSection';
import { ClientsFilterSection } from './ClientsFilterSection';
import { PreferredStaffFilterSection } from '../PreferredStaffFilterSection';
import { ActionButtonsSection } from './ActionButtonsSection';

interface ExpandableControlsContentProps {
  // Time controls
  monthRange: { start: number; end: number };
  onMonthRangeChange: (range: { start: number; end: number }) => void;
  
  // Skills filtering
  selectedSkills: string[];
  onSkillToggle: (skill: string) => void;
  availableSkills: string[];
  isAllSkillsSelected: boolean;
  
  // Clients filtering
  selectedClients: string[];
  onClientToggle: (clientId: string) => void;
  availableClients: Array<{ id: string; name: string }>;
  isAllClientsSelected: boolean;
  
  // Preferred staff filtering
  selectedPreferredStaff: string[];
  onPreferredStaffToggle: (staffId: string) => void;
  availablePreferredStaff: Array<{ id: string; name: string }>;
  isAllPreferredStaffSelected: boolean;
  preferredStaffFilterMode: 'all' | 'specific' | 'none';
  onPreferredStaffFilterModeChange: (mode: 'all' | 'specific' | 'none') => void;
  preferredStaffLoading?: boolean;
  
  // Actions
  onExport: () => void;
  onReset: () => void;
  groupingMode: 'skill' | 'client';
}

/**
 * Refactored Expandable Controls Content Component
 * 
 * FUNCTIONALITY PRESERVED:
 * - All filter sections with exact same behavior
 * - Separators between sections
 * - Proper spacing and layout
 * - Three-mode preferred staff filtering
 * - Enhanced export and reset functionality
 */
export const ExpandableControlsContent: React.FC<ExpandableControlsContentProps> = ({
  monthRange,
  onMonthRangeChange,
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
  preferredStaffFilterMode,
  onPreferredStaffFilterModeChange,
  preferredStaffLoading = false,
  onExport,
  onReset,
  groupingMode
}) => {
  return (
    <CardContent className="space-y-6">
      {/* Month Range Selector */}
      <TimeRangeControls
        monthRange={monthRange}
        onMonthRangeChange={onMonthRangeChange}
      />

      <Separator />

      {/* Skills Filter - FIXED: Use isAllSelected instead of isAllSkillsSelected */}
      <SkillsFilterSection
        selectedSkills={selectedSkills}
        onSkillToggle={onSkillToggle}
        availableSkills={availableSkills}
        isAllSelected={isAllSkillsSelected}
      />

      <Separator />

      {/* Clients Filter */}
      <ClientsFilterSection
        selectedClients={selectedClients}
        onClientToggle={onClientToggle}
        availableClients={availableClients}
        isAllClientsSelected={isAllClientsSelected}
      />

      <Separator />

      {/* Phase 2: Preferred Staff Filter Section with Three-Mode Support */}
      <PreferredStaffFilterSection
        selectedPreferredStaff={selectedPreferredStaff}
        onPreferredStaffToggle={onPreferredStaffToggle}
        availablePreferredStaff={availablePreferredStaff}
        isAllSelected={isAllPreferredStaffSelected}
        filterMode={preferredStaffFilterMode}
        onFilterModeChange={onPreferredStaffFilterModeChange}
        isLoading={preferredStaffLoading}
      />

      <Separator />

      {/* Action Buttons */}
      <ActionButtonsSection
        onExport={onExport}
        onReset={onReset}
        groupingMode={groupingMode}
        selectedSkills={selectedSkills}
        selectedClients={selectedClients}
        selectedPreferredStaff={selectedPreferredStaff}
        monthRange={monthRange}
        availableSkills={availableSkills}
        availableClients={availableClients}
        availablePreferredStaff={availablePreferredStaff}
        isAllSkillsSelected={isAllSkillsSelected}
        isAllClientsSelected={isAllClientsSelected}
        isAllPreferredStaffSelected={isAllPreferredStaffSelected}
        preferredStaffFilterMode={preferredStaffFilterMode}
      />
    </CardContent>
  );
};
