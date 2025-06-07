
import { ForecastResult, ForecastData } from '@/types/forecasting';
import { SkillType } from '@/types/task';

/**
 * Matrix Forecast Generator Types
 * Defines interfaces and types used throughout the matrix forecasting system
 */

export interface MatrixGenerationOptions {
  clientIds?: string[];
  includeInactive?: boolean;
}

export interface MatrixForecastResult {
  forecastResult: ForecastResult;
  availableSkills: SkillType[];
}

export interface ForecastGenerationContext {
  startDate: Date;
  endDate: Date;
  forecastType: 'virtual' | 'actual';
  options?: MatrixGenerationOptions;
}
