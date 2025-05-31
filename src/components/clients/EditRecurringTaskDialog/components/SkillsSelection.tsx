
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FormItem, FormLabel } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { getAllSkills } from '@/services/skillService';

interface SkillsSelectionProps {
  selectedSkills: string[];
  toggleSkill: (skillId: string) => void;
  skillsError: string | null;
}

export const SkillsSelection = ({ selectedSkills, toggleSkill, skillsError }: SkillsSelectionProps) => {
  // Fetch skills from database
  const {
    data: availableSkills = [],
    isLoading: isLoadingSkills,
    error: skillsFetchError,
    refetch: refetchSkills
  } = useQuery({
    queryKey: ['skills'],
    queryFn: getAllSkills,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  });

  const handleSkillsRetry = () => {
    refetchSkills();
  };

  return (
    <FormItem>
      <FormLabel>Required Skills</FormLabel>
      <div className="border rounded-md p-3 space-y-2">
        {isLoadingSkills ? (
          <div className="flex items-center py-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary mr-2" />
            <span className="text-sm">Loading skills...</span>
          </div>
        ) : skillsFetchError ? (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription className="flex flex-col gap-2">
              <div>Failed to load skills: {skillsFetchError instanceof Error ? skillsFetchError.message : 'Unknown error'}</div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSkillsRetry}
                className="w-fit"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Loading Skills
              </Button>
            </AlertDescription>
          </Alert>
        ) : availableSkills.length > 0 ? (
          <>
            <div className="flex flex-wrap gap-2 mb-2">
              {availableSkills.map((skill) => {
                const skillId = String(skill.id);
                const isSelected = selectedSkills.includes(skillId);
                
                return (
                  <Badge
                    key={skillId}
                    variant={isSelected ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer hover:bg-secondary transition-colors",
                      isSelected 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-background text-foreground"
                    )}
                    onClick={() => toggleSkill(skillId)}
                  >
                    {skill.name}
                    {skill.proficiencyLevel && (
                      <span className="ml-1 text-xs">
                        ({skill.proficiencyLevel})
                      </span>
                    )}
                    {isSelected && (
                      <span className="ml-1 text-xs">✓</span>
                    )}
                  </Badge>
                );
              })}
            </div>
            {selectedSkills.length > 0 ? (
              <div className="text-xs text-muted-foreground">
                Selected: {selectedSkills.map(skillId => {
                  const skill = availableSkills.find(s => String(s.id) === skillId);
                  return skill?.name || skillId;
                }).join(', ')}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">
                Click to select required skills
              </div>
            )}
          </>
        ) : (
          <div className="text-sm text-muted-foreground">
            No skills available. Please add skills in the Skills Module first.
          </div>
        )}
        {skillsError && (
          <div className="text-sm font-medium text-destructive" role="alert">
            {skillsError}
          </div>
        )}
      </div>
    </FormItem>
  );
};
