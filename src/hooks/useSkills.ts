
import { useQuery } from '@tanstack/react-query';
import { getSkills } from '@/services/skills/skillsService';

/**
 * Hook to fetch all skills
 */
export const useSkills = () => {
  return useQuery({
    queryKey: ['skills'],
    queryFn: getSkills,
  });
};
