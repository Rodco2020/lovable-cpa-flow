
import { useQuery } from '@tanstack/react-query';
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

  // Create a map of skill IDs to skill objects
  const skillsMap: Record<string, Skill> = {};
  
  if (skills) {
    skills.forEach((skill: Skill) => {
      skillsMap[skill.id] = skill;
    });
  }

  return {
    skillsMap,
    isLoading,
    error,
  };
};
