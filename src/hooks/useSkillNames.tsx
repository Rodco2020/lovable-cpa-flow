
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getSkillsByIds } from '@/services/skills/skillsService';
import { Skill } from '@/types/skill';

/**
 * Custom hook to fetch skill names by their UUIDs
 * @param skillIds Array of skill UUIDs to fetch names for
 * @returns Object mapping skill UUIDs to their skill objects and loading/error states
 */
export const useSkillNames = (skillIds: string[] = []) => {
  const { 
    data: skills, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['skills-by-ids', skillIds],
    queryFn: () => getSkillsByIds(skillIds),
    // Only fetch if there are skill IDs to look up
    enabled: skillIds.length > 0,
  });

  // Create a stable map of skill UUIDs to skill objects
  const skillsMap: Record<string, Skill> = useMemo(() => {
    const map: Record<string, Skill> = {};
    if (skills) {
      skills.forEach((skill: Skill) => {
        map[skill.id] = skill;
      });
    }
    return map;
  }, [skills]);

  return {
    skillsMap,
    isLoading,
    error,
  };
};
