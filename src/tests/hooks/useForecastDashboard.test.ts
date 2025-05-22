
import { renderHook, act, waitFor } from '@testing-library/react';
import { useForecastDashboard } from '@/hooks/useForecastDashboard';
import { getForecast, clearForecastCache, validateForecastSystem, getTaskBreakdown } from '@/services/forecastingService';
import { setForecastDebugMode, isForecastDebugModeEnabled } from '@/services/forecasting/logger';
import { runRecurrenceTests } from '@/utils/forecastTestingUtils';

// Mock the imported services/hooks
jest.mock('@/services/forecastingService');
jest.mock('@/services/forecasting/logger');
jest.mock('@/utils/forecastTestingUtils');
jest.mock('@/hooks/useAppEvent', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation((event, callback) => {
    // Just store callback, don't execute
    return () => {};
  })
}));
jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}));

// Mocked service implementations
(getForecast as jest.Mock).mockResolvedValue({
  data: [],
  financials: [],
  summary: {
    totalDemand: 100,
    totalCapacity: 120,
    gap: 20,
    totalRevenue: 10000,
    totalCost: 5000,
    totalProfit: 5000
  }
});
(isForecastDebugModeEnabled as jest.Mock).mockReturnValue(false);

describe('useForecastDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('initializes with default values', () => {
    const { result } = renderHook(() => useForecastDashboard());
    
    expect(result.current.forecastWindow).toBe('next-30-days');
    expect(result.current.forecastType).toBe('virtual');
    expect(result.current.showCapacity).toBe(true);
    expect(result.current.showDemand).toBe(true);
    expect(result.current.isLoading).toBe(true); // Initially loading
  });
  
  test('loadForecast calls getForecast with correct parameters', async () => {
    const { result } = renderHook(() => useForecastDashboard());
    
    // Wait for the forecast to load using waitFor instead of waitForNextUpdate
    await waitFor(() => {
      expect(getForecast).toHaveBeenCalled();
    });
    
    expect(getForecast).toHaveBeenCalledWith(expect.objectContaining({
      mode: 'virtual',
      timeframe: 'custom',
      granularity: 'weekly'
    }));
  });
  
  test('handleToggleDebugMode toggles debug mode', async () => {
    const { result } = renderHook(() => useForecastDashboard());
    
    // Initial value should be false
    expect(result.current.debugMode).toBe(false);
    
    // Toggle debug mode
    act(() => {
      result.current.handleToggleDebugMode();
    });
    
    // Should be true after toggle
    expect(result.current.debugMode).toBe(true);
    expect(setForecastDebugMode).toHaveBeenCalledWith(true);
  });
  
  test('handleRecalculate clears cache and reloads data', async () => {
    const { result } = renderHook(() => useForecastDashboard());
    
    // Call recalculate within act
    await act(async () => {
      result.current.handleRecalculate();
    });
    
    expect(clearForecastCache).toHaveBeenCalled();
    expect(getForecast).toHaveBeenCalled();
  });
  
  test('handleRunTests calls runRecurrenceTests', () => {
    const { result } = renderHook(() => useForecastDashboard());
    
    act(() => {
      result.current.handleRunTests();
    });
    
    expect(runRecurrenceTests).toHaveBeenCalled();
  });
  
  test('handleValidateSystem calls validateForecastSystem', async () => {
    (validateForecastSystem as jest.Mock).mockResolvedValue(['Test issue']);
    
    const { result } = renderHook(() => useForecastDashboard());
    
    await act(async () => {
      await result.current.handleValidateSystem();
    });
    
    expect(validateForecastSystem).toHaveBeenCalled();
    expect(result.current.validationIssues).toEqual(['Test issue']);
  });
});
