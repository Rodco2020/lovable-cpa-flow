
import { useState, useEffect } from 'react';
import { TaskTemplate } from '@/types/task';
import { Skill } from '@/types/skill';

interface UseSkillCleanupProps {
  skills: Skill[];
  editingTemplate: TaskTemplate | null;
  getUnmatchedSkills?: (availableSkills: Array<{id: string, name: string}>) => string[];
  cleanupSkills?: (availableSkills: Array<{id: string, name: string}>) => void;
}

/**
 * Custom hook to manage skill cleanup logic for task template forms
 * Handles initial cleanup when editing templates and tracks cleanup state
 */
export const useSkillCleanup = ({
  skills,
  editingTemplate,
  getUnmatchedSkills,
  cleanupSkills
}: UseSkillCleanupProps) => {
  // Track if we've performed initial skill cleanup for editing templates
  const [hasPerformedInitialCleanup, setHasPerformedInitialCleanup] = useState(false);

  // Get unmatched skills when skills are loaded
  const unmatchedSkills = getUnmatchedSkills ? getUnmatchedSkills(skills) : [];

  // Handle skills loading and form initialization
  useEffect(() => {
    if (skills.length > 0 && editingTemplate && !hasPerformedInitialCleanup) {
      console.log('useSkillCleanup: Skills loaded, performing initial setup for editing template');
      console.log('Available skills:', skills.map(s => ({ id: s.id, name: s.name })));
      console.log('Template required skills:', editingTemplate.requiredSkills);
      
      // Only cleanup for existing templates, not new ones, and only once
      if (cleanupSkills) {
        cleanupSkills(skills);
      }
      
      setHasPerformedInitialCleanup(true);
    }
  }, [skills, cleanupSkills, editingTemplate, hasPerformedInitialCleanup]);

  // Reset cleanup flag when switching between templates
  useEffect(() => {
    setHasPerformedInitialCleanup(false);
  }, [editingTemplate?.id]);

  return {
    unmatchedSkills,
    hasPerformedInitialCleanup
  };
};
