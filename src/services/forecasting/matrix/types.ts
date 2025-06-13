
import { SkillType } from '@/types/task';

/**
 * Core Matrix Types
 * Centralized type definitions for matrix services
 */

export interface MatrixDataPoint {
  skillType: SkillType;
  month: string;
  monthLabel: string;
  demandHours: number;
  capacityHours: number;
  gap: number;
  utilizationPercent: number;
}

export interface MonthInfo {
  key: string;
  label: string;
  index: number;
}

export interface MatrixData {
  months: MonthInfo[];
  skills: SkillType[];
  dataPoints: MatrixDataPoint[];
  totalDemand: number;
  totalCapacity: number;
  totalGap: number;
}

export interface ForecastDataItem {
  period: string;
  demand: Array<{ skill: SkillType; hours: number }>;
  capacity: Array<{ skill: SkillType; hours: number }>;
}

export type ForecastType = 'virtual' | 'actual' | 'demand-only';

export interface MatrixValidationResult {
  isValid: boolean;
  issues: string[];
}

export interface MatrixCacheEntry {
  data: MatrixData;
  timestamp: number;
  cacheKey: string;
}

export interface MatrixErrorContext {
  operation: string;
  forecastType?: ForecastType;
  startDate?: Date;
  endDate?: Date;
  additionalInfo?: Record<string, any>;
}

// Add the missing MatrixErrorCode type
export type MatrixErrorCode = 
  | 'MATRIX_VALIDATION_FAILED'
  | 'MATRIX_DATA_FETCH_FAILED' 
  | 'MATRIX_CACHE_ERROR'
  | 'MATRIX_PROCESSING_TIMEOUT';
