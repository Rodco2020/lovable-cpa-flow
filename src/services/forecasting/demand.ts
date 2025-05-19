import {
  DateRange,
  ForecastMode,
  SkillAllocationStrategy,
  SkillHours
} from '@/types/forecasting';
import { SkillType, RecurringTask } from '@/types/task';
import { getRecurringTasks, getTaskInstances } from '@/services/taskService';
import {
  differenceInDays,
  differenceInMonths,
  differenceInYears,
  addDays,
  addYears,
  getDaysInMonth,
  getDay
} from 'date-fns';
import { debugLog } from './logger';

export interface DemandOptions {
  dateRange: DateRange;
  mode: ForecastMode;
  includeSkills: SkillType[] | 'all';
  skillAllocationStrategy?: SkillAllocationStrategy;
}

export const calculateDemand = async ({
  dateRange,
  mode,
  includeSkills,
  skillAllocationStrategy = 'duplicate'
}: DemandOptions): Promise<SkillHours[]> => {
  const skillHoursMap: Record<SkillType, number> = {};

  debugLog(
    `Calculating ${mode} demand for date range: ${dateRange.startDate.toISOString()} to ${dateRange.endDate.toISOString()}`
  );
  debugLog(`Using skill allocation strategy: ${skillAllocationStrategy}`);

  if (mode === 'virtual') {
    const recurringTasks = await getRecurringTasks();
    debugLog(`Found ${recurringTasks.length} recurring tasks for virtual demand calculation`);

    recurringTasks.forEach(task => {
      if (
        includeSkills !== 'all' &&
        !task.requiredSkills.some(skill => includeSkills.includes(skill))
      ) {
        debugLog(`Skipping task ${task.id}: required skills don't match filter`, {
          taskSkills: task.requiredSkills,
          filterSkills: includeSkills
        });
        return;
      }

      const instanceCount = estimateRecurringTaskInstances(task, dateRange);
      const totalTaskHours = task.estimatedHours * instanceCount;

      debugLog(`Task ${task.id} (${task.name}): ${instanceCount} instances × ${task.estimatedHours}h = ${totalTaskHours}h total`);

      if (task.requiredSkills.length === 0) {
        debugLog(`Warning: Task ${task.id} (${task.name}) has no required skills, skipping demand calculation`);
        return;
      }

      if (skillAllocationStrategy === 'distribute' && task.requiredSkills.length > 0) {
        const hoursPerSkill = totalTaskHours / task.requiredSkills.length;
        debugLog(`Distributing ${totalTaskHours}h across ${task.requiredSkills.length} skills (${hoursPerSkill}h per skill)`);
        task.requiredSkills.forEach(skill => {
          skillHoursMap[skill] = (skillHoursMap[skill] || 0) + hoursPerSkill;
          debugLog(`  - Allocated ${hoursPerSkill}h to skill ${skill}`);
        });
      } else {
        task.requiredSkills.forEach(skill => {
          skillHoursMap[skill] = (skillHoursMap[skill] || 0) + totalTaskHours;
          debugLog(`  - Duplicated ${totalTaskHours}h to skill ${skill}`);
        });
      }
    });
  } else {
    const taskInstances = await getTaskInstances({
      dueAfter: dateRange.startDate,
      dueBefore: dateRange.endDate
    });

    debugLog(`Found ${taskInstances.length} task instances for actual demand calculation`);

    taskInstances.forEach(task => {
      if (
        includeSkills !== 'all' &&
        !task.requiredSkills.some(skill => includeSkills.includes(skill))
      ) {
        return;
      }

      const totalTaskHours = task.estimatedHours;

      if (task.requiredSkills.length === 0) {
        debugLog(`Warning: Task instance ${task.id} has no required skills, skipping demand calculation`);
        return;
      }

      if (skillAllocationStrategy === 'distribute' && task.requiredSkills.length > 0) {
        const hoursPerSkill = totalTaskHours / task.requiredSkills.length;
        task.requiredSkills.forEach(skill => {
          skillHoursMap[skill] = (skillHoursMap[skill] || 0) + hoursPerSkill;
        });
      } else {
        task.requiredSkills.forEach(skill => {
          skillHoursMap[skill] = (skillHoursMap[skill] || 0) + totalTaskHours;
        });
      }
    });
  }

  const result: SkillHours[] = Object.entries(skillHoursMap).map(([skill, hours]) => ({
    skill: skill as SkillType,
    hours
  }));

  debugLog('Demand calculation complete, results:', result);

  return result;
};

export const estimateRecurringTaskInstances = (
  task: RecurringTask,
  dateRange: DateRange
): number => {
  const pattern = task.recurrencePattern;
  let instanceCount = 0;

  if (!pattern || !pattern.type) {
    debugLog(`Invalid recurrence pattern for task: ${task.name}`);
    return 0;
  }

  const startDate = new Date(Math.max(dateRange.startDate.getTime(), task.createdAt.getTime()));
  const endDate =
    pattern.endDate && pattern.endDate < dateRange.endDate ? pattern.endDate : dateRange.endDate;

  if (endDate < startDate) {
    debugLog(
      `No instances for task ${task.id} (${task.name}): end date (${endDate.toISOString()}) is before start date (${startDate.toISOString()})`
    );
    return 0;
  }

  debugLog('Calculating instances for task ' + task.id + ' (' + task.name + '):', {
    patternType: pattern.type,
    interval: pattern.interval || 1,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  });

  switch (pattern.type) {
    case 'Daily': {
      const daysDiff = differenceInDays(endDate, startDate) + 1;
      instanceCount = Math.ceil(daysDiff / (pattern.interval || 1));
      break;
    }
    case 'Weekly': {
      if (pattern.weekdays && pattern.weekdays.length > 0) {
        instanceCount = 0;
        const fullWeeks = Math.floor(differenceInDays(endDate, startDate) / 7);
        const remainingDays = differenceInDays(endDate, addDays(startDate, fullWeeks * 7));
        instanceCount += (fullWeeks * pattern.weekdays.length) / (pattern.interval || 1);
        let currentDay = addDays(startDate, fullWeeks * 7);
        for (let i = 0; i <= remainingDays; i++) {
          const dayOfWeek = getDay(currentDay);
          if (pattern.weekdays.includes(dayOfWeek)) {
            instanceCount++;
          }
          currentDay = addDays(currentDay, 1);
        }
        instanceCount = instanceCount / (pattern.interval || 1);
      } else {
        instanceCount =
          ((differenceInDays(endDate, startDate) + 1) / 7) / (pattern.interval || 1);
      }
      break;
    }
    case 'Monthly': {
      const monthsDiff = differenceInMonths(endDate, startDate);
      if (pattern.dayOfMonth) {
        instanceCount = 0;
        for (let i = 0; i <= monthsDiff; i++) {
          const currentMonth = addDays(startDate, i * 30);
          const daysInCurrentMonth = getDaysInMonth(currentMonth);
          if (pattern.dayOfMonth <= daysInCurrentMonth) {
            const instanceDate = new Date(
              currentMonth.getFullYear(),
              currentMonth.getMonth(),
              pattern.dayOfMonth
            );
            if (instanceDate >= startDate && instanceDate <= endDate) {
              instanceCount++;
            }
          }
        }
      } else {
        instanceCount = monthsDiff + 1;
      }
      instanceCount = instanceCount / (pattern.interval || 1);
      break;
    }
    case 'Quarterly': {
      instanceCount = Math.ceil(
        differenceInMonths(endDate, startDate) / 3 / (pattern.interval || 1)
      );
      break;
    }
    case 'Annually': {
      const yearsDiff = differenceInYears(endDate, startDate);
      const extraMonths = differenceInMonths(endDate, addYears(startDate, yearsDiff)) > 0 ? 1 : 0;
      instanceCount = (yearsDiff + extraMonths) / (pattern.interval || 1);
      break;
    }
    case 'Custom': {
      if (pattern.customOffsetDays && pattern.customOffsetDays > 0) {
        instanceCount = Math.ceil(
          differenceInDays(endDate, startDate) / pattern.customOffsetDays
        );
      } else {
        instanceCount = 1;
      }
      break;
    }
    default:
      debugLog(`Warning: Unknown recurrence pattern type "${pattern.type}" for task ${task.id} (${task.name})`);
      instanceCount = 1;
      break;
  }

  instanceCount = Math.max(0, Math.round(instanceCount));
  debugLog(`Final instance count for task ${task.id} (${task.name}): ${instanceCount}`);

  return instanceCount;
};
