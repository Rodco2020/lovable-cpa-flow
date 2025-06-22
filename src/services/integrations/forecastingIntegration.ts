
/**
 * Forecasting Integration Service
 * Handles integration between forecasting and other system components
 */

import { ForecastingService } from '../forecastingService';

/**
 * Initialize forecasting integrations
 */
export const initializeForecastingIntegrations = () => {
  console.log('Initializing forecasting integrations...');
  // Mock implementation for integration initialization
};

/**
 * Legacy getForecast function for backward compatibility
 */
export const getForecast = async (params: any) => {
  // Mock implementation for backward compatibility
  return {
    data: [],
    financials: [],
    summary: {
      totalDemand: 0,
      totalCapacity: 0,
      gap: 0,
      totalRevenue: 0,
      totalCost: 0,
      totalProfit: 0
    }
  };
};

/**
 * Integration service for forecasting functionality
 */
export class ForecastingIntegrationService {
  /**
   * Get forecast data with integration
   */
  static async getForecast(params: any) {
    return getForecast(params);
  }

  /**
   * Clear cache across all forecasting services
   */
  static clearCache() {
    ForecastingService.clearCache();
  }
}

export default ForecastingIntegrationService;
