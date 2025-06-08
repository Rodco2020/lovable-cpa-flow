
import { useQuery } from '@tanstack/react-query';
import { getAllSkills } from '@/services/skills/skillsService';

/**
 * Hook to fetch all skills
 */
export const useSkills = () => {
  return useQuery({
    queryKey: ['skills'],
    queryFn: getAllSkills,
  });
};
