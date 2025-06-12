
import { MatrixData, ForecastDataItem, MonthInfo } from './types';
import { SkillType } from '@/types/task';
import { debugLog } from '../logger';

/**
 * Matrix Data Processor
 * Core logic for transforming forecast data into matrix format
 */
export class MatrixDataProcessor {
  /**
   * Transform forecast data array into matrix data structure
   */
  static transformForecastDataToMatrix(forecastData: ForecastDataItem[]): MatrixData {
    debugLog('Transforming forecast data to matrix', { 
      forecastDataLength: forecastData.length 
    });
    
    // Extract months from forecast data
    const months = this.extractMonths(forecastData);
    
    // Extract all unique skills
    const skills = this.extractSkills(forecastData);
    
    // Generate data points for each skill-month combination
    const dataPoints = this.generateDataPoints(forecastData, months, skills);
    
    // Calculate totals
    const totals = this.calculateTotals(dataPoints);
    
    const matrixData: MatrixData = {
      months,
      skills,
      dataPoints,
      ...totals
    };
    
    debugLog('Matrix transformation completed', {
      months: months.length,
      skills: skills.length,
      dataPoints: dataPoints.length,
      totalDemand: totals.totalDemand,
      totalCapacity: totals.totalCapacity,
      totalGap: totals.totalGap
    });
    
    return matrixData;
  }
  
  /**
   * Extract month information from forecast data
   */
  private static extractMonths(forecastData: ForecastDataItem[]): MonthInfo[] {
    const months = forecastData.map((item, index) => ({
      key: item.period,
      label: this.formatMonthLabel(item.period),
      index
    }));
    
    return months;
  }
  
  /**
   * Extract all unique skills from forecast data
   */
  private static extractSkills(forecastData: ForecastDataItem[]): SkillType[] {
    const skillSet = new Set<SkillType>();
    
    forecastData.forEach(item => {
      item.demand.forEach(d => skillSet.add(d.skill));
      item.capacity.forEach(c => skillSet.add(c.skill));
    });
    
    return Array.from(skillSet).sort();
  }
  
  /**
   * Generate data points for all skill-month combinations
   */
  private static generateDataPoints(
    forecastData: ForecastDataItem[],
    months: MonthInfo[],
    skills: SkillType[]
  ) {
    const dataPoints = [];
    
    for (const skill of skills) {
      for (const month of months) {
        const forecastItem = forecastData.find(item => item.period === month.key);
        
        const demandHours = forecastItem?.demand
          .find(d => d.skill === skill)?.hours || 0;
        
        const capacityHours = forecastItem?.capacity
          .find(c => c.skill === skill)?.hours || 0;
        
        const gap = demandHours - capacityHours;
        const utilizationPercent = capacityHours > 0 
          ? Math.round((demandHours / capacityHours) * 100) 
          : 0;
        
        dataPoints.push({
          skillType: skill,
          month: month.key,
          monthLabel: month.label,
          demandHours,
          capacityHours,
          gap,
          utilizationPercent
        });
      }
    }
    
    return dataPoints;
  }
  
  /**
   * Calculate matrix totals
   */
  private static calculateTotals(dataPoints: any[]) {
    const totalDemand = dataPoints.reduce((sum, dp) => sum + dp.demandHours, 0);
    const totalCapacity = dataPoints.reduce((sum, dp) => sum + dp.capacityHours, 0);
    const totalGap = totalDemand - totalCapacity;
    
    return {
      totalDemand,
      totalCapacity,
      totalGap
    };
  }
  
  /**
   * Format month period key into readable label
   */
  private static formatMonthLabel(period: string): string {
    try {
      // Handle different period formats
      if (period.includes('-')) {
        const [year, month] = period.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        });
      }
      
      // Fallback for other formats
      return period;
    } catch {
      return period;
    }
  }
}
