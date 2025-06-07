
import React from 'react';
import { EnhancedMatrixLegend } from '../EnhancedMatrixLegend';
import { MatrixControlsPanel } from './MatrixControlsPanel';
import { EnhancedMatrixContent } from './EnhancedMatrixContent';

interface EnhancedMatrixMainProps {
  isControlsExpanded: boolean;
  selectedSkills: string[];
  onSkillsChange: (skills: string[]) => void;
  forecastMode: 'virtual' | 'actual';
  onForecastModeChange: (mode: 'virtual' | 'actual') => void;
  startMonth: Date;
  onStartMonthChange: (date: Date) => void;
  onExport: (options?: any) => void;
  onPrint: () => void;
  selectedClientIds: string[];
  onClientSelectionChange: (clientIds: string[]) => void;
  filteredData: any;
  isLoading: boolean;
  validationIssues: string[];
  availableSkills: any[];
  onRefresh: () => void;
}

export const EnhancedMatrixMain: React.FC<EnhancedMatrixMainProps> = ({
  isControlsExpanded,
  selectedSkills,
  onSkillsChange,
  forecastMode,
  onForecastModeChange,
  startMonth,
  onStartMonthChange,
  onExport,
  onPrint,
  selectedClientIds,
  onClientSelectionChange,
  filteredData,
  isLoading,
  validationIssues,
  availableSkills,
  onRefresh
}) => {
  return (
    <>
      <EnhancedMatrixLegend viewMode="hours" />
      
      {/* Responsive layout for matrix and controls */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Enhanced Controls Panel */}
        <MatrixControlsPanel
          selectedSkills={selectedSkills}
          onSkillsChange={onSkillsChange}
          forecastMode={forecastMode}
          onForecastModeChange={onForecastModeChange}
          startMonth={startMonth}
          onStartMonthChange={onStartMonthChange}
          onExport={onExport}
          onPrint={onPrint}
          isExporting={false}
          selectedClientIds={selectedClientIds}
          onClientSelectionChange={onClientSelectionChange}
        />
        
        {/* Matrix Panel */}
        <div className={`xl:col-span-3 ${isControlsExpanded ? 'xl:col-span-2' : ''}`}>
          <EnhancedMatrixContent
            filteredData={filteredData}
            viewMode="hours"
            forecastType={forecastMode}
            isLoading={isLoading}
            validationIssues={validationIssues}
            availableSkills={availableSkills}
            onRefresh={onRefresh}
          />
        </div>
      </div>
    </>
  );
};
