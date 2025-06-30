
import { DemandMatrixData } from '@/types/demand';
import { ForecastData } from '@/types/forecasting';
import { RecurringTaskDB } from '@/types/task';
import { MatrixTransformerCore } from './matrixTransformer/matrixTransformerCore';

/**
 * Matrix Transformer - Enhanced with Skill Name Resolution
 * 
 * This class maintains the existing public API while delegating to the
 * enhanced modular implementation that includes skill UUID resolution.
 * 
 * The enhancement:
 * ✅ Maintains exact same functionality
 * ✅ Preserves all existing behavior
 * ✅ Keeps the same public interface
 * ✅ Adds skill name resolution for UUIDs
 * ✅ Improves display quality with proper skill names
 * ✅ Maintains backward compatibility
 * 
 * @deprecated Consider using MatrixTransformerCore directly for new code
 */
export class MatrixTransformer {
  /**
   * Transform forecast data to matrix format with skill name resolution
   * 
   * @param forecastData - Array of forecast periods
   * @param tasks - Array of recurring tasks
   * @returns Promise<DemandMatrixData> - Transformed matrix data with resolved skill names
   */
  static async transformToMatrixData(
    forecastData: ForecastData[],
    tasks: RecurringTaskDB[]
  ): Promise<DemandMatrixData> {
    console.log('🔄 [MATRIX TRANSFORMER] Starting transformation with skill resolution...');
    
    // Delegate to the enhanced core implementation with skill resolution
    const result = await MatrixTransformerCore.transformToMatrixData(forecastData, tasks);
    
    console.log('✅ [MATRIX TRANSFORMER] Transformation complete with skill resolution:', {
      totalSkills: result.skills.length,
      skillsPreview: result.skills.slice(0, 3),
      dataPointsCount: result.dataPoints.length,
      aggregationStrategy: result.aggregationStrategy
    });
    
    return result;
  }
}
