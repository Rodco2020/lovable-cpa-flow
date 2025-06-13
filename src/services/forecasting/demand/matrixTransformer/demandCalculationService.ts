
import { ForecastData } from '@/types/forecasting';
import { RecurringTaskDB, SkillType } from '@/types/task';
import { ClientTaskDemand } from '@/types/demand';
import { ClientResolutionService } from '../clientResolutionService';
import { RecurrenceCalculator } from '../recurrenceCalculator';
import { startOfMonth, endOfMonth } from 'date-fns';

/**
 * Service responsible for calculating demand for skills and periods
 * FIXED: Now uses consistent full-hours-per-skill logic
 * ENHANCED: Added detailed debugging for Bloom Advisory LLC CPA calculation
 */
export class DemandCalculationService {
  /**
   * Calculate demand for skill period with mapping support
   * ENHANCED: Added detailed debugging for CPA calculation investigation
   */
  static calculateDemandForSkillPeriodWithMapping(
    period: ForecastData, 
    skill: SkillType, 
    skillMapping: Map<string, string>
  ): number {
    try {
      if (!period || !Array.isArray(period.demand)) {
        return 0;
      }

      console.log(`🔍 [DEMAND CALC] Calculating demand for skill "${skill}" in period ${period.period} (FIXED logic)`);
      console.log(`📋 [DEMAND CALC] Available demand items:`, period.demand.map(d => ({ skill: d.skill, hours: d.hours })));

      // Try direct match first
      let skillDemand = period.demand.find(d => d && d.skill === skill);
      
      // If no direct match, try mapping-based match
      if (!skillDemand) {
        for (const demandItem of period.demand) {
          if (demandItem && demandItem.skill) {
            const mappedSkill = skillMapping.get(demandItem.skill);
            if (mappedSkill === skill) {
              skillDemand = demandItem;
              console.log(`🎯 [DEMAND CALC] Found skill via mapping: ${demandItem.skill} -> ${mappedSkill}`);
              break;
            }
          }
        }
      }

      if (!skillDemand || typeof skillDemand.hours !== 'number') {
        console.log(`⚠️ [DEMAND CALC] No demand found for skill "${skill}"`);
        return 0;
      }

      const hours = Math.max(0, skillDemand.hours);
      
      // ENHANCED: Special debugging for CPA skill to investigate 30h calculation
      if (skill === 'CPA' || skill.toLowerCase().includes('cpa')) {
        console.log(`🧐 [CPA DEBUG] CPA skill demand calculation:`, {
          skill,
          period: period.period,
          calculatedHours: hours,
          demandItem: skillDemand,
          allDemandItems: period.demand
        });
      }
      
      console.log(`✅ [DEMAND CALC] Found ${hours}h demand for skill "${skill}" (FIXED: using full hours per skill)`);
      return hours;
    } catch (error) {
      console.warn(`Error calculating demand for skill ${skill}:`, error);
      return 0;
    }
  }

  /**
   * Generate task breakdown with consistent client resolution using pre-resolved client map
   * ENHANCED: Added detailed debugging for Bloom Advisory LLC investigation
   */
  static async generateTaskBreakdownWithMapping(
    tasks: RecurringTaskDB[],
    skillDisplayName: SkillType,
    period: string,
    skillMapping: Map<string, string>,
    clientResolutionMap?: Map<string, string>
  ): Promise<ClientTaskDemand[]> {
    try {
      const breakdown: ClientTaskDemand[] = [];

      console.log(`🔍 [TASK BREAKDOWN] Generating breakdown for skill "${skillDisplayName}" with FIXED logic`);

      // Derive month boundaries from period string for recurrence calculation
      const periodDate = new Date(`${period}-01`);
      const monthStart = startOfMonth(periodDate);
      const monthEnd = endOfMonth(periodDate);

      // If no pre-resolved map provided, create one
      let resolvedClientMap = clientResolutionMap;
      if (!resolvedClientMap) {
        const clientIds = new Set<string>();
        tasks.forEach(task => {
          if (task.client_id) {
            clientIds.add(task.client_id);
          }
        });
        resolvedClientMap = await ClientResolutionService.resolveClientIds(Array.from(clientIds));
      }

      // Build breakdown with pre-resolved client names
      for (const task of tasks) {
        try {
          if (!task || !Array.isArray(task.required_skills)) continue;
          
          const clientId = task.client_id || 'unknown';
          const clientName = resolvedClientMap.get(clientId) || `Client ${clientId.substring(0, 8)}...`;
          
          // ENHANCED: Special debugging for Bloom Advisory LLC
          const isBloomAdvisory = clientName.toLowerCase().includes('bloom');
          
          // Check if task requires this skill using mapping
          let hasSkill = false;
          let skillMatchDetails = [];
          
          for (const taskSkillRef of task.required_skills) {
            const mappedSkillName = skillMapping.get(taskSkillRef);
            skillMatchDetails.push({
              originalSkill: taskSkillRef,
              mappedSkill: mappedSkillName,
              matchesTargetSkill: mappedSkillName === skillDisplayName
            });
            
            if (mappedSkillName === skillDisplayName) {
              hasSkill = true;
            }
          }

          if (hasSkill) {
            // Calculate monthly recurrence for this task within the period
            const recurrence = RecurrenceCalculator.calculateMonthlyDemand(
              task,
              monthStart,
              monthEnd
            );

            // FIXED: Use full task hours for each skill (not divided)
            const fullTaskHours = Math.max(0, task.estimated_hours || 0);
            const monthlyTaskHours = recurrence.monthlyOccurrences * fullTaskHours;

            const demandItem: ClientTaskDemand = {
              clientId: clientId,
              clientName: clientName,
              recurringTaskId: task.id,
              taskName: task.name || 'Unnamed Task',
              skillType: skillDisplayName,
              estimatedHours: fullTaskHours, // FIXED: Full task hours
              recurrencePattern: {
                type: task.recurrence_type || 'Monthly',
                interval: task.recurrence_interval || 1,
                frequency: recurrence.monthlyOccurrences
              },
              monthlyHours: monthlyTaskHours // FIXED: Full monthly hours
            };

            breakdown.push(demandItem);
            
            // ENHANCED: Special debugging for Bloom Advisory LLC CPA calculations
            if (isBloomAdvisory && (skillDisplayName === 'CPA' || skillDisplayName.toLowerCase().includes('cpa'))) {
              console.log(`🧐 [BLOOM CPA DEBUG] Found Bloom Advisory CPA task:`, {
                taskId: task.id,
                taskName: task.name,
                clientName,
                period,
                skillDisplayName,
                originalSkills: task.required_skills,
                skillMatchDetails,
                recurrenceType: task.recurrence_type,
                recurrenceInterval: task.recurrence_interval,
                estimatedHours: fullTaskHours,
                monthlyOccurrences: recurrence.monthlyOccurrences,
                monthlyTaskHours,
                calculation: `${fullTaskHours}h × ${recurrence.monthlyOccurrences} occurrences = ${monthlyTaskHours}h`
              });
            }
            
            console.log(`✨ [TASK BREAKDOWN] Added task ${task.id} (${clientName}) to breakdown for skill "${skillDisplayName}" with ${monthlyTaskHours}h (FIXED)`);
          } else if (isBloomAdvisory) {
            // Log Bloom Advisory tasks that don't match CPA skill for investigation
            console.log(`🔍 [BLOOM DEBUG] Bloom Advisory task excluded from CPA:`, {
              taskId: task.id,
              taskName: task.name,
              requiredSkills: task.required_skills,
              skillMatchDetails,
              targetSkill: skillDisplayName
            });
          }
        } catch (itemError) {
          console.warn(`Error creating demand item for task ${task.id}:`, itemError);
        }
      }

      // ENHANCED: Special summary for CPA skill calculations
      if (skillDisplayName === 'CPA' || skillDisplayName.toLowerCase().includes('cpa')) {
        const totalCPAHours = breakdown.reduce((sum, item) => sum + item.monthlyHours, 0);
        const bloomTasks = breakdown.filter(item => item.clientName.toLowerCase().includes('bloom'));
        const bloomHours = bloomTasks.reduce((sum, item) => sum + item.monthlyHours, 0);
        
        console.log(`🧐 [CPA SUMMARY] CPA skill breakdown for period ${period}:`, {
          totalCPATasks: breakdown.length,
          totalCPAHours,
          bloomAdvisoryTasks: bloomTasks.length,
          bloomAdvisoryHours: bloomHours,
          bloomTaskDetails: bloomTasks.map(t => ({
            taskName: t.taskName,
            hours: t.monthlyHours,
            occurrences: t.recurrencePattern.frequency
          }))
        });
      }

      console.log(`📊 [TASK BREAKDOWN] Generated ${breakdown.length} items for skill "${skillDisplayName}" with FIXED logic`);
      return breakdown;
    } catch (error) {
      console.warn(`Error generating task breakdown for ${skillDisplayName}:`, error);
      return [];
    }
  }
}
