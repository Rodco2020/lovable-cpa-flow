
import { RecurringTaskDB, TaskPriority, TaskCategory, TaskStatus } from '@/types/task';
import { debugLog } from '../logger';

/**
 * Data Transformation Service
 * Pure type casting and data transformation logic
 */
export class DataTransformationService {
  /**
   * Transform raw database data to typed RecurringTaskDB objects
   */
  static transformRecurringTasks(rawData: any[]): RecurringTaskDB[] {
    debugLog(`Transforming ${rawData.length} raw tasks to typed objects`);

    const typedData: RecurringTaskDB[] = rawData.map(task => ({
      ...task,
      priority: task.priority as TaskPriority,
      category: task.category as TaskCategory,
      status: task.status as TaskStatus
    }));

    debugLog(`Successfully transformed ${typedData.length} tasks`);
    return typedData;
  }

  /**
   * Apply basic type casting and minimal validation for fallback scenarios
   */
  static createFallbackTasks(rawData: any[]): RecurringTaskDB[] {
    debugLog(`Creating fallback tasks from ${rawData.length} raw entries`);

    const fallbackTasks: RecurringTaskDB[] = rawData
      .filter(task => task && task.id && task.client_id) // Basic existence check
      .map(task => ({
        ...task,
        priority: (task.priority as TaskPriority) || 'Medium',
        category: (task.category as TaskCategory) || 'Other',
        status: (task.status as TaskStatus) || 'Unscheduled',
        required_skills: Array.isArray(task.required_skills) ? task.required_skills : []
      }));

    debugLog(`Created ${fallbackTasks.length} fallback tasks`);
    return fallbackTasks;
  }

  /**
   * Validate and format client data
   */
  static transformClientData(rawData: any[]): Array<{ id: string; name: string }> {
    if (!Array.isArray(rawData)) {
      console.warn('Clients data is not an array');
      return [];
    }

    const validClients = rawData
      .filter(client => 
        client && 
        typeof client.id === 'string' && 
        typeof client.legal_name === 'string' &&
        client.id.trim().length > 0 &&
        client.legal_name.trim().length > 0
      )
      .map(client => ({
        id: client.id.trim(),
        name: client.legal_name.trim()
      }));

    debugLog(`Transformed ${validClients.length} valid clients`);
    return validClients;
  }

  /**
   * Transform clients with revenue data
   */
  static transformClientsWithRevenue(rawData: any[]): Array<{ id: string; legal_name: string; expected_monthly_revenue: number }> {
    if (!Array.isArray(rawData)) {
      console.warn('Clients revenue data is not an array');
      return [];
    }

    const validClients = rawData
      .filter(client => 
        client && 
        typeof client.id === 'string' && 
        typeof client.legal_name === 'string' &&
        client.id.trim().length > 0 &&
        client.legal_name.trim().length > 0 &&
        typeof client.expected_monthly_revenue === 'number'
      )
      .map(client => ({
        id: client.id.trim(),
        legal_name: client.legal_name.trim(),
        expected_monthly_revenue: Number(client.expected_monthly_revenue) || 0
      }));

    debugLog(`Transformed ${validClients.length} clients with revenue data`);
    return validClients;
  }

  /**
   * Transform and validate skill data
   */
  static transformSkillData(rawData: any[]): string[] {
    if (!Array.isArray(rawData)) {
      console.warn('Skills data is not an array');
      return [];
    }

    const validSkills = rawData
      .filter(skill => skill && typeof skill.name === 'string' && skill.name.trim().length > 0)
      .map(skill => skill.name.trim());

    debugLog(`Transformed ${validSkills.length} valid skills`);
    return validSkills;
  }

  /**
   * Sanitize array length to prevent excessive calculations
   */
  static sanitizeArrayLength(value: number, maxValue: number): number {
    if (typeof value !== 'number' || isNaN(value)) {
      return 0;
    }
    return Math.min(Math.max(0, value), maxValue);
  }

  /**
   * Summarize validation errors for better reporting
   */
  static summarizeValidationErrors(invalidTasks: Array<{ task: RecurringTaskDB; errors: string[] }>): Record<string, number> {
    const errorCounts: Record<string, number> = {};

    invalidTasks.forEach(({ errors }) => {
      errors.forEach(error => {
        // Categorize errors for cleaner reporting
        let category = 'Other';
        
        if (error.includes('skill')) category = 'Invalid Skills';
        else if (error.includes('hours')) category = 'Invalid Hours';
        else if (error.includes('date')) category = 'Invalid Dates';
        else if (error.includes('ID')) category = 'Missing IDs';
        else if (error.includes('recurrence')) category = 'Invalid Recurrence';

        errorCounts[category] = (errorCounts[category] || 0) + 1;
      });
    });

    return errorCounts;
  }
}
