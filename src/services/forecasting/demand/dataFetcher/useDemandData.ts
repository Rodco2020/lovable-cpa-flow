
import { useQuery } from '@tanstack/react-query';
import { DemandMatrixData } from '@/types/demand';
import { SkillType } from '@/types/task';
import { supabase } from '@/lib/supabaseClient';

interface UseDemandDataProps {
  monthRange: { start: number; end: number };
  selectedSkills: SkillType[];
}

interface DemandDataResponse extends DemandMatrixData {
  availableClients: Array<{ id: string; name: string }>;
  availablePreferredStaff: Array<{ id: string; name: string }>;
}

// Type for the task data with clients relation
interface TaskWithClient {
  id: string;
  name: string;
  client_id: string;
  estimated_hours: number;
  required_skills: string[];
  recurrence_type: string;
  recurrence_interval: number;
  is_active: boolean;
  preferred_staff_id: string | null;
  clients: {
    id: string;
    legal_name: string;
  } | null;
}

/**
 * Hook for fetching real demand matrix data from Supabase
 * 
 * This replaces the previous mock implementation with actual data fetching
 * from clients, staff, and recurring_tasks tables.
 */
export const useDemandData = ({ monthRange, selectedSkills }: UseDemandDataProps) => {
  return useQuery({
    queryKey: ['demandData', monthRange, selectedSkills],
    queryFn: async (): Promise<DemandDataResponse> => {
      console.log('🚀 [DEMAND DATA] Fetching real demand data from Supabase');
      
      try {
        // Fetch clients
        const { data: clientsData, error: clientsError } = await supabase
          .from('clients')
          .select('id, legal_name')
          .eq('status', 'Active');

        if (clientsError) {
          console.error('❌ [DEMAND DATA] Error fetching clients:', clientsError);
          throw clientsError;
        }

        // Fetch staff for preferred staff filtering
        const { data: staffData, error: staffError } = await supabase
          .from('staff')
          .select('id, full_name')
          .eq('status', 'active');

        if (staffError) {
          console.error('❌ [DEMAND DATA] Error fetching staff:', staffError);
          throw staffError;
        }

        // Fetch skills for filtering and matrix generation
        const { data: skillsData, error: skillsError } = await supabase
          .from('skills')
          .select('name')
          .order('name');

        if (skillsError) {
          console.error('❌ [DEMAND DATA] Error fetching skills:', skillsError);
          throw skillsError;
        }

        // Fetch recurring tasks with client information
        const { data: tasksData, error: tasksError } = await supabase
          .from('recurring_tasks')
          .select(`
            id,
            name,
            client_id,
            estimated_hours,
            required_skills,
            recurrence_type,
            recurrence_interval,
            is_active,
            preferred_staff_id,
            clients (
              id,
              legal_name
            )
          `)
          .eq('is_active', true);

        if (tasksError) {
          console.error('❌ [DEMAND DATA] Error fetching recurring tasks:', tasksError);
          throw tasksError;
        }

        console.log('✅ [DEMAND DATA] Successfully fetched data:', {
          clients: clientsData?.length || 0,
          staff: staffData?.length || 0,
          skills: skillsData?.length || 0,
          tasks: tasksData?.length || 0
        });

        // Transform the data into the expected format
        const availableClients = (clientsData || []).map(client => ({
          id: client.id,
          name: client.legal_name
        }));

        const availablePreferredStaff = (staffData || []).map(staff => ({
          id: staff.id,
          name: staff.full_name
        }));

        const skills = (skillsData || []).map(skill => skill.name);

        // Generate months for the current year (simplified for now)
        const months = [
          { key: 'jan', label: 'Jan' },
          { key: 'feb', label: 'Feb' },
          { key: 'mar', label: 'Mar' },
          { key: 'apr', label: 'Apr' },
          { key: 'may', label: 'May' },
          { key: 'jun', label: 'Jun' },
          { key: 'jul', label: 'Jul' },
          { key: 'aug', label: 'Aug' },
          { key: 'sep', label: 'Sep' },
          { key: 'oct', label: 'Oct' },
          { key: 'nov', label: 'Nov' },
          { key: 'dec', label: 'Dec' }
        ];

        // Transform recurring tasks into demand data points
        const dataPoints = [];
        const skillSummary: { [skill: string]: { totalHours: number; taskCount: number; clientCount: number } } = {};

        // Initialize skill summary
        skills.forEach(skill => {
          skillSummary[skill] = { totalHours: 0, taskCount: 0, clientCount: 0 };
        });

        if (tasksData && tasksData.length > 0) {
          // Cast the tasks data to our properly typed interface
          const typedTasks = tasksData as TaskWithClient[];
          
          for (const task of typedTasks) {
            // Process each skill required by the task
            const requiredSkills = Array.isArray(task.required_skills) ? task.required_skills : [];
            
            for (const skill of requiredSkills) {
              if (skills.includes(skill)) {
                // Create data points for each month (simplified projection)
                for (const month of months) {
                  const estimatedHours = task.estimated_hours || 0;
                  
                  // Calculate frequency based on recurrence type
                  let monthlyHours = 0;
                  switch (task.recurrence_type) {
                    case 'Monthly':
                      monthlyHours = estimatedHours;
                      break;
                    case 'Quarterly':
                      monthlyHours = estimatedHours / 3; // Spread quarterly over 3 months
                      break;
                    case 'Weekly':
                      monthlyHours = estimatedHours * 4.33; // ~4.33 weeks per month
                      break;
                    case 'Annually':
                      monthlyHours = estimatedHours / 12; // Spread annually over 12 months
                      break;
                    default:
                      monthlyHours = estimatedHours; // Default to monthly
                  }

                  if (monthlyHours > 0) {
                    // Safely access client name from the clients relation
                    const clientName = task.clients?.legal_name || 'Unknown Client';

                    dataPoints.push({
                      skillType: skill,
                      month: month.key,
                      demandHours: monthlyHours,
                      taskCount: 1,
                      clientCount: 1,
                      taskBreakdown: [{
                        taskId: task.id,
                        taskName: task.name,
                        clientId: task.client_id,
                        clientName: clientName,
                        estimatedHours: monthlyHours,
                        preferredStaff: task.preferred_staff_id ? {
                          staffId: task.preferred_staff_id,
                          name: availablePreferredStaff.find(s => s.id === task.preferred_staff_id)?.name || 'Unknown Staff'
                        } : null
                      }]
                    });

                    // Update skill summary
                    if (skillSummary[skill]) {
                      skillSummary[skill].totalHours += monthlyHours;
                      skillSummary[skill].taskCount += 1;
                      skillSummary[skill].clientCount = new Set([...Array.from({ length: skillSummary[skill].clientCount }), task.client_id]).size;
                    }
                  }
                }
              }
            }
          }
        }

        // Calculate totals
        const totalDemand = dataPoints.reduce((sum, point) => sum + (point.demandHours || 0), 0);
        const totalTasks = dataPoints.reduce((sum, point) => sum + (point.taskCount || 0), 0);
        const uniqueClients = new Set(dataPoints.map(point => point.taskBreakdown?.[0]?.clientId).filter(Boolean));
        const totalClients = uniqueClients.size;

        const result: DemandDataResponse = {
          months,
          dataPoints,
          skills,
          totalDemand,
          totalTasks,
          totalClients,
          skillSummary,
          availableClients,
          availablePreferredStaff
        };

        console.log('📊 [DEMAND DATA] Generated demand matrix data:', {
          dataPointsCount: dataPoints.length,
          totalDemand,
          totalTasks,
          totalClients,
          availableClientsCount: availableClients.length,
          availableStaffCount: availablePreferredStaff.length
        });

        return result;

      } catch (error) {
        console.error('❌ [DEMAND DATA] Critical error fetching demand data:', error);
        
        // Return minimal fallback data to prevent complete failure
        return {
          months: [
            { key: 'jan', label: 'Jan' },
            { key: 'feb', label: 'Feb' },
            { key: 'mar', label: 'Mar' }
          ],
          dataPoints: [],
          skills: [],
          totalDemand: 0,
          totalTasks: 0,
          totalClients: 0,
          skillSummary: {},
          availableClients: [],
          availablePreferredStaff: []
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: 1000,
  });
};
