
import { SkillType } from '@/types/task';
import { DemandDataPoint } from '@/types/demand';

/**
 * Skill Mapping Verification Utilities
 * Provides utilities to verify skill key transformations and mappings
 */
export class SkillMappingVerifier {
  /**
   * Verify skill key consistency throughout transformation pipeline
   */
  static verifySkillKeyConsistency(
    originalSkills: SkillType[],
    dataPoints: DemandDataPoint[],
    transformedSkills: SkillType[]
  ): SkillMappingReport {
    const report: SkillMappingReport = {
      consistencyIssues: [],
      mappingCorrections: [],
      recommendations: [],
      summary: {
        totalOriginalSkills: originalSkills.length,
        totalTransformedSkills: transformedSkills.length,
        skillsWithIssues: 0,
        mappingCorrectionsApplied: 0
      }
    };
    
    // Create skill usage tracking from data points
    const skillUsageMap = this.createSkillUsageMap(dataPoints);
    
    // Verify each original skill
    originalSkills.forEach(skill => {
      const skillStr = String(skill);
      const trimmedSkill = skillStr.trim();
      
      // Check for whitespace issues
      if (skillStr !== trimmedSkill) {
        report.consistencyIssues.push({
          skillName: skillStr,
          issueType: 'whitespace',
          description: `Skill '${skillStr}' contains leading/trailing whitespace`,
          originalValue: skillStr,
          correctedValue: trimmedSkill
        });
        
        report.mappingCorrections.push({
          from: skillStr,
          to: trimmedSkill,
          reason: 'whitespace normalization'
        });
        
        report.summary.skillsWithIssues++;
        report.summary.mappingCorrectionsApplied++;
      }
      
      // Check if skill exists in data points
      const isUsedInData = skillUsageMap.has(trimmedSkill);
      if (!isUsedInData) {
        report.consistencyIssues.push({
          skillName: skillStr,
          issueType: 'unused',
          description: `Skill '${skillStr}' defined but not used in data points`,
          originalValue: skillStr,
          correctedValue: null
        });
      }
      
      // Check if skill exists in transformed skills
      const existsInTransformed = transformedSkills.some(ts => String(ts).trim() === trimmedSkill);
      if (!existsInTransformed) {
        report.consistencyIssues.push({
          skillName: skillStr,
          issueType: 'missing_in_transform',
          description: `Skill '${skillStr}' missing from transformed skill set`,
          originalValue: skillStr,
          correctedValue: null
        });
        
        report.summary.skillsWithIssues++;
      }
    });
    
    // Check for orphaned skills in data points
    skillUsageMap.forEach((usage, skillKey) => {
      const existsInOriginal = originalSkills.some(os => String(os).trim() === skillKey);
      if (!existsInOriginal) {
        report.consistencyIssues.push({
          skillName: skillKey,
          issueType: 'orphaned_data',
          description: `Skill '${skillKey}' used in data points but not in original skill list`,
          originalValue: skillKey,
          correctedValue: null
        });
      }
    });
    
    // Generate recommendations
    this.generateRecommendations(report);
    
    return report;
  }
  
  /**
   * Create skill usage map from data points
   */
  private static createSkillUsageMap(dataPoints: DemandDataPoint[]): Map<string, SkillUsage> {
    const usageMap = new Map<string, SkillUsage>();
    
    dataPoints.forEach(dp => {
      const skillKey = String(dp.skillType).trim();
      const existing = usageMap.get(skillKey) || {
        occurrences: 0,
        totalDemand: 0,
        months: new Set<string>()
      };
      
      existing.occurrences++;
      existing.totalDemand += dp.demandHours;
      existing.months.add(dp.month);
      
      usageMap.set(skillKey, existing);
    });
    
    return usageMap;
  }
  
  /**
   * Generate recommendations based on consistency issues
   */
  private static generateRecommendations(report: SkillMappingReport): void {
    const whitespaceIssues = report.consistencyIssues.filter(issue => issue.issueType === 'whitespace');
    const orphanedIssues = report.consistencyIssues.filter(issue => issue.issueType === 'orphaned_data');
    const missingIssues = report.consistencyIssues.filter(issue => issue.issueType === 'missing_in_transform');
    
    if (whitespaceIssues.length > 0) {
      report.recommendations.push({
        priority: 'high',
        category: 'data_cleaning',
        description: `Apply consistent skill key trimming to resolve ${whitespaceIssues.length} whitespace issues`,
        action: 'Implement skill key normalization in transformation pipeline'
      });
    }
    
    if (orphanedIssues.length > 0) {
      report.recommendations.push({
        priority: 'medium',
        category: 'data_integrity',
        description: `Investigate ${orphanedIssues.length} orphaned skills in data points`,
        action: 'Review data source and skill assignment logic'
      });
    }
    
    if (missingIssues.length > 0) {
      report.recommendations.push({
        priority: 'high',
        category: 'transformation_logic',
        description: `Fix transformation logic to preserve ${missingIssues.length} missing skills`,
        action: 'Review skill set union logic in transformation method'
      });
    }
  }
  
  /**
   * Create skill mapping verification for debugging
   */
  static createSkillMappingTrace(
    originalSkills: SkillType[],
    transformedSkills: SkillType[]
  ): SkillMappingTrace {
    const trace: SkillMappingTrace = {
      mappings: [],
      unmappedOriginal: [],
      unmappedTransformed: []
    };
    
    // Create normalized mapping
    const transformedNormalized = new Map<string, SkillType>();
    transformedSkills.forEach(skill => {
      transformedNormalized.set(String(skill).trim(), skill);
    });
    
    // Trace each original skill
    originalSkills.forEach(originalSkill => {
      const normalizedKey = String(originalSkill).trim();
      const transformedSkill = transformedNormalized.get(normalizedKey);
      
      if (transformedSkill) {
        trace.mappings.push({
          original: originalSkill,
          transformed: transformedSkill,
          keyMatches: String(originalSkill) === String(transformedSkill),
          normalizedKey: normalizedKey
        });
        transformedNormalized.delete(normalizedKey);
      } else {
        trace.unmappedOriginal.push(originalSkill);
      }
    });
    
    // Remaining transformed skills are unmapped
    trace.unmappedTransformed = Array.from(transformedNormalized.values());
    
    return trace;
  }
}

/**
 * Skill mapping report interface
 */
export interface SkillMappingReport {
  consistencyIssues: SkillConsistencyIssue[];
  mappingCorrections: SkillMappingCorrection[];
  recommendations: SkillMappingRecommendation[];
  summary: {
    totalOriginalSkills: number;
    totalTransformedSkills: number;
    skillsWithIssues: number;
    mappingCorrectionsApplied: number;
  };
}

/**
 * Skill consistency issue interface
 */
export interface SkillConsistencyIssue {
  skillName: string;
  issueType: 'whitespace' | 'unused' | 'orphaned_data' | 'missing_in_transform';
  description: string;
  originalValue: string;
  correctedValue: string | null;
}

/**
 * Skill mapping correction interface
 */
export interface SkillMappingCorrection {
  from: string;
  to: string;
  reason: string;
}

/**
 * Skill mapping recommendation interface
 */
export interface SkillMappingRecommendation {
  priority: 'low' | 'medium' | 'high';
  category: 'data_cleaning' | 'data_integrity' | 'transformation_logic';
  description: string;
  action: string;
}

/**
 * Skill usage tracking interface
 */
interface SkillUsage {
  occurrences: number;
  totalDemand: number;
  months: Set<string>;
}

/**
 * Skill mapping trace interface
 */
export interface SkillMappingTrace {
  mappings: SkillMapping[];
  unmappedOriginal: SkillType[];
  unmappedTransformed: SkillType[];
}

/**
 * Individual skill mapping interface
 */
export interface SkillMapping {
  original: SkillType;
  transformed: SkillType;
  keyMatches: boolean;
  normalizedKey: string;
}
