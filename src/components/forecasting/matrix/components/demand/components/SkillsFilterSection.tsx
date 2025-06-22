
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

interface SkillsFilterSectionProps {
  selectedSkills: string[];
  onSkillToggle: (skill: string) => void;
  availableSkills: string[];
  isAllSelected: boolean; // Add the missing property
  isLoading?: boolean;
}

export const SkillsFilterSection: React.FC<SkillsFilterSectionProps> = ({
  selectedSkills,
  onSkillToggle,
  availableSkills,
  isAllSelected,
  isLoading = false
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium">Skills Filter</h4>
        <Badge variant="outline">
          {isAllSelected ? 'All' : `${selectedSkills.length}/${availableSkills.length}`}
        </Badge>
      </div>
      
      <div className="space-y-2">
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading skills...</div>
        ) : (
          availableSkills.map((skill) => (
            <div key={skill} className="flex items-center space-x-2">
              <Checkbox
                id={skill}
                checked={selectedSkills.includes(skill)}
                onCheckedChange={() => onSkillToggle(skill)}
              />
              <Label htmlFor={skill} className="text-sm font-normal">
                {skill}
              </Label>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
