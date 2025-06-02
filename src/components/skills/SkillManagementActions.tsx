
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Shield, Database, AlertTriangle, CheckCircle } from 'lucide-react';
import { createSkill } from '@/services/skills/skillsService';
import { getCriticalSkills, validateCriticalSkillsPresent } from '@/services/skills/defaults';
import { toast } from 'sonner';

interface SkillManagementActionsProps {
  currentSkills: any[];
}

/**
 * Skills Management Actions Component
 * 
 * Provides administrative actions for managing the skills system,
 * including restoring critical skills and system maintenance.
 */
const SkillManagementActions: React.FC<SkillManagementActionsProps> = ({ currentSkills }) => {
  const [isRestoring, setIsRestoring] = useState(false);
  const queryClient = useQueryClient();

  const criticalSkills = getCriticalSkills();
  const healthStatus = validateCriticalSkillsPresent(currentSkills);

  const restoreCriticalSkillsMutation = useMutation({
    mutationFn: async () => {
      const missingSkills = criticalSkills.filter(critical => 
        !currentSkills.some(existing => existing.name === critical.name)
      );
      
      const results = await Promise.allSettled(
        missingSkills.map(skill => 
          createSkill({
            name: skill.name,
            description: skill.description,
            category: skill.category,
            proficiencyLevel: skill.proficiencyLevel
          })
        )
      );
      
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;
      
      return { successful, failed, total: missingSkills.length };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      queryClient.invalidateQueries({ queryKey: ['skills-health-check'] });
      
      if (result.failed === 0) {
        toast.success(`Successfully restored ${result.successful} critical skills`);
      } else {
        toast.warning(`Restored ${result.successful} skills, ${result.failed} failed`);
      }
    },
    onError: (error) => {
      console.error('Failed to restore critical skills:', error);
      toast.error('Failed to restore critical skills. Please try again.');
    }
  });

  const handleRestoreCriticalSkills = async () => {
    setIsRestoring(true);
    try {
      await restoreCriticalSkillsMutation.mutateAsync();
    } finally {
      setIsRestoring(false);
    }
  };

  const missingCriticalSkills = criticalSkills.filter(critical => 
    !currentSkills.some(existing => existing.name === critical.name)
  );

  return (
    <div className="space-y-4">
      {!healthStatus.isValid && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Critical Skills Missing</AlertTitle>
          <AlertDescription>
            <div className="space-y-2">
              <p>The following critical skills are missing and may cause system issues:</p>
              <div className="flex flex-wrap gap-1">
                {healthStatus.missingSkills.map(skill => (
                  <Badge key={skill} variant="destructive">{skill}</Badge>
                ))}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap gap-2">
        {missingCriticalSkills.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Restore Critical Skills ({missingCriticalSkills.length})
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Restore Critical Skills</AlertDialogTitle>
                <AlertDialogDescription>
                  This will restore the following missing critical skills to the database:
                  <div className="mt-2 space-y-1">
                    {missingCriticalSkills.map(skill => (
                      <div key={skill.name} className="flex items-center gap-2">
                        <Badge variant="outline">{skill.name}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {skill.description}
                        </span>
                      </div>
                    ))}
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleRestoreCriticalSkills}
                  disabled={isRestoring}
                >
                  {isRestoring ? 'Restoring...' : 'Restore Skills'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {healthStatus.isValid && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">All critical skills are present</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillManagementActions;
