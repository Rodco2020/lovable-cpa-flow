
import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff } from 'lucide-react';
import { useSelectAllLogic } from '../../../DemandMatrixControls/hooks/useSelectAllLogic';

interface SkillsFilterSectionProps {
  availableSkills: string[];
  selectedSkills: string[];
  onSkillToggle: (skill: string) => void;
  isAllSkillsSelected: boolean;
  isControlsExpanded: boolean;
}

/**
 * Skills Filter Section Component
 * Handles skills selection with show all/hide all functionality
 */
export const SkillsFilterSection: React.FC<SkillsFilterSectionProps> = ({
  availableSkills,
  selectedSkills,
  onSkillToggle,
  isAllSkillsSelected,
  isControlsExpanded
}) => {
  const { handleSelectAll } = useSelectAllLogic(
    availableSkills,
    selectedSkills,
    onSkillToggle
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium">Skills Filter</label>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSelectAll}
          className="h-6 px-2 text-xs"
        >
          {isAllSkillsSelected ? (
            <>
              <EyeOff className="h-3 w-3 mr-1" />
              Hide All
            </>
          ) : (
            <>
              <Eye className="h-3 w-3 mr-1" />
              Show All
            </>
          )}
        </Button>
      </div>
      
      {isControlsExpanded && (
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {availableSkills.map((skill) => (
            <div key={skill} className="flex items-center space-x-2">
              <Checkbox
                id={`skill-${skill}`}
                checked={isAllSkillsSelected || selectedSkills.includes(skill)}
                onCheckedChange={() => onSkillToggle(skill)}
              />
              <label 
                htmlFor={`skill-${skill}`} 
                className="text-sm cursor-pointer flex-1 truncate"
                title={skill}
              >
                {skill}
              </label>
            </div>
          ))}
        </div>
      )}
      
      {!isControlsExpanded && (
        <div className="text-xs text-muted-foreground">
          {isAllSkillsSelected ? 'All skills visible' : `${selectedSkills.length}/${availableSkills.length} skills selected`}
        </div>
      )}
    </div>
  );
};
