
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getAllSkills } from '@/services/skillService';
import { Skill } from '@/types/skill';

/**
 * Custom hook to fetch skill names by their IDs
 * @param skillIds Array of skill IDs to fetch names for
 * @returns Object mapping skill IDs to their names and loading/error states
 */
export const useSkillNames = (skillIds: string[] = []) => {
  const { 
    data: skills, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['skills'],
    queryFn: getAllSkills,
    // Only fetch if there are skill IDs to look up
    enabled: skillIds.length > 0,
  });

  // Create a stable map of skill IDs to skill objects
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
