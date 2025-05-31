
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SkillType } from '@/types/task';
import { useMatrixSkills } from './hooks/useMatrixSkills';
import {
  ViewModeSection,
  MonthRangeSection,
  SkillsFilterSection,
  ActionsSection,
  MatrixControlsHeader,
  MatrixControlsProps
} from './components/MatrixControlsCore';

/**
 * Matrix Controls Component (Refactored)
 * 
 * This component has been refactored into smaller, focused components for better maintainability.
 * All UI and functionality remains exactly the same as the original implementation.
 * 
 * Architecture:
 * - MatrixControlsHeader: Title and reset button
 * - ViewModeSection: Hours/percentage toggle
 * - MonthRangeSection: Time period selection
 * - SkillsFilterSection: Dynamic skills integration with loading/error states
 * - ActionsSection: Export and other actions
 */
export const MatrixControls: React.FC<MatrixControlsProps> = ({
  selectedSkills,
  onSkillToggle,
  viewMode,
  onViewModeChange,
  monthRange,
  onMonthRangeChange,
  onExport,
  onReset,
  className
}) => {
  // Use dynamic skills hook - maintains exact same integration as before
  const { 
    availableSkills, 
    isLoading: skillsLoading, 
    error: skillsError,
    refetchSkills 
  } = useMatrixSkills();

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <MatrixControlsHeader onReset={onReset} />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* View Mode */}
        <ViewModeSection
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
        />

        <Separator />

        {/* Month Range */}
        <MonthRangeSection
          monthRange={monthRange}
          onMonthRangeChange={onMonthRangeChange}
        />

        <Separator />

        {/* Skills Filter - Dynamic Integration */}
        <SkillsFilterSection
          selectedSkills={selectedSkills}
          onSkillToggle={onSkillToggle}
          availableSkills={availableSkills}
          skillsLoading={skillsLoading}
          skillsError={skillsError}
          onRetrySkills={refetchSkills}
        />

        <Separator />

        {/* Actions */}
        <ActionsSection onExport={onExport} />
      </CardContent>
    </Card>
  );
};

export default MatrixControls;
