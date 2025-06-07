
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MatrixControls } from '../MatrixControls';
import { ClientFilterSection } from './ClientFilterSection';
import { EnhancedExportSection } from './EnhancedExportSection';
import { Maximize2, Minimize2 } from 'lucide-react';
import { SkillType } from '@/types/task';
import { MatrixData } from '@/services/forecasting/matrixUtils';

interface MatrixControlsPanelProps {
  isControlsExpanded: boolean;
  onToggleControls: () => void;
  selectedSkills: SkillType[];
  onSkillToggle: (skill: SkillType) => void;
  viewMode: 'hours' | 'percentage';
  onViewModeChange: (viewMode: 'hours' | 'percentage') => void;
  monthRange: { start: number; end: number };
  onMonthRangeChange: (monthRange: { start: number; end: number }) => void;
  onExport: () => void;
  onReset: () => void;
  matrixData?: MatrixData;
  selectedClientIds?: string[];
  onClientSelectionChange?: (clientIds: string[]) => void;
  onEnhancedExport?: (format: 'csv' | 'json', options: any) => void;
  onPrint?: (options: any) => void;
}

export const MatrixControlsPanel: React.FC<MatrixControlsPanelProps> = ({
  isControlsExpanded,
  onToggleControls,
  selectedSkills,
  onSkillToggle,
  viewMode,
  onViewModeChange,
  monthRange,
  onMonthRangeChange,
  onExport,
  onReset,
  matrixData,
  selectedClientIds = [],
  onClientSelectionChange = () => {},
  onEnhancedExport = () => {},
  onPrint = () => {}
}) => {
  const [clientFilterCollapsed, setClientFilterCollapsed] = useState(false);
  const [exportSectionCollapsed, setExportSectionCollapsed] = useState(false);

  return (
    <div className={`xl:col-span-1 ${isControlsExpanded ? 'xl:col-span-2' : ''}`}>
      <div className="xl:hidden mb-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onToggleControls}
          className="w-full"
        >
          {isControlsExpanded ? <Minimize2 className="h-4 w-4 mr-2" /> : <Maximize2 className="h-4 w-4 mr-2" />}
          {isControlsExpanded ? 'Hide Controls' : 'Show Controls'}
        </Button>
      </div>
      
      <div className={`${isControlsExpanded ? 'block' : 'hidden xl:block'} space-y-4`}>
        {/* Client Filter Section */}
        <ClientFilterSection
          selectedClientIds={selectedClientIds}
          onClientSelectionChange={onClientSelectionChange}
          isCollapsed={clientFilterCollapsed}
          onToggleCollapse={() => setClientFilterCollapsed(!clientFilterCollapsed)}
        />

        {/* Original Matrix Controls */}
        <MatrixControls
          selectedSkills={selectedSkills}
          onSkillToggle={onSkillToggle}
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
          monthRange={monthRange}
          onMonthRangeChange={onMonthRangeChange}
          onExport={onExport}
          onReset={onReset}
        />

        {/* Enhanced Export & Print Section */}
        {matrixData && (
          <EnhancedExportSection
            matrixData={matrixData}
            selectedSkills={selectedSkills}
            selectedClientIds={selectedClientIds}
            monthRange={monthRange}
            onExport={onEnhancedExport}
            onPrint={onPrint}
            isCollapsed={exportSectionCollapsed}
            onToggleCollapse={() => setExportSectionCollapsed(!exportSectionCollapsed)}
          />
        )}
      </div>
    </div>
  );
};
