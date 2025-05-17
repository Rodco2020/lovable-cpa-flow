
import { RecurringTask, RecurrenceType } from '@/types/task';
import { estimateRecurringTaskInstances } from '@/services/forecastingService';

// Helper function to create a test recurring task
const createTestRecurringTask = (
  recurrenceType: RecurrenceType,
  options: Partial<RecurringTask> = {}
): RecurringTask => {
  return {
    id: `test-${recurrenceType.toLowerCase()}`,
    clientId: 'test-client',
    name: `Test ${recurrenceType} Task`,
    description: `A test task with ${recurrenceType} recurrence`,
    templateId: 'test-template',
    isActive: true,
    requiredSkills: ['Test'],
    priority: 'Medium',
    estimatedHours: options.estimatedHours || 2,
    category: 'Tax',
    recurrencePattern: {
      type: recurrenceType,
      interval: options.recurrencePattern?.interval,
      weekdays: options.recurrencePattern?.weekdays,
      dayOfMonth: options.recurrencePattern?.dayOfMonth,
      monthOfYear: options.recurrencePattern?.monthOfYear,
      customOffsetDays: options.recurrencePattern?.customOffsetDays
    },
    dueDate: options.dueDate,
    endDate: options.endDate,
    lastGeneratedDate: options.lastGeneratedDate,
    notes: '',
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

export const runRecurrenceTests = (): void => {
  console.group('Recurrence Pattern Tests');
  
  // Test daily recurrence
  const testDailyTask = createTestRecurringTask('Daily');
  const dailyResult = estimateRecurringTaskInstances(
    testDailyTask, 
    new Date(2023, 0, 1), // Jan 1, 2023
    new Date(2023, 0, 31) // Jan 31, 2023
  );
  console.log('Daily (31 days):', dailyResult);
  
  // Test daily with interval
  const testDailyIntervalTask = createTestRecurringTask('Daily', {
    recurrencePattern: { interval: 2 } // Every 2 days
  });
  const dailyIntervalResult = estimateRecurringTaskInstances(
    testDailyIntervalTask,
    new Date(2023, 0, 1),
    new Date(2023, 0, 31)
  );
  console.log('Daily with interval=2 (31 days):', dailyIntervalResult);
  
  // Test weekly recurrence
  const testWeeklyTask = createTestRecurringTask('Weekly');
  const weeklyResult = estimateRecurringTaskInstances(
    testWeeklyTask,
    new Date(2023, 0, 1),
    new Date(2023, 1, 28) // Feb 28, 2023 (about 8 weeks)
  );
  console.log('Weekly (8 weeks):', weeklyResult);
  
  // Test weekly with specific days
  const testWeeklyDaysTask = createTestRecurringTask('Weekly', {
    recurrencePattern: { weekdays: [1, 3, 5] } // Mon, Wed, Fri
  });
  const weeklyDaysResult = estimateRecurringTaskInstances(
    testWeeklyDaysTask,
    new Date(2023, 0, 1),
    new Date(2023, 0, 31) // About 4 weeks
  );
  console.log('Weekly (Mon,Wed,Fri for 4 weeks):', weeklyDaysResult);
  
  // Test monthly recurrence
  const testMonthlyTask = createTestRecurringTask('Monthly', {
    recurrencePattern: { dayOfMonth: 15 } // 15th of each month
  });
  const monthlyResult = estimateRecurringTaskInstances(
    testMonthlyTask,
    new Date(2023, 0, 1),
    new Date(2023, 11, 31) // Whole year 2023
  );
  console.log('Monthly (15th of month for 12 months):', monthlyResult);
  
  // Test quarterly recurrence
  const testQuarterlyTask = createTestRecurringTask('Quarterly');
  const quarterlyResult = estimateRecurringTaskInstances(
    testQuarterlyTask,
    new Date(2023, 0, 1),
    new Date(2023, 11, 31) // Whole year 2023
  );
  console.log('Quarterly (whole year):', quarterlyResult);
  
  // Test annual recurrence
  const testAnnualTask = createTestRecurringTask('Annually');
  const annualResult = estimateRecurringTaskInstances(
    testAnnualTask,
    new Date(2023, 0, 1),
    new Date(2025, 11, 31) // 3 years
  );
  console.log('Annual (3 years):', annualResult);
  
  // Test with end date
  const testWithEndDate = createTestRecurringTask('Daily', {
    endDate: new Date(2023, 0, 15) // Jan 15, 2023
  });
  const endDateResult = estimateRecurringTaskInstances(
    testWithEndDate,
    new Date(2023, 0, 1),
    new Date(2023, 0, 31) // Through Jan 31 (but task ends on Jan 15)
  );
  console.log('Daily with end date (Jan 15):', endDateResult);
  
  console.groupEnd();
};
