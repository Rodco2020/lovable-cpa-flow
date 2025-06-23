
import { DemandMatrixData, DemandDataPoint } from '@/types/demand';
import { ForecastData } from '@/types/forecasting';
import { RecurringTaskDB } from '@/types/task';

/**
 * Core Types for Matrix Transformer
 */

export interface MatrixTransformerConfig {
  readonly DEFAULT_ESTIMATED_HOURS: number;
  readonly FALLBACK_FEE_RATE: number;
  readonly BATCH_SIZE: number;
  readonly CONCURRENCY_LIMIT: number;
}

export interface StaffInformation {
  id: string;
  name: string;
}

export interface MonthInfo {
  key: string;
  label: string;
}

export interface ValidationResult {
  isValid: boolean;
  issues: string[];
  warnings: string[];
}

export interface PerformanceMetrics {
  duration: number;
  memoryUsage: {
    peak: number;
    average: number;
  };
  checkpoints: Array<{
    name: string;
    timestamp: number;
    memoryUsage: number;
  }>;
}

export interface TransformationContext {
  forecastData: ForecastData[];
  tasks: RecurringTaskDB[];
  months: MonthInfo[];
  skills: string[];
  staffInformation: StaffInformation[];
}

export interface ClientMaps {
  clientTotals: Map<string, number>;
  clientRevenue: Map<string, number>;
  clientHourlyRates: Map<string, number>;
  clientSuggestedRevenue: Map<string, number>;
  clientExpectedLessSuggested: Map<string, number>;
}

export interface RevenueTotals {
  totalSuggestedRevenue: number;
  totalExpectedRevenue: number;
  totalExpectedLessSuggested: number;
}

export interface MatrixSummaries {
  skillSummary: { [key: string]: any };
  staffSummary: { [key: string]: any };
  clientMaps: ClientMaps;
  revenueTotals: RevenueTotals;
}
