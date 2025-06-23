
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { isAllItemsSelected } from './utils/selectionUtils';

interface SkillsFilterSectionProps {
  selectedSkills: string[];
  availableSkills: string[];
  onSkillToggle: (skill: string) => void;
  isControlsExpanded: boolean;
}

/**
 * Skills Filter Section Component
 * Handles skill selection with individual checkboxes and select all/none functionality
 */
export const SkillsFilterSection: React.FC<SkillsFilterSectionProps> = ({
  selectedSkills,
  availableSkills,
  onSkillToggle,
  isControlsExpanded
}) => {
  const isAllSkillsSelected = isAllItemsSelected(selectedSkills, availableSkills);

  const handleSelectAllToggle = () => {
    if (isAllSkillsSelected) {
      availableSkills.forEach(skill => onSkillToggle(skill));
    } else {
      availableSkills.forEach(skill => {
        if (!selectedSkills.includes(skill)) {
          onSkillToggle(skill);
        }
      });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium">Skills Filter</label>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSelectAllToggle}
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
