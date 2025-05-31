
import { MatrixData } from '../matrixUtils';
import { TrendAnalysis, ThresholdAlert } from '../analyticsService';
import { SkillType } from '@/types/task';
import { debugLog } from '../logger';

/**
 * Matrix Export Utilities
 * Handles CSV and other export formats for matrix data
 */
export class MatrixExportUtils {
  /**
   * Generate CSV export data
   */
  static generateCSVExport(
    matrixData: MatrixData,
    selectedSkills: SkillType[],
    monthRange: { start: number; end: number },
    includeAnalytics = false,
    trends?: TrendAnalysis[],
    alerts?: ThresholdAlert[]
  ): string {
    debugLog('Generating CSV export');
    
    const filteredMonths = matrixData.months.slice(monthRange.start, monthRange.end + 1);
    const filteredSkills = matrixData.skills.filter(skill => selectedSkills.includes(skill));
    
    // Headers
    const headers = [
      'Skill',
      'Month',
      'Demand (Hours)',
      'Capacity (Hours)',
      'Gap (Hours)',
      'Utilization (%)',
      ...(includeAnalytics ? ['Trend', 'Alert Level'] : [])
    ];
    
    let csvData = headers.join(',') + '\n';
    
    // Data rows
    filteredSkills.forEach(skill => {
      filteredMonths.forEach(month => {
        const dataPoint = matrixData.dataPoints.find(
          point => point.skillType === skill && point.month === month.key
        );
        
        if (dataPoint) {
          const row = [
            `"${skill}"`,
            `"${month.label}"`,
            dataPoint.demandHours.toFixed(1),
            dataPoint.capacityHours.toFixed(1),
            dataPoint.gap.toFixed(1),
            dataPoint.utilizationPercent.toFixed(1)
          ];
          
          if (includeAnalytics) {
            const trend = trends?.find(t => t.skill === skill);
            const alert = alerts?.find(a => a.skill === skill && a.month === month.label);
            
            row.push(
              `"${trend?.trend || 'stable'}"`,
              `"${alert?.severity || 'none'}"`
            );
          }
          
          csvData += row.join(',') + '\n';
        }
      });
    });
    
    return csvData;
  }

  /**
   * Generate JSON export data
   */
  static generateJSONExport(
    matrixData: MatrixData,
    selectedSkills: SkillType[],
    monthRange: { start: number; end: number },
    includeAnalytics = false,
    trends?: TrendAnalysis[],
    alerts?: ThresholdAlert[]
  ): string {
    debugLog('Generating JSON export');
    
    const filteredMonths = matrixData.months.slice(monthRange.start, monthRange.end + 1);
    const filteredSkills = matrixData.skills.filter(skill => selectedSkills.includes(skill));
    
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        skills: filteredSkills,
        months: filteredMonths.map(m => m.label),
        includeAnalytics
      },
      data: filteredSkills.map(skill => ({
        skill,
        months: filteredMonths.map(month => {
          const dataPoint = matrixData.dataPoints.find(
            point => point.skillType === skill && point.month === month.key
          );
          
          const result: any = {
            month: month.label,
            monthKey: month.key,
            demandHours: dataPoint?.demandHours || 0,
            capacityHours: dataPoint?.capacityHours || 0,
            gap: dataPoint?.gap || 0,
            utilizationPercent: dataPoint?.utilizationPercent || 0
          };
          
          if (includeAnalytics) {
            const trend = trends?.find(t => t.skill === skill);
            const alert = alerts?.find(a => a.skill === skill && a.month === month.label);
            
            result.trend = trend?.trend || 'stable';
            result.alertLevel = alert?.severity || 'none';
          }
          
          return result;
        })
      }))
    };
    
    return JSON.stringify(exportData, null, 2);
  }
}
