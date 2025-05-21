export const getDebugMode = (): boolean => {
  return localStorage.getItem('forecast_debug_mode') === 'true';
};

export const debugLog = (message: string, data?: unknown): void => {
  if (getDebugMode()) {
    if (data !== undefined) {
      console.log(`[Forecast Debug] ${message}`, data);
    } else {
      console.log(`[Forecast Debug] ${message}`);
    }
  }
};

export const setForecastDebugMode = (enabled: boolean): void => {
  localStorage.setItem('forecast_debug_mode', enabled ? 'true' : 'false');
  debugLog(`Debug mode ${enabled ? 'enabled' : 'disabled'}`);
};

export const isForecastDebugModeEnabled = (): boolean => {
  return localStorage.getItem('forecast_debug_mode') === 'true';
};
