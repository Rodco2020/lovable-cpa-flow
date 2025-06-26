
import React from 'react';
import { Button } from '@/components/ui/button';
import { DemandMatrixControls } from './DemandMatrixControls';
import { Maximize2, Minimize2 } from 'lucide-react';
import { SkillType } from '@/types/task';

// Phase 2: Add preferred staff interface
interface PreferredStaffOption {
  id: string;
  name: string;
}

interface DemandMatrixControlsPanelProps {
  isControlsExpanded: boolean;
  onToggleControls: () => void;
  selectedSkills: SkillType[];
  selectedClients: string[];
  selectedPreferredStaff: string[]; // Phase 2: Add preferred staff props
  onSkillToggle: (skill: SkillType) => void;
  onClientToggle: (clientId: string) => void;
  onPreferredStaffToggle: (staffId: string) => void; // Phase 2: Add preferred staff handler
  monthRange: { start: number; end: number };
  onMonthRangeChange: (monthRange: { start: number; end: number }) => void;
  onExport: () => void;
  onPrintExport: () => void; // Add missing onPrintExport prop
  onReset: () => void;
  groupingMode: 'skill' | 'client';
  availableSkills: SkillType[];
  availableClients: Array<{ id: string; name: string }>;
  
  // Phase 2: Add preferred staff props
  availablePreferredStaff: PreferredStaffOption[];
  preferredStaffLoading: boolean;
  preferredStaffError: string | null;
  isAllPreferredStaffSelected: boolean;
  onRetryPreferredStaff?: () => void;
}

export const DemandMatrixControlsPanel: React.FC<DemandMatrixControlsPanelProps> = ({
  isControlsExpanded,
  onToggleControls,
  selectedSkills,
  selectedClients,
  selectedPreferredStaff, // Phase 2: Add preferred staff state
  onSkillToggle,
  onClientToggle,
  onPreferredStaffToggle, // Phase 2: Add preferred staff handler
  monthRange,
  onMonthRangeChange,
  onExport,
  onPrintExport, // Add missing onPrintExport prop
  onReset,
  groupingMode,
  availableSkills,
  availableClients,
  
  // Phase 2: Destructure preferred staff props
  availablePreferredStaff,
  preferredStaffLoading,
  preferredStaffError,
  isAllPreferredStaffSelected,
  onRetryPreferredStaff
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
          selectedPreferredStaff={selectedPreferredStaff} // Phase 2: Pass preferred staff state
          onSkillToggle={onSkillToggle}
          onClientToggle={onClientToggle}
          onPreferredStaffToggle={onPreferredStaffToggle} // Phase 2: Pass preferred staff handler
          monthRange={monthRange}
          onMonthRangeChange={onMonthRangeChange}
          onExport={onExport}
          onPrintExport={onPrintExport} // Pass through onPrintExport prop
          onReset={onReset}
          groupingMode={groupingMode}
          availableSkills={availableSkills}
          availableClients={availableClients}
          
          // Phase 2: Pass preferred staff props
          availablePreferredStaff={availablePreferredStaff}
          preferredStaffLoading={preferredStaffLoading}
          preferredStaffError={preferredStaffError}
          isAllPreferredStaffSelected={isAllPreferredStaffSelected}
          onRetryPreferredStaff={onRetryPreferredStaff}
        />
      </div>
    </div>
  );
};
