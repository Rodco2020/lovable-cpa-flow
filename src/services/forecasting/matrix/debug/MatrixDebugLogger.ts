
import { debugLog } from '../../logger';
import { DemandMatrixData, DemandDataPoint } from '@/types/demand';
import { MatrixData, MatrixDataPoint } from '../types';
import { SkillType } from '@/types/task';

/**
 * Enhanced Debug Logger for Matrix Data Transformations
 * Provides detailed logging and tracking for skill key transformations
 */
export class MatrixDebugLogger {
  private static logPrefix = '[MATRIX-DEBUG]';

  /**
   * Log the start of transformation process
   */
  static logTransformationStart(demandMatrix: DemandMatrixData, capacityForecast: any[]): void {
    debugLog(`${this.logPrefix} Starting preservingTransformDemandToMatrix transformation`);
    
    console.group('🔍 Matrix Transformation Debug - START');
    console.log('📊 Source Data Overview:', {
      demandMonths: demandMatrix.months.length,
      demandSkills: demandMatrix.skills.length,
      demandDataPoints: demandMatrix.dataPoints.length,
      capacityPeriods: capacityForecast.length,
      totalDemand: demandMatrix.totalDemand
    });
    
    // Log detailed skill information
    console.log('🎯 Demand Skills (source):', demandMatrix.skills.map(skill => ({
      skill: skill,
      type: typeof skill,
      trimmed: String(skill).trim(),
      length: String(skill).length
    })));
    
    // Log sample demand data points
    const sampleDemandPoints = demandMatrix.dataPoints.slice(0, 3);
    console.log('📈 Sample Demand Data Points:', sampleDemandPoints.map(dp => ({
      skillType: dp.skillType,
      skillTypeTrimmed: String(dp.skillType).trim(),
      month: dp.month,
      demandHours: dp.demandHours
    })));
    
    console.groupEnd();
  }

  /**
   * Log skill set creation and union process
   */
  static logSkillSetCreation(
    demandSkills: SkillType[], 
    capacitySkills: string[], 
    finalSkillSet: SkillType[]
  ): void {
    console.group('🎯 Skill Set Creation Debug');
    
    console.log('📋 Demand Skills Analysis:', {
      count: demandSkills.length,
      skills: demandSkills.map(skill => ({
        original: skill,
        trimmed: String(skill).trim(),
        type: typeof skill
      }))
    });
    
    console.log('⚙️ Capacity Skills Analysis:', {
      count: capacitySkills.length,
      skills: capacitySkills.map(skill => ({
        original: skill,
        trimmed: String(skill).trim(),
        type: typeof skill
      }))
    });
    
    console.log('🎯 Final Skill Set:', {
      count: finalSkillSet.length,
      skills: finalSkillSet.map(skill => ({
        skill: skill,
        trimmed: String(skill).trim()
      }))
    });
    
    // Check for potential duplicates or whitespace issues
    const trimmedSkills = finalSkillSet.map(s => String(s).trim());
    const uniqueTrimmed = [...new Set(trimmedSkills)];
    if (trimmedSkills.length !== uniqueTrimmed.length) {
      console.warn('⚠️ Potential duplicate skills detected after trimming!');
    }
    
    console.groupEnd();
  }

  /**
   * Log demand map creation process
   */
  static logDemandMapCreation(
    demandDataPoints: DemandDataPoint[], 
    demandMap: Map<string, Map<string, DemandDataPoint>>
  ): void {
    console.group('📊 Demand Map Creation Debug');
    
    console.log('📈 Processing Demand Data Points:', demandDataPoints.length);
    
    // Log skill key transformations
    const skillKeyMappings = new Map<string, string>();
    demandDataPoints.forEach(dp => {
      const original = dp.skillType;
      const trimmed = String(dp.skillType).trim();
      if (original !== trimmed) {
        skillKeyMappings.set(String(original), trimmed);
      }
    });
    
    if (skillKeyMappings.size > 0) {
      console.log('🔧 Skill Key Transformations Applied:', Object.fromEntries(skillKeyMappings));
    }
    
    // Log demand map structure
    const mapStructure: any = {};
    demandMap.forEach((monthMap, monthKey) => {
      mapStructure[monthKey] = {};
      monthMap.forEach((demandPoint, skillKey) => {
        mapStructure[monthKey][skillKey] = {
          demandHours: demandPoint.demandHours,
          originalSkillType: demandPoint.skillType
        };
      });
    });
    
    console.log('🗺️ Demand Map Structure (sample):', {
      totalMonths: demandMap.size,
      sampleMonth: Object.keys(mapStructure)[0],
      sampleData: mapStructure[Object.keys(mapStructure)[0]]
    });
    
    console.groupEnd();
  }

  /**
   * Log capacity map creation process
   */
  static logCapacityMapCreation(
    capacityForecast: any[], 
    capacityMap: Map<string, Map<string, number>>
  ): void {
    console.group('⚙️ Capacity Map Creation Debug');
    
    console.log('📊 Processing Capacity Forecast:', capacityForecast.length);
    
    // Log capacity data structure
    const sampleCapacity = capacityForecast.slice(0, 2);
    console.log('📈 Sample Capacity Data:', sampleCapacity.map(period => ({
      period: period.period,
      capacityCount: period.capacity?.length || 0,
      capacitySkills: period.capacity?.map((c: any) => ({
        skill: c.skill,
        skillTrimmed: String(c.skill).trim(),
        hours: c.hours
      }))
    })));
    
    // Log capacity map structure
    const mapStructure: any = {};
    capacityMap.forEach((monthMap, monthKey) => {
      mapStructure[monthKey] = Object.fromEntries(monthMap);
    });
    
    console.log('🗺️ Capacity Map Structure (sample):', {
      totalMonths: capacityMap.size,
      sampleMonth: Object.keys(mapStructure)[0],
      sampleData: mapStructure[Object.keys(mapStructure)[0]]
    });
    
    console.groupEnd();
  }

  /**
   * Log data point generation process
   */
  static logDataPointGeneration(
    skills: SkillType[], 
    months: any[], 
    demandMap: Map<string, Map<string, DemandDataPoint>>,
    capacityMap: Map<string, Map<string, number>>,
    generatedDataPoints: MatrixDataPoint[]
  ): void {
    console.group('🏗️ Data Point Generation Debug');
    
    console.log('🎯 Generation Parameters:', {
      skillsCount: skills.length,
      monthsCount: months.length,
      expectedDataPoints: skills.length * months.length
    });
    
    // Track data point generation for each skill
    const skillDataTracking: any = {};
    skills.forEach(skill => {
      const skillKey = String(skill).trim();
      skillDataTracking[String(skill)] = {
        originalSkill: skill,
        trimmedKey: skillKey,
        monthsWithDemand: 0,
        monthsWithCapacity: 0,
        totalDemand: 0,
        totalCapacity: 0
      };
      
      months.forEach(month => {
        const demandPoint = demandMap.get(month.key)?.get(skillKey);
        const capacityHours = capacityMap.get(month.key)?.get(skillKey) || 0;
        
        if (demandPoint && demandPoint.demandHours > 0) {
          skillDataTracking[String(skill)].monthsWithDemand++;
          skillDataTracking[String(skill)].totalDemand += demandPoint.demandHours;
        }
        
        if (capacityHours > 0) {
          skillDataTracking[String(skill)].monthsWithCapacity++;
          skillDataTracking[String(skill)].totalCapacity += capacityHours;
        }
      });
    });
    
    console.log('📊 Skill Data Tracking:', skillDataTracking);
    
    // Log generated data points summary
    const dataPointSummary = generatedDataPoints.reduce((acc, dp) => {
      const skill = String(dp.skillType);
      if (!acc[skill]) {
        acc[skill] = { totalDemand: 0, totalCapacity: 0, dataPoints: 0 };
      }
      acc[skill].totalDemand += dp.demandHours;
      acc[skill].totalCapacity += dp.capacityHours;
      acc[skill].dataPoints++;
      return acc;
    }, {} as any);
    
    console.log('📈 Generated Data Points Summary:', dataPointSummary);
    
    console.groupEnd();
  }

  /**
   * Log transformation completion and final validation
   */
  static logTransformationComplete(
    originalDemand: DemandMatrixData, 
    transformedMatrix: MatrixData
  ): void {
    console.group('🏁 Matrix Transformation Debug - COMPLETE');
    
    console.log('📊 Transformation Results:', {
      originalTotalDemand: originalDemand.totalDemand,
      transformedTotalDemand: transformedMatrix.totalDemand,
      demandPreserved: originalDemand.totalDemand === transformedMatrix.totalDemand,
      originalSkills: originalDemand.skills.length,
      transformedSkills: transformedMatrix.skills.length,
      skillsPreserved: originalDemand.skills.length === transformedMatrix.skills.length
    });
    
    // Detailed skill-by-skill comparison
    const skillComparison: any = {};
    originalDemand.skills.forEach(skill => {
      const originalSkillDemand = originalDemand.dataPoints
        .filter(dp => dp.skillType === skill)
        .reduce((sum, dp) => sum + dp.demandHours, 0);
      
      const transformedSkillDemand = transformedMatrix.dataPoints
        .filter(dp => dp.skillType === skill)
        .reduce((sum, dp) => sum + dp.demandHours, 0);
      
      skillComparison[String(skill)] = {
        original: originalSkillDemand,
        transformed: transformedSkillDemand,
        preserved: originalSkillDemand === transformedSkillDemand,
        difference: transformedSkillDemand - originalSkillDemand
      };
    });
    
    console.log('🎯 Skill-by-Skill Demand Comparison:', skillComparison);
    
    // Identify any discrepancies
    const discrepancies = Object.entries(skillComparison)
      .filter(([_, data]: [string, any]) => !data.preserved);
    
    if (discrepancies.length > 0) {
      console.error('❌ DATA CORRUPTION DETECTED!');
      console.error('🚨 Skills with demand discrepancies:', discrepancies);
    } else {
      console.log('✅ All skill demands preserved correctly');
    }
    
    console.groupEnd();
    
    debugLog(`${this.logPrefix} Transformation complete. Corruption detected: ${discrepancies.length > 0}`);
  }

  /**
   * Log critical validation checkpoint
   */
  static logValidationCheckpoint(
    checkpointName: string, 
    data: any, 
    validationResult: boolean
  ): void {
    const status = validationResult ? '✅' : '❌';
    console.log(`${status} VALIDATION CHECKPOINT: ${checkpointName}`, data);
    
    if (!validationResult) {
      console.error(`🚨 Validation failed at checkpoint: ${checkpointName}`);
    }
  }
}
