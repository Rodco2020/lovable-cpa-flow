
import { RecurringTask, RecurringTaskDB } from '@/types/task';
import { 
  transformDatabaseToApplication, 
  transformApplicationToDatabase 
} from '../taskService/dataTransformationService';

/**
 * Enhanced Mappers using the unified data transformation service
 * 
 * These mappers now delegate to the centralized transformation service
 * for consistent data handling across the application.
 */

/**
 * Map database recurring task to application-level RecurringTask
 */
export const mapDatabaseToRecurringTask = (dbTask: RecurringTaskDB): RecurringTask => {
  return transformDatabaseToApplication(dbTask);
};

/**
 * Map application-level RecurringTask to database format for updates
 */
export const mapRecurringTaskToDatabase = (task: Partial<RecurringTask>) => {
  return transformApplicationToDatabase(task);
};
