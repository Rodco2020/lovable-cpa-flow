// Use the aggregated Task interface from Detail Matrix
interface Task {
  id: string;
  taskName: string;
  clientName: string;
  clientId: string;
  skillRequired: string;
  monthlyHours: number;
  month: string;
  monthLabel: string;
  recurrencePattern: string;
  priority: string;
  category: string;
  monthlyDistribution?: Record<string, number>; // New aggregated format (optional for compatibility)
  totalHours?: number; // Sum of all monthly hours (optional for compatibility)
  recurringTaskId?: string; // For unique identification (optional for compatibility)
  totalExpectedRevenue?: number;
  expectedHourlyRate?: number;
  totalSuggestedRevenue?: number;
  expectedLessSuggested?: number;
}

export class DetailMatrixTotalsCalculator {
  static calculateDetailMatrixTotals(
    tasks: Task[], 
    months: Array<{ key: string; label: string }>
  ) {
    const totals = {
      monthlyHours: {} as Record<string, number>,
      totalHours: 0,
      totalExpectedRevenue: 0,
      expectedHourlyRate: 0, // Will be calculated as weighted average
      totalSuggestedRevenue: 0,
      expectedLessSuggested: 0
    };

    // Initialize monthly hours
    months.forEach(month => {
      totals.monthlyHours[month.key] = 0;
    });

    // Sum all values from tasks
    tasks.forEach(task => {
      // Add monthly hours
      if (task.monthlyDistribution) {
        Object.entries(task.monthlyDistribution).forEach(([month, hours]) => {
          if (totals.monthlyHours[month] !== undefined) {
            totals.monthlyHours[month] += hours;
          }
        });
      }

      // Add to totals
      totals.totalHours += task.totalHours || 0;
      totals.totalExpectedRevenue += task.totalExpectedRevenue || 0;
      totals.totalSuggestedRevenue += task.totalSuggestedRevenue || 0;
    });

    // Calculate weighted average hourly rate
    totals.expectedHourlyRate = totals.totalHours > 0 
      ? totals.totalExpectedRevenue / totals.totalHours 
      : 0;

    // Calculate difference
    totals.expectedLessSuggested = totals.totalExpectedRevenue - totals.totalSuggestedRevenue;

    return totals;
  }
}