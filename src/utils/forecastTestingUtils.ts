import { ForecastHorizon, ForecastMode } from '@/types/forecasting';

export function estimateRecurringTaskInstances(templateId: string, startDate: Date, endDate: Date) {
  // Mock implementation
  return [];
}

export function runSkillAllocationTests() {
  // Mock implementation
  console.log("Running skill allocation tests");
  return {
    passed: true,
    results: []
  };
}

// Other utility functions for forecast testing
export function generateMockForecastData(mode: ForecastMode = 'virtual', horizon: ForecastHorizon = 'month') {
  return {
    mode,
    horizon,
    timestamp: new Date(),
    demand: {
      totalHours: 240,
      taskCount: 35,
      skillBreakdowns: {},
      timeBreakdown: []
    },
    capacity: {
      totalHours: 320,
      staffCount: 4,
      skillBreakdowns: {},
      timeBreakdown: []
    }
  };
}
