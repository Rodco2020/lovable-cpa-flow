
import React from 'react';
import { ViewModeSection } from './ViewModeSection';
import { MonthRangeSection } from './MonthRangeSection';
import { ActionsSection } from './ActionsSection';

interface MatrixControlsCoreProps {
  selectedSkills: string[];
  onSkillsChange: (skills: string[]) => void;
  forecastMode: 'virtual' | 'actual';
  onForecastModeChange: (mode: 'virtual' | 'actual') => void;
  startMonth: Date;
  onStartMonthChange: (date: Date) => void;
  onExport: (options?: any) => void;
  onPrint: () => void;
  isExporting: boolean;
}

export const MatrixControlsCore: React.FC<MatrixControlsCoreProps> = ({
  selectedSkills,
  onSkillsChange,
  forecastMode,
  onForecastModeChange,
  startMonth,
  onStartMonthChange,
  onExport,
  onPrint,
  isExporting
}) => {
  return (
    <div className="space-y-4">
      {/* View Mode */}
      <ViewModeSection
        viewMode="hours"
        onViewModeChange={() => {}}
      />

      {/* Month Range */}
      <MonthRangeSection
        monthRange={{ start: 0, end: 11 }}
        onMonthRangeChange={() => {}}
      />

      {/* Actions */}
      <ActionsSection onExport={onExport} />
    </div>
  );
};
