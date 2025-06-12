
// Re-export types from the new matrix types module for backward compatibility
export type { 
  MatrixData,
  MatrixDataPoint,
  MonthInfo,
  ForecastDataItem
} from './matrix/types';

// Re-export the data transformation function
export { MatrixDataProcessor } from './matrix/MatrixDataProcessor';

// Provide backward compatible function
export function transformForecastDataToMatrix(forecastData: any[]): any {
  return MatrixDataProcessor.transformForecastDataToMatrix(forecastData);
}

// Add the missing getMatrixDataPoint function
export function getMatrixDataPoint(matrixData: any, skillType: string, month: string) {
  return matrixData.dataPoints.find((point: any) => 
    point.skillType === skillType && point.month === month
  );
}
