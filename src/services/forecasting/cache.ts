
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
  
  // Add detailed debugging for capacity values
  if (result && result.summary) {
    debugLog(`Cached forecast summary - Total Capacity: ${result.summary.totalCapacity} hours`);
    
    // Log capacity breakdown by skill
    const skillCapacity: Record<string, number> = {};
    result.data.forEach(period => {
      period.capacity.forEach(item => {
        if (!skillCapacity[item.skill]) {
          skillCapacity[item.skill] = 0;
        }
        skillCapacity[item.skill] += item.hours;
      });
    });
    
    debugLog(`Skill capacity breakdown: ${JSON.stringify(skillCapacity)}`);
  }
};
