
import { useQuery } from '@tanstack/react-query';
import { DemandMatrixData } from '@/types/demand';
import { SkillType } from '@/types/task';

interface UseDemandDataProps {
  monthRange: { start: number; end: number };
  selectedSkills: SkillType[];
}

interface DemandDataResponse extends DemandMatrixData {
  availableClients: Array<{ id: string; name: string }>;
  availablePreferredStaff: Array<{ id: string; name: string }>;
}

/**
 * Hook for fetching demand matrix data
 */
export const useDemandData = ({ monthRange, selectedSkills }: UseDemandDataProps) => {
  return useQuery({
    queryKey: ['demandData', monthRange, selectedSkills],
    queryFn: async (): Promise<DemandDataResponse> => {
      // Mock implementation for now
      const mockData: DemandDataResponse = {
        months: [
          { key: 'jan', label: 'Jan' },
          { key: 'feb', label: 'Feb' },
          { key: 'mar', label: 'Mar' }
        ],
        dataPoints: [],
        availableClients: [
          { id: 'client1', name: 'Client A' },
          { id: 'client2', name: 'Client B' }
        ],
        availablePreferredStaff: [
          { id: 'staff1', name: 'John Doe' },
          { id: 'staff2', name: 'Jane Smith' }
        ]
      };
      
      return mockData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
