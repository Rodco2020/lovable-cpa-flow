
import React from 'react';
import { Skill } from '@/types/skill';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertTriangle, X } from 'lucide-react';

interface SkillSelectionProps {
  skills: Skill[];
  isLoadingSkills: boolean;
  isSubmitting: boolean;
  isSkillSelected: (skillId: string) => boolean;
  onSkillChange: (skillId: string, checked: boolean) => void;
  unmatchedSkills: string[];
  onRemoveUnmatchedSkill: (skillId: string) => void;
}

/**
 * Component for selecting required skills in task template form
 * Handles skill checkboxes, unmatched skill warnings, and loading states
 */
const SkillSelection: React.FC<SkillSelectionProps> = ({
  skills,
  isLoadingSkills,
  isSubmitting,
  isSkillSelected,
  onSkillChange,
  unmatchedSkills,
  onRemoveUnmatchedSkill
}) => {
  const handleSkillCheckboxChange = (skillId: string, checked: boolean) => {
    console.log('SkillSelection: Skill checkbox changed:', {
      skillId,
      checked,
      skillName: skills.find(s => s.id === skillId)?.name
    });
    onSkillChange(skillId, checked);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Required Skills</label>
      
      {/* Show warning for unmatched skills */}
      {unmatchedSkills.length > 0 && (
        <Alert className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Some skills are no longer available. You can remove them or they will be automatically cleaned up when you save.
            <div className="flex flex-wrap gap-1 mt-2">
              {unmatchedSkills.map(skillId => (
                <Badge key={skillId} variant="destructive" className="flex items-center gap-1">
                  {skillId}
                  <button
                    type="button"
                    onClick={() => onRemoveUnmatchedSkill(skillId)}
                    className="ml-1 hover:bg-destructive-foreground/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {isLoadingSkills ? (
        <div className="flex items-center py-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary mr-2" />
          <span className="text-sm">Loading skills...</span>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {skills.length > 0 ? (
            skills.map(skill => {
              // Always convert skill ID to string for consistency
              const skillIdStr = String(skill.id);
              const selected = isSkillSelected(skillIdStr);
              
              console.log('Rendering skill checkbox:', {
                skillId: skillIdStr,
                skillName: skill.name,
                selected
              });
              
              return (
                <div key={skillIdStr} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`skill-${skillIdStr}`}
                    checked={selected}
                    onCheckedChange={(checked) => {
                      console.log(`Checkbox change for skill ${skill.name} (${skillIdStr}):`, checked);
                      handleSkillCheckboxChange(skillIdStr, checked === true);
                    }}
                    disabled={isSubmitting}
                  />
                  <label htmlFor={`skill-${skillIdStr}`} className="text-sm">
                    {skill.name}
                    {skill.proficiencyLevel && (
                      <span className="text-xs text-gray-500 ml-1">
                        ({skill.proficiencyLevel})
                      </span>
                    )}
                  </label>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground">No skills found. Please add skills in the Skills Module.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SkillSelection;
