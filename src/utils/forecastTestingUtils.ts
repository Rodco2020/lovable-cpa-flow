
import { RecurringTask, RecurrencePattern, SkillType, TaskPriority, TaskCategory } from '@/types/task';
import { DateRange, SkillAllocationStrategy } from '@/types/forecasting';
import { estimateRecurringTaskInstances } from '@/services/forecasting/demand';

/**
 * Creates a test recurring task with specified parameters
 */
export const createTestRecurringTask = (
  recurrencePattern: RecurrencePattern,
  estimatedHours: number = 3,
  skills: SkillType[] = ['Tax Specialist']
): RecurringTask => {
  return {
    id: 'test-task',
    templateId: 'test-template',
    clientId: 'test-client',
    name: 'Test Recurring Task',
    description: 'A test task for forecast calculations',
    estimatedHours,
    requiredSkills: skills,
    priority: 'Medium' as TaskPriority,
    category: 'Tax' as TaskCategory,
    status: 'Scheduled',
    dueDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    recurrencePattern,
    lastGeneratedDate: null,
    isActive: true
  };
};

/**
 * Runs test cases for recurring task instance calculations
 */
export const runRecurrenceTests = () => {
  console.group('Recurrence Pattern Tests');
  
  // Test 1: Daily recurrence
  const dailyTask = createTestRecurringTask({
    type: 'Daily',
    interval: 1
  });
  
  const dailyRange: DateRange = {
    startDate: new Date('2023-01-01'),
    endDate: new Date('2023-01-07')
  };
  
  console.log('Daily task (every day for 7 days):', 
    estimateRecurringTaskInstances(dailyTask, dailyRange)); // Expected: 7
  
  // Test 2: Weekly with specific days
  const weeklyTask = createTestRecurringTask({
    type: 'Weekly',
    interval: 1,
    weekdays: [1, 3, 5] // Mon, Wed, Fri
  });
  
  console.log('Weekly task (Mon,Wed,Fri for 2 weeks):', 
    estimateRecurringTaskInstances(weeklyTask, {
      startDate: new Date('2023-01-02'), // Monday
      endDate: new Date('2023-01-15')    // 2 weeks later
    })); // Expected: 6 (3 days × 2 weeks)
  
  // Test 3: Monthly with specific day
  const monthlyTask = createTestRecurringTask({
    type: 'Monthly',
    interval: 1,
    dayOfMonth: 15
  });
  
  console.log('Monthly task (15th of each month for 3 months):', 
    estimateRecurringTaskInstances(monthlyTask, {
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-03-31')
    })); // Expected: 3 (Jan 15, Feb 15, Mar 15)
  
  // Test 4: Quarterly
  const quarterlyTask = createTestRecurringTask({
    type: 'Quarterly',
    interval: 1
  });
  
  console.log('Quarterly task (every quarter for 1 year):', 
    estimateRecurringTaskInstances(quarterlyTask, {
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-12-31')
    })); // Expected: 4
  
  // Test 5: Edge case - Leap year
  const leapYearTask = createTestRecurringTask({
    type: 'Monthly',
    interval: 1,
    dayOfMonth: 29
  });
  
  console.log('Monthly task on 29th (incl. Feb in leap year):', 
    estimateRecurringTaskInstances(leapYearTask, {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-03-31')
    })); // Expected: 3 (Jan 29, Feb 29, Mar 29)
  
  console.log('Monthly task on 29th (incl. Feb in non-leap year):', 
    estimateRecurringTaskInstances(leapYearTask, {
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-03-31')
    })); // Expected: 2 (Jan 29, Mar 29)
  
  // Test 6: Custom pattern
  const customTask = createTestRecurringTask({
    type: 'Custom',
    customOffsetDays: 45
  });
  
  console.log('Custom task (every 45 days for 90 days):', 
    estimateRecurringTaskInstances(customTask, {
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-03-31') // ~90 days
    })); // Expected: 2
  
  console.groupEnd();
};

/**
 * Tests the skill hour allocation strategies
 */
export const runSkillAllocationTests = () => {
  console.group('Skill Hour Allocation Tests');
  
  // Create a task with multiple skills
  const multiSkillTask = createTestRecurringTask(
    {
      type: 'Daily',
      interval: 1
    },
    5, // 5 hours per instance
    ['Tax Specialist', 'CPA', 'Audit'] // 3 skills
  );
  
  // Test range for 3 days
  const testRange: DateRange = {
    startDate: new Date('2023-01-01'),
    endDate: new Date('2023-01-03')
  };
  
  // Calculate instance count
  const instances = estimateRecurringTaskInstances(multiSkillTask, testRange);
  console.log(`Task instances in range: ${instances}`);
  
  // Expected total hours
  const totalHours = instances * multiSkillTask.estimatedHours;
  console.log(`Total task hours: ${totalHours}`);
  
  // Duplicate strategy (original behavior)
  console.log('With duplicate strategy:');
  console.log(`- Each skill receives ${totalHours} hours`);
  console.log(`- Total demand hours: ${totalHours * multiSkillTask.requiredSkills.length}`);
  
  // Distribute strategy (new behavior)
  const hoursPerSkill = totalHours / multiSkillTask.requiredSkills.length;
  console.log('With distribute strategy:');
  console.log(`- Each skill receives ${hoursPerSkill} hours`);
  console.log(`- Total demand hours: ${totalHours}`);
  
  console.groupEnd();
};

export const exportedForTypechecking = true; // Ensures this module gets included in build
