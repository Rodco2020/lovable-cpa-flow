
import { useQuery } from '@tanstack/react-query';
import { DemandMatrixData } from '@/types/demand';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to fetch demand matrix data for testing purposes
 */
export const useDemandMatrixData = () => {
  return useQuery({
    queryKey: ['demand-matrix-data'],
    queryFn: async (): Promise<DemandMatrixData> => {
      console.log('🔍 [DATA HOOK] Fetching demand matrix data for testing');
      
      // Fetch recurring tasks with basic data
      const { data: tasks, error } = await supabase
        .from('recurring_tasks')
        .select(`
          id,
          client_id,
          template_id,
          estimated_hours,
          priority,
          status,
          required_skills,
          name,
          clients!inner(id, legal_name),
          task_templates!inner(id, name, required_skills, category)
        `)
        .eq('status', 'Active')
        .limit(100);

      if (error) {
        console.error('❌ [DATA HOOK] Error fetching tasks:', error);
        throw error;
      }

      // Create mock demand matrix data structure
      const mockData: DemandMatrixData = {
        months: [
          { key: '2024-01', label: 'Jan 2024' },
          { key: '2024-02', label: 'Feb 2024' },
          { key: '2024-03', label: 'Mar 2024' },
          { key: '2024-04', label: 'Apr 2024' },
          { key: '2024-05', label: 'May 2024' },
          { key: '2024-06', label: 'Jun 2024' }
        ],
        skills: ['Junior', 'Senior', 'CPA'],
        dataPoints: [],
        totalDemand: 0,
        totalTasks: tasks?.length || 0,
        totalClients: 0,
        skillSummary: [],
        // Initialize client-related maps
        clientTotals: new Map(),
        clientRevenue: new Map(),
        clientHourlyRates: new Map(),
        clientSuggestedRevenue: new Map(),
        clientExpectedLessSuggested: new Map(),
        revenueTotals: {
          totalRevenue: 0,
          totalSuggestedRevenue: 0,
          totalExpectedLessSuggested: 0
        }
      };

      // Transform tasks into data points
      if (tasks && tasks.length > 0) {
        let totalHours = 0;
        const clientSet = new Set<string>();

        tasks.forEach((task: any) => {
          const skill = Array.isArray(task.required_skills) 
            ? task.required_skills[0] || 'Junior'
            : 'Junior';
          
          const monthlyHours = task.estimated_hours || 5;
          totalHours += monthlyHours;
          clientSet.add(task.client_id);

          // Create data points for each month and skill
          mockData.months.forEach(month => {
            const existingPoint = mockData.dataPoints.find(
              p => p.month === month.key && p.skillType === skill
            );

            if (existingPoint) {
              existingPoint.demandHours += monthlyHours;
              existingPoint.taskCount += 1;
              existingPoint.taskBreakdown = existingPoint.taskBreakdown || [];
              existingPoint.taskBreakdown.push({
                clientTaskDemandId: task.id,
                taskName: task.name || 'Unknown Task',
                clientId: task.client_id,
                clientName: task.clients?.legal_name || 'Unknown Client',
                monthlyHours,
                skillType: skill, // Add skillType property
                preferredStaff: null
              });
            } else {
              mockData.dataPoints.push({
                month: month.key,
                monthLabel: month.label, // Add monthLabel property
                skillType: skill,
                demandHours: monthlyHours,
                taskCount: 1,
                clientCount: 1,
                taskBreakdown: [{
                  clientTaskDemandId: task.id,
                  taskName: task.name || 'Unknown Task',
                  clientId: task.client_id,
                  clientName: task.clients?.legal_name || 'Unknown Client',
                  monthlyHours,
                  skillType: skill, // Add skillType property
                  preferredStaff: null
                }]
              });
            }
          });
        });

        mockData.totalDemand = totalHours;
        mockData.totalClients = clientSet.size;
        
        // Create skill summary with correct structure
        mockData.skillSummary = mockData.skills.map(skill => ({
          skillType: skill,
          totalDemand: mockData.dataPoints
            .filter(p => p.skillType === skill)
            .reduce((sum, p) => sum + p.demandHours, 0),
          totalHours: mockData.dataPoints
            .filter(p => p.skillType === skill)
            .reduce((sum, p) => sum + p.demandHours, 0), // Add totalHours property
          taskCount: mockData.dataPoints
            .filter(p => p.skillType === skill)
            .reduce((sum, p) => sum + p.taskCount, 0)
        }));
      }

      console.log('✅ [DATA HOOK] Demand data fetched:', {
        dataPoints: mockData.dataPoints.length,
        totalDemand: mockData.totalDemand,
        totalTasks: mockData.totalTasks
      });

      return mockData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });
};
