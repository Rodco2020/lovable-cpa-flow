export const getDebugMode = (): boolean => {
  return localStorage.getItem('forecast_debug_mode') === 'true';
};

export const debugLog = (message: string, data?: any): void => {
  if (getDebugMode()) {
    if (data !== undefined) {
      console.log(`[Forecast Debug] ${message}`, data);
    } else {
      console.log(`[Forecast Debug] ${message}`);
    }
  }
};
