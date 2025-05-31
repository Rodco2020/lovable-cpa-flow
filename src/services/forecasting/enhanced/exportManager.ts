
import { MatrixData } from '../matrixUtils';
import { MatrixExportUtils } from '../export/matrixExportUtils';
import { ExportOptions } from './types';
import { SkillType } from '@/types/task';

/**
 * Export Manager
 * Handles all export functionality for enhanced matrix data
 */
export class ExportManager {
  /**
   * Generate CSV export
   */
  static generateCSVExport(
    matrixData: MatrixData,
    options: ExportOptions
  ): string {
    return MatrixExportUtils.generateCSVExport(
      matrixData,
      options.selectedSkills as SkillType[],
      options.monthRange,
      options.includeAnalytics,
      options.trends,
      options.alerts
    );
  }

  /**
   * Generate JSON export
   */
  static generateJSONExport(
    matrixData: MatrixData,
    options: ExportOptions
  ): string {
    return MatrixExportUtils.generateJSONExport(
      matrixData,
      options.selectedSkills as SkillType[],
      options.monthRange,
      options.includeAnalytics,
      options.trends,
      options.alerts
    );
  }
}
