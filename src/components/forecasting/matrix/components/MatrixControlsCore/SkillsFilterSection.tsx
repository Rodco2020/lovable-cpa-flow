
import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, AlertCircle, RefreshCw } from 'lucide-react';
import { SkillType } from '@/types/task';

interface SkillsFilterSectionProps {
  selectedSkills: SkillType[];
  onSkillToggle: (skill: SkillType) => void;
  availableSkills: SkillType[];
  skillsLoading: boolean;
  skillsError: string | null;
  onRetrySkills: () => void;
}

/**
 * FIXED: Skills Filter Section Component
 * Enhanced to handle resolved skill names and provide better user feedback
 */
export const SkillsFilterSection: React.FC<SkillsFilterSectionProps> = ({
  selectedSkills,
  onSkillToggle,
  availableSkills,
  skillsLoading,
  skillsError,
  onRetrySkills
}) => {
  const handleSelectAllSkills = (): void => {
    if (selectedSkills.length === availableSkills.length) {
      // Deselect all
      availableSkills.forEach(skill => onSkillToggle(skill));
    } else {
      // Select all missing skills
      availableSkills.forEach(skill => {
        if (!selectedSkills.includes(skill)) {
          onSkillToggle(skill);
        }
      });
    }
  };

  // Enhanced validation for empty states
  const hasValidSkills = availableSkills && availableSkills.length > 0;
  const allSkillsSelected = hasValidSkills && selectedSkills.length === availableSkills.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-muted-foreground">
          Skills Filter
          {skillsLoading && (
            <RefreshCw className="h-3 w-3 ml-1 inline animate-spin" />
          )}
        </Label>
        <div className="flex items-center gap-1">
          {skillsError && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onRetrySkills}
              className="text-xs h-auto p-1"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSelectAllSkills}
            className="text-xs h-auto p-1"
            disabled={skillsLoading || !hasValidSkills}
          >
            {allSkillsSelected ? (
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
      </div>
      
      {/* Skills Error State */}
      {skillsError && (
        <div className="text-xs text-destructive bg-destructive/10 p-2 rounded flex items-center gap-2">
          <AlertCircle className="h-3 w-3" />
          {skillsError}
        </div>
      )}
      
      {/* Skills Loading State */}
      {skillsLoading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-muted animate-pulse rounded" />
              <div className="h-3 bg-muted animate-pulse rounded flex-1" />
            </div>
          ))}
        </div>
      )}
      
      {/* Skills List */}
      {!skillsLoading && !skillsError && (
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {!hasValidSkills ? (
            <div className="text-xs text-muted-foreground italic">
              No skills available. Skills will appear here when demand data is loaded.
            </div>
          ) : (
            availableSkills.map((skill) => (
              <div key={skill} className="flex items-center space-x-2">
                <Checkbox
                  id={`skill-${skill}`}
                  checked={selectedSkills.includes(skill)}
                  onCheckedChange={() => onSkillToggle(skill)}
                />
                <Label
                  htmlFor={`skill-${skill}`}
                  className="text-xs flex-1 cursor-pointer"
                  title={skill} // Add tooltip for long skill names
                >
                  {skill}
                </Label>
              </div>
            ))
          )}
        </div>
      )}
      
      {/* Enhanced Selected skills summary */}
      <div className="flex flex-wrap gap-1">
        <Badge variant="outline" className="text-xs">
          {selectedSkills.length} of {availableSkills.length} selected
        </Badge>
        {hasValidSkills && (
          <Badge variant="secondary" className="text-xs">
            Resolved Names
          </Badge>
        )}
        {!hasValidSkills && !skillsLoading && (
          <Badge variant="destructive" className="text-xs">
            No Data
          </Badge>
        )}
      </div>
    </div>
  );
};
