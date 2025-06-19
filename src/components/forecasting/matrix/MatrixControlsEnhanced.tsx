
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SkillType } from '@/types/task';
import {
  ViewModeSection,
  MonthRangeSection,
  ActionsSection,
  MatrixControlsHeader,
  MatrixControlsProps
} from './components/MatrixControlsCore';
import { EnhancedSkillsFilterSection } from './components/MatrixControlsCore/EnhancedSkillsFilterSection';

/**
 * Enhanced Matrix Controls Component
 * 
 * Uses the enhanced skills integration service to address the "0 skills loaded" error
 * with comprehensive diagnostics and force refresh capabilities.
 */
export const MatrixControlsEnhanced: React.FC<Omit<MatrixControlsProps, 'selectedSkills' | 'onSkillToggle'> & {
  selectedSkills: SkillType[];
  onSkillToggle: (skill: SkillType) => void;
}> = ({
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

        {/* Enhanced Skills Filter */}
        <EnhancedSkillsFilterSection
          selectedSkills={selectedSkills}
          onSkillToggle={onSkillToggle}
        />

        <Separator />

        {/* Actions */}
        <ActionsSection onExport={onExport} />
      </CardContent>
    </Card>
  );
};

export default MatrixControlsEnhanced;
