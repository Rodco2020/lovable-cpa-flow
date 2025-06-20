
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Filter } from 'lucide-react';
import { SkillType } from '@/types/task';
import { FilterSection } from './FilterSection';
import { useSelectAllLogic } from '../hooks/useSelectAllLogic';

interface SkillsFilterProps {
  availableSkills: SkillType[];
  selectedSkills: SkillType[];
  onSkillToggle: (skill: SkillType) => void;
  isAllSkillsSelected: boolean;
  loading?: boolean;
}

/**
 * Skills filter component
 * Handles skill selection with select all functionality
 */
export const SkillsFilter: React.FC<SkillsFilterProps> = ({
  availableSkills,
  selectedSkills,
  onSkillToggle,
  isAllSkillsSelected,
  loading = false
}) => {
  const { handleSelectAll, selectAllText } = useSelectAllLogic(
    availableSkills,
    selectedSkills,
    onSkillToggle
  );

  const badge = (
    <Badge variant="secondary">
      {isAllSkillsSelected ? 'All' : `${selectedSkills.length}/${availableSkills.length}`}
    </Badge>
  );

  return (
    <FilterSection
      title={
        <span className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Skills
        </span>
      }
      badge={badge}
      loading={loading}
    >
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Select Skills</span>
          <button
            onClick={handleSelectAll}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            {selectAllText}
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {availableSkills.map(skill => (
            <label key={skill} className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={selectedSkills.includes(skill)}
                onCheckedChange={() => onSkillToggle(skill)}
              />
              <span>{skill}</span>
            </label>
          ))}
        </div>
      </div>
    </FilterSection>
  );
};
