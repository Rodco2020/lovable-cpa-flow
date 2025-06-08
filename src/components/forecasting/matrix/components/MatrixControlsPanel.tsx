
import React from 'react';
import { Button } from '@/components/ui/button';
import { MatrixControls } from '../MatrixControls';
import { Maximize2, Minimize2 } from 'lucide-react';
import { SkillType } from '@/types/task';

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
  onReset
}) => {
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
      
      <div className={`${isControlsExpanded ? 'block' : 'hidden xl:block'}`}>
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
      </div>
    </div>
  );
};
