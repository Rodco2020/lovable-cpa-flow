
// Re-export types from the new matrix types module for backward compatibility
export { 
  MatrixData,
  MatrixDataPoint,
  MonthInfo,
  ForecastDataItem as F
} from './matrix/types';

// Re-export the data transformation function
export { MatrixDataProcessor } from './matrix/MatrixDataProcessor';

// Provide backward compatible function
export function transformForecastDataToMatrix(forecastData: any[]): any {
  return MatrixDataProcessor.transformForecastDataToMatrix(forecastData);
}
