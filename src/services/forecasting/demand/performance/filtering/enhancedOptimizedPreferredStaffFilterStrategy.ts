
import { DemandMatrixData, DemandFilters } from '@/types/demand';
import { OptimizedPreferredStaffFilterStrategy } from './optimizedPreferredStaffFilterStrategy';
import { normalizeStaffId } from '@/utils/staffIdUtils';

/**
 * Enhanced Optimized Preferred Staff Filter Strategy with Cross-Filter Comparison
 * 
 * Extends the OptimizedPreferredStaffFilterStrategy with comprehensive debugging
 * to compare staff-based filtering against skill-based filtering results.
 */
export class EnhancedOptimizedPreferredStaffFilterStrategy extends OptimizedPreferredStaffFilterStrategy {
  
  getName(): string {
    return 'EnhancedOptimizedPreferredStaffFilter';
  }

  /**
   * Enhanced data point filtering with cross-comparison debugging
   */
  protected shouldIncludeDataPoint(dataPoint: any, filters: DemandFilters): boolean {
    console.log(`🔍 [ENHANCED STAFF FILTER - DEBUG] Processing dataPoint with cross-comparison:`, {
      skillType: dataPoint.skillType,
      month: dataPoint.month,
      monthLabel: dataPoint.monthLabel,
      demandHours: dataPoint.demandHours,
      taskCount: dataPoint.taskCount,
      hasTaskBreakdown: !!dataPoint.taskBreakdown,
      taskBreakdownLength: dataPoint.taskBreakdown?.length || 0
    });

    if (!dataPoint.taskBreakdown || dataPoint.taskBreakdown.length === 0) {
      console.log(`❌ [ENHANCED STAFF FILTER - DEBUG] No task breakdown found, excluding dataPoint`);
      return false;
    }

    // Get or create optimized staff lookup set
    const lookupSet = this.getEnhancedStaffLookupSet(filters.preferredStaff);
    
    console.log(`🎯 [ENHANCED STAFF FILTER - DEBUG] Filter criteria with cross-comparison:`, {
      originalPreferredStaff: filters.preferredStaff,
      normalizedLookupSet: Array.from(lookupSet),
      lookupSetSize: lookupSet.size,
      dataPointSkillType: dataPoint.skillType
    });

    // Cross-comparison: Analyze skill distribution in this data point
    const skillDistribution = new Map<string, number>();
    const staffDistribution = new Map<string, number>();
    let foundMatch = false;

    // Analyze all tasks for cross-comparison insights
    for (let i = 0; i < dataPoint.taskBreakdown.length; i++) {
      const task = dataPoint.taskBreakdown[i];
      
      // Count skill distribution
      if (task.skillType) {
        const currentSkillCount = skillDistribution.get(task.skillType) || 0;
        skillDistribution.set(task.skillType, currentSkillCount + 1);
      }

      // Count staff distribution
      if (task.preferredStaffName) {
        const currentStaffCount = staffDistribution.get(task.preferredStaffName) || 0;
        staffDistribution.set(task.preferredStaffName, currentStaffCount + 1);
      }
      
      console.log(`📋 [ENHANCED STAFF FILTER - DEBUG] Task ${i + 1}/${dataPoint.taskBreakdown.length} analysis:`, {
        taskName: task.taskName,
        clientName: task.clientName,
        skillType: task.skillType,
        preferredStaffId: task.preferredStaffId,
        preferredStaffName: task.preferredStaffName,
        hasPreferredStaffId: !!task.preferredStaffId,
        hasPreferredStaffName: !!task.preferredStaffName
      });

      if (task.preferredStaffId) {
        const normalizedStaffId = normalizeStaffId(task.preferredStaffId);
        const hasMatch = normalizedStaffId && lookupSet.has(normalizedStaffId);
        
        // ADD THE EXACT DEBUGGING YOU REQUESTED
        console.log('🔍 EXACT FILTER COMPARISON:', {
          marcianoUUID: '654242eb-7298-4218-9c3f-a9b9152f712d',
          filterLookupSet: Array.from(lookupSet),
          taskPreferredStaffId: task.preferredStaffId,
          taskSkillType: task.skillType,
          normalizedStaffId: normalizedStaffId,
          
          // The critical checks:
          matchingByUUID: lookupSet.has(normalizedStaffId || ''),
          matchingBySkill: lookupSet.has(task.skillType?.toLowerCase() || ''),
          
          // What's actually being returned
          finalMatch: hasMatch
        });
        
        console.log(`🔍 [ENHANCED STAFF FILTER - DEBUG] Staff ID comparison with cross-analysis:`, {
          originalStaffId: task.preferredStaffId,
          normalizedStaffId: normalizedStaffId,
          isInLookupSet: hasMatch,
          lookupSetContains: Array.from(lookupSet),
          comparisonResult: hasMatch ? 'MATCH FOUND' : 'NO MATCH',
          taskSkillType: task.skillType,
          crossComparisonNote: `This ${task.skillType} task ${hasMatch ? 'WOULD' : 'WOULD NOT'} be included in staff filter`
        });

        if (hasMatch) {
          console.log(`✅ [ENHANCED STAFF FILTER - DEBUG] MATCH FOUND! Task will be included:`, {
            taskName: task.taskName,
            clientName: task.clientName,
            matchedStaffId: normalizedStaffId,
            originalStaffId: task.preferredStaffId,
            taskSkillType: task.skillType,
            crossComparisonInsight: `This task would ${task.skillType === 'Senior' ? 'ALSO' : 'NOT'} match Senior skill filter`
          });
          foundMatch = true;
          break; // Early exit on first match
        }
      } else {
        console.log(`⚠️ [ENHANCED STAFF FILTER - DEBUG] Task has no preferredStaffId:`, {
          taskName: task.taskName,
          skillType: task.skillType,
          crossComparisonNote: `This ${task.skillType} task would only appear in skill-based filtering`
        });
      }
    }

    // Log cross-comparison summary
    console.log(`📊 [ENHANCED STAFF FILTER - DEBUG] Cross-comparison summary:`, {
      skillDistribution: Object.fromEntries(skillDistribution),
      staffDistribution: Object.fromEntries(staffDistribution),
      totalUniqueSkills: skillDistribution.size,
      totalUniqueStaff: staffDistribution.size,
      dataPointSkillType: dataPoint.skillType,
      monthLabel: dataPoint.monthLabel
    });

    // Special analysis for target staff members
    const targetStaff = ['Marciano Urbaez', 'Maria Vargas', 'Luis Rodriguez'];
    targetStaff.forEach(staffName => {
      const taskCount = staffDistribution.get(staffName) || 0;
      console.log(`🎯 [ENHANCED STAFF FILTER - DEBUG] ${staffName} cross-analysis:`, {
        tasksInThisDataPoint: taskCount,
        dataPointSkillType: dataPoint.skillType,
        monthLabel: dataPoint.monthLabel,
        wouldMatchSkillFilter: dataPoint.skillType === 'Senior' ? 'YES' : 'NO',
        wouldMatchStaffFilter: taskCount > 0 ? 'YES' : 'NO',
        crossComparisonResult: taskCount > 0 && dataPoint.skillType === 'Senior' ? 'BOTH FILTERS MATCH' : 
                              taskCount > 0 ? 'ONLY STAFF FILTER MATCHES' :
                              dataPoint.skillType === 'Senior' ? 'ONLY SKILL FILTER MATCHES' : 'NEITHER FILTER MATCHES'
      });
    });

    const finalResult = foundMatch;
    console.log(`🏁 [ENHANCED STAFF FILTER - DEBUG] Final decision with cross-comparison:`, {
      skillType: dataPoint.skillType,
      month: dataPoint.monthLabel,
      taskCount: dataPoint.taskBreakdown.length,
      foundMatch: foundMatch,
      willIncludeDataPoint: finalResult ? 'YES' : 'NO',
      crossComparisonInsight: finalResult ? 
        `This dataPoint would ${dataPoint.skillType === 'Senior' ? 'ALSO' : 'NOT'} be included in Senior skill filter` :
        `This dataPoint would ${dataPoint.skillType === 'Senior' ? 'STILL' : 'ALSO NOT'} be ${dataPoint.skillType === 'Senior' ? 'included' : 'excluded'} in Senior skill filter`
    });

    return finalResult;
  }

  /**
   * Get enhanced staff lookup set with enhanced debugging (renamed to avoid conflict)
   */
  private getEnhancedStaffLookupSet(preferredStaff: (string | number | null | undefined)[]): Set<string> {
    const cacheKey = JSON.stringify(preferredStaff.sort());
    
    console.log(`🏗️ [ENHANCED STAFF FILTER - DEBUG] Creating enhanced lookup set:`, {
      originalPreferredStaff: preferredStaff,
      cacheKey: cacheKey.substring(0, 100) + '...'
    });
    
    // Use parent's cache if available
    const lookupSet = new Set<string>();
    preferredStaff.forEach((id, index) => {
      const normalized = normalizeStaffId(id);
      console.log(`🔄 [ENHANCED STAFF FILTER - DEBUG] Normalizing staff ID ${index + 1}:`, {
        originalId: id,
        normalizedId: normalized,
        willAdd: !!normalized
      });
      
      if (normalized) {
        lookupSet.add(normalized);
      }
    });
    
    console.log(`🚀 [ENHANCED STAFF FILTER - DEBUG] Created enhanced lookup set:`, {
      originalCount: preferredStaff.length,
      normalizedCount: lookupSet.size,
      finalLookupSet: Array.from(lookupSet)
    });
    
    return lookupSet;
  }
}
