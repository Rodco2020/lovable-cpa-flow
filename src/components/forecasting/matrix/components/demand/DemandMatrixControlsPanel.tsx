
import React from 'react';
import { Button } from '@/components/ui/button';
import { DemandMatrixControls } from './DemandMatrixControls';
import { Maximize2, Minimize2 } from 'lucide-react';
import { SkillType } from '@/types/task';

interface DemandMatrixControlsPanelProps {
  isControlsExpanded: boolean;
  onToggleControls: () => void;
  selectedSkills: SkillType[];
  selectedClients: string[];
  onSkillToggle: (skill: SkillType) => void;
  onClientToggle: (clientId: string) => void;
  monthRange: { start: number; end: number };
  onMonthRangeChange: (monthRange: { start: number; end: number }) => void;
  onExport: () => void;
  onReset: () => void;
  groupingMode: 'skill' | 'client';
  availableSkills: SkillType[];
  availableClients: Array<{ id: string; name: string }>;
}

export const DemandMatrixControlsPanel: React.FC<DemandMatrixControlsPanelProps> = ({
  isControlsExpanded,
  onToggleControls,
  selectedSkills,
  selectedClients,
  onSkillToggle,
  onClientToggle,
  monthRange,
  onMonthRangeChange,
  onExport,
  onReset,
  groupingMode,
  availableSkills,
  availableClients
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
        <DemandMatrixControls
          selectedSkills={selectedSkills}
          selectedClients={selectedClients}
          onSkillToggle={onSkillToggle}
          onClientToggle={onClientToggle}
          monthRange={monthRange}
          onMonthRangeChange={onMonthRangeChange}
          onExport={onExport}
          onReset={onReset}
          groupingMode={groupingMode}
          availableSkills={availableSkills}
          availableClients={availableClients}
        />
      </div>
    </div>
  );
};
