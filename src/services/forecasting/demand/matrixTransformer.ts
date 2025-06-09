
import { DemandMatrixData } from '@/types/demand';
import { ForecastData } from '@/types/forecasting';
import { RecurringTaskDB } from '@/types/task';
import { MatrixTransformerCore } from './matrixTransformer';

/**
 * Matrix Transformer - Backward Compatible API
 * 
 * This class maintains the existing public API while delegating to the
 * refactored modular implementation. This ensures zero breaking changes
 * while providing improved maintainability.
 * 
 * The refactoring:
 * ✅ Maintains exact same functionality
 * ✅ Preserves all existing behavior
 * ✅ Keeps the same public interface
 * ✅ Improves code organization
 * ✅ Enhances maintainability
 * ✅ Enables better testing
 * 
 * @deprecated Consider using MatrixTransformerCore directly for new code
 */
export class MatrixTransformer {
  /**
   * Transform forecast data to matrix format with fixed skill resolution
   * 
   * @param forecastData - Array of forecast periods
   * @param tasks - Array of recurring tasks
   * @returns Promise<DemandMatrixData> - Transformed matrix data
   */
  static async transformToMatrixData(
    forecastData: ForecastData[],
    tasks: RecurringTaskDB[]
  ): Promise<DemandMatrixData> {
    // Delegate to the refactored core implementation
    return MatrixTransformerCore.transformToMatrixData(forecastData, tasks);
  }
}
