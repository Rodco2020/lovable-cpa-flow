
import { useQuery } from '@tanstack/react-query';
import { DemandMatrixData } from '@/types/demand';
import { SkillType } from '@/types/task';
import { supabase } from '@/lib/supabaseClient';
import { SkillResolutionService } from '../skillResolution/skillResolutionService';

interface UseDemandDataProps {
  monthRange: { start: number; end: number };
  selectedSkills: SkillType[];
}

interface DemandDataResponse extends DemandMatrixData {
  availableClients: Array<{ id: string; name: string }>;
  availablePreferredStaff: Array<{ id: string; name: string }>;
}

// Type for the task data with clients relation - matching actual Supabase response
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
  }[] | null; // Supabase returns this as an array, not a single object
}

/**
 * Enhanced Hook for fetching real demand matrix data from Supabase
 * 
 * Phase 2 Enhancement: Integrated with skill resolution service to properly
 * handle UUID-to-name conversion while maintaining data integrity and filtering.
 */
export const useDemandData = ({ monthRange, selectedSkills }: UseDemandDataProps) => {
  return useQuery({
    queryKey: ['demandData', monthRange, selectedSkills],
    queryFn: async (): Promise<DemandDataResponse> => {
      console.log('🚀 [PHASE 2 DEMAND DATA] Fetching real demand data with skill resolution');
      
      try {
        // Phase 2: Initialize skill resolution service first
        console.log('🔧 [PHASE 2] Initializing skill resolution service...');
        await SkillResolutionService.initializeSkillCache();

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

        // Phase 2: Fetch skills with both ID and name for resolution mapping
        const { data: skillsData, error: skillsError } = await supabase
          .from('skills')
          .select('id, name')
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

        console.log('✅ [PHASE 2 DEMAND DATA] Successfully fetched data:', {
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

        // Phase 2: Get all available skill names via resolution service
        const skills = await SkillResolutionService.getAllSkillNames();
        console.log('📋 [PHASE 2] Available skills from resolution service:', skills.length);

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

        // Phase 2: Transform recurring tasks with skill resolution
        const dataPoints = [];
        const skillSummary: { [skill: string]: { totalHours: number; taskCount: number; clientCount: number } } = {};

        // Initialize skill summary for all available skills
        skills.forEach(skill => {
          skillSummary[skill] = { totalHours: 0, taskCount: 0, clientCount: 0 };
        });

        if (tasksData && tasksData.length > 0) {
          console.log('🔄 [PHASE 2] Processing tasks with skill resolution...');
          
          // Cast the tasks data to our properly typed interface
          const typedTasks = tasksData as TaskWithClient[];
          
          for (const task of typedTasks) {
            console.log(`📝 [PHASE 2] Processing task: ${task.name}`, {
              taskId: task.id,
              requiredSkills: task.required_skills,
              skillsType: typeof task.required_skills,
              isArray: Array.isArray(task.required_skills)
            });

            // Phase 2: Enhanced skill processing with UUID resolution
            const requiredSkills = Array.isArray(task.required_skills) ? task.required_skills : [];
            
            if (requiredSkills.length === 0) {
              console.warn(`⚠️ [PHASE 2] Task ${task.name} has no required skills, skipping`);
              continue;
            }

            // Phase 2: Resolve skill UUIDs to names
            let resolvedSkillNames: string[] = [];
            try {
              // First validate the skill references
              const validation = await SkillResolutionService.validateSkillReferences(requiredSkills);
              
              if (validation.valid.length > 0) {
                // Resolve UUIDs to names
                resolvedSkillNames = await SkillResolutionService.getSkillNames(validation.valid);
                
                console.log(`🔍 [PHASE 2] Skill resolution for task ${task.name}:`, {
                  originalSkills: requiredSkills,
                  validSkills: validation.valid,
                  invalidSkills: validation.invalid,
                  resolvedNames: resolvedSkillNames,
                  diagnostics: validation.diagnostics
                });
              } else {
                console.warn(`⚠️ [PHASE 2] No valid skills found for task ${task.name}:`, {
                  originalSkills: requiredSkills,
                  validation
                });
                continue;
              }
            } catch (error) {
              console.error(`❌ [PHASE 2] Error resolving skills for task ${task.name}:`, error);
              continue;
            }

            // Process each resolved skill for the task
            for (const skillName of resolvedSkillNames) {
              // Only process skills that are in our available skills list
              if (skills.includes(skillName)) {
                console.log(`✅ [PHASE 2] Processing skill: ${skillName} for task: ${task.name}`);
                
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
                    // Safely access client name from the clients relation array
                    const clientName = task.clients && task.clients.length > 0 
                      ? task.clients[0].legal_name 
                      : 'Unknown Client';

                    dataPoints.push({
                      skillType: skillName, // Phase 2: Now using resolved skill name
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
                    if (skillSummary[skillName]) {
                      skillSummary[skillName].totalHours += monthlyHours;
                      skillSummary[skillName].taskCount += 1;
                      skillSummary[skillName].clientCount = new Set([...Array.from({ length: skillSummary[skillName].clientCount }), task.client_id]).size;
                    }
                  }
                }
              } else {
                console.warn(`⚠️ [PHASE 2] Resolved skill "${skillName}" not found in available skills list`);
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
          skills, // Phase 2: Using resolved skill names
          totalDemand,
          totalTasks,
          totalClients,
          skillSummary,
          availableClients,
          availablePreferredStaff
        };

        console.log('📊 [PHASE 2 DEMAND DATA] Generated enhanced demand matrix data:', {
          dataPointsCount: dataPoints.length,
          totalDemand,
          totalTasks,
          totalClients,
          skillsCount: skills.length,
          availableClientsCount: availableClients.length,
          availableStaffCount: availablePreferredStaff.length,
          skillSummaryKeys: Object.keys(skillSummary).length
        });

        return result;

      } catch (error) {
        console.error('❌ [PHASE 2 DEMAND DATA] Critical error fetching demand data:', error);
        
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
