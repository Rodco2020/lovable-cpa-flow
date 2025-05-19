import { ForecastResult } from '@/types/forecasting';
import { debugLog } from './debug';

let forecastCache: Record<string, ForecastResult> = {};

export const clearForecastCache = (): void => {
  debugLog('Clearing forecast cache');
  forecastCache = {};
};

export const getCachedForecast = (key: string): ForecastResult | undefined => {
  return forecastCache[key];
};

export const setCachedForecast = (key: string, result: ForecastResult): void => {
  forecastCache[key] = result;
  debugLog(`Forecast result cached with key: ${key.substring(0, 30)}...`);
};
