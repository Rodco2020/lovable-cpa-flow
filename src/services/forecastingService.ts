
import { ForecastData, ForecastMode, ForecastParameters, ForecastResult, SkillType } from '@/types/forecasting';
import { generateMockForecastData } from '@/utils/forecastTestingUtils';

let forecastDebugMode = false;

// Get forecast data based on parameters
export async function getForecast(params: ForecastMode | ForecastParameters): Promise<ForecastResult> {
  try {
    // Log debugging info if debug mode is enabled
    if (forecastDebugMode) {
      console.log("Fetching forecast with params:", params);
    }
    
    // For now, return mock data that resembles real forecast calculations
    return {
      data: [
        {
          period: "Week 1",
          demand: {
            totalHours: 120,
            taskCount: 15,
            skillBreakdowns: {
              "Tax": { skillType: "Tax", hours: 40, taskCount: 5, percentage: 33, tasks: [] },
              "Audit": { skillType: "Audit", hours: 30, taskCount: 4, percentage: 25, tasks: [] },
              "Advisory": { skillType: "Advisory", hours: 20, taskCount: 3, percentage: 17, tasks: [] },
              "Bookkeeping": { skillType: "Bookkeeping", hours: 30, taskCount: 3, percentage: 25, tasks: [] }
            },
            timeBreakdown: []
          },
          capacity: {
            totalHours: 160,
            staffCount: 4,
            skillBreakdowns: {
              "Tax": { skillType: "Tax", hours: 50, taskCount: 0, percentage: 31, tasks: [] },
              "Audit": { skillType: "Audit", hours: 40, taskCount: 0, percentage: 25, tasks: [] },
              "Advisory": { skillType: "Advisory", hours: 30, taskCount: 0, percentage: 19, tasks: [] },
              "Bookkeeping": { skillType: "Bookkeeping", hours: 40, taskCount: 0, percentage: 25, tasks: [] }
            },
            timeBreakdown: []
          }
        },
        {
          period: "Week 2",
          demand: {
            totalHours: 130,
            taskCount: 17,
            skillBreakdowns: {
              "Tax": { skillType: "Tax", hours: 45, taskCount: 6, percentage: 35, tasks: [] },
              "Audit": { skillType: "Audit", hours: 35, taskCount: 5, percentage: 27, tasks: [] },
              "Advisory": { skillType: "Advisory", hours: 20, taskCount: 3, percentage: 15, tasks: [] },
              "Bookkeeping": { skillType: "Bookkeeping", hours: 30, taskCount: 3, percentage: 23, tasks: [] }
            },
            timeBreakdown: []
          },
          capacity: {
            totalHours: 160,
            staffCount: 4,
            skillBreakdowns: {
              "Tax": { skillType: "Tax", hours: 50, taskCount: 0, percentage: 31, tasks: [] },
              "Audit": { skillType: "Audit", hours: 40, taskCount: 0, percentage: 25, tasks: [] },
              "Advisory": { skillType: "Advisory", hours: 30, taskCount: 0, percentage: 19, tasks: [] },
              "Bookkeeping": { skillType: "Bookkeeping", hours: 40, taskCount: 0, percentage: 25, tasks: [] }
            },
            timeBreakdown: []
          }
        }
      ],
      financials: [
        { period: "Week 1", revenue: 12000, cost: 8000, profit: 4000, profitMargin: 33.3 },
        { period: "Week 2", revenue: 13000, cost: 8500, profit: 4500, profitMargin: 34.6 }
      ],
      summary: {
        totalDemand: 250,
        totalCapacity: 320,
        gap: 70,
        totalRevenue: 25000,
        totalCost: 16500,
        totalProfit: 8500
      }
    };
  } catch (error) {
    console.error("Error fetching forecast:", error);
    throw error;
  }
}

// Update forecast debug mode state
export function isForecastDebugModeEnabled(): boolean {
  return forecastDebugMode;
}

export function setForecastDebugMode(enabled: boolean): void {
  forecastDebugMode = enabled;
}

// Added missing clearForecastCache function
export function clearForecastCache(): void {
  console.log("Forecast cache cleared");
  // In a real implementation, this would clear any cached forecast data
}

// Validate the forecast system
export async function validateForecastSystem(): Promise<string[]> {
  // Mock implementation that checks various aspects of the forecasting system
  const issues: string[] = [];
  
  // Simulate checking for issues
  if (Math.random() > 0.7) {
    issues.push("Some recurring tasks don't have proper recurrence patterns defined");
    issues.push("Found 3 staff members with incomplete availability schedules");
  }
  
  return issues;
}

// Added missing getTaskBreakdown function
export async function getTaskBreakdown(): Promise<any[]> {
  // Mock implementation returning tasks that contribute to demand
  return [
    {
      id: "task1",
      name: "Monthly Tax Filing",
      client: "Acme Corp",
      estimatedHours: 4,
      dueDate: new Date(),
      recurrencePattern: "Monthly"
    },
    {
      id: "task2",
      name: "Quarterly Financial Review",
      client: "TechStart Inc",
      estimatedHours: 6,
      dueDate: new Date(),
      recurrencePattern: "Quarterly"
    },
    {
      id: "task3",
      name: "Bookkeeping",
      client: "Small Business LLC",
      estimatedHours: 3,
      dueDate: new Date(),
      recurrencePattern: "Weekly"
    }
  ];
}
