
import { ForecastResult } from '@/types/forecasting';
import { SkillType } from '@/types/task';
import { MatrixData, transformForecastDataToMatrix, generate12MonthPeriods, fillMissingMatrixData } from '../matrixUtils';
import { debugLog } from '../logger';
import { startOfMonth } from 'date-fns';

/**
 * Matrix Data Transformer
 * Handles transformation of forecast data into matrix format
 */
export class MatrixDataTransformer {
  /**
   * Transform forecast result into complete matrix data
   */
  static transformToMatrixData(
    forecastResult: ForecastResult,
    availableSkills: SkillType[],
    startDate: Date
  ): MatrixData {
    debugLog('Step 5: Transforming to matrix format');
    
    // Transform forecast data to matrix format
    let matrixData = transformForecastDataToMatrix(forecastResult.data);

    debugLog('Initial matrix transformation:', {
      skillsCount: matrixData.skills.length,
      monthsCount: matrixData.months.length,
      dataPointsCount: matrixData.dataPoints.length,
      skills: matrixData.skills,
      months: matrixData.months.map(m => m.key)
    });

    debugLog('Step 6: Enforcing database-only skills for matrix display');
    
    // Filter matrix skills to only include database skills
    const validMatrixSkills = matrixData.skills.filter(skill => 
      availableSkills.includes(skill)
    );
    
    debugLog('Matrix skills filtered to database skills only:', {
      originalSkills: matrixData.skills,
      databaseSkills: availableSkills,
      validMatrixSkills: validMatrixSkills
    });

    // Update matrix data with database-only skills
    matrixData = {
      ...matrixData,
      skills: validMatrixSkills,
      dataPoints: matrixData.dataPoints.filter(point => 
        validMatrixSkills.includes(point.skillType)
      )
    };

    debugLog('Step 7: Ensuring complete matrix data with database skills only');
    
    // Generate expected months for validation
    const expectedMonths = generate12MonthPeriods(startOfMonth(startDate));
    
    // Fill any missing data to ensure complete matrix - DATABASE SKILLS ONLY
    const completeMatrixData = fillMissingMatrixData(matrixData, availableSkills, expectedMonths);

    debugLog('Final matrix data with database skills only:', {
      periodsCount: forecastResult.data.length,
      matrixMonths: completeMatrixData.months.length,
      matrixSkills: completeMatrixData.skills.length,
      databaseSkills: availableSkills.length,
      dataPoints: completeMatrixData.dataPoints.length,
      totalDemand: completeMatrixData.totalDemand,
      totalCapacity: completeMatrixData.totalCapacity,
      totalGap: completeMatrixData.totalGap,
      skillBreakdown: completeMatrixData.skills.reduce((acc, skill) => {
        acc[skill] = completeMatrixData.dataPoints.filter(p => p.skillType === skill).length;
        return acc;
      }, {} as Record<string, number>)
    });

    return completeMatrixData;
  }

  /**
   * Create empty matrix data when no skills are available
   */
  static createEmptyMatrixData(startDate: Date): MatrixData {
    debugLog('Creating empty matrix data - no database skills available');
    
    // Generate 12 months
    const months = generate12MonthPeriods(startOfMonth(startDate));
    
    // Empty matrix with no skills
    const matrixData: MatrixData = {
      skills: [], // Empty because no database skills exist
      months,
      dataPoints: [], // Empty because no skills
      totalDemand: 0,
      totalCapacity: 0,
      totalGap: 0
    };
    
    debugLog('Empty matrix data created - user needs to add skills to database');
    
    return matrixData;
  }
}
