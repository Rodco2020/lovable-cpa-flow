
import { ForecastData } from '@/types/forecasting';
import { RecurringTaskDB } from '@/types/task';
import { MonthInfo, StaffInformation } from './types';
import { MONTH_FORMAT_OPTIONS } from './constants';

/**
 * Data Extraction Utilities
 * Handles extraction of foundational data from raw inputs
 */
export class DataExtractors {
  /**
   * Extract months information from forecast data
   */
  static extractMonths(forecastData: ForecastData[]): MonthInfo[] {
    const months = new Set<string>();
    
    forecastData.forEach(item => {
      if (item.period) {
        months.add(item.period);
      }
    });
    
    return Array.from(months)
      .sort()
      .map(monthKey => ({
        key: monthKey,
        label: this.formatMonthLabel(monthKey)
      }));
  }

  /**
   * Extract unique skills from forecast data
   */
  static extractSkills(forecastData: ForecastData[]): string[] {
    const skills = new Set<string>();
    
    forecastData.forEach(item => {
      item.demand?.forEach(d => {
        if (d.skill) {
          skills.add(d.skill);
        }
      });
    });
    
    return Array.from(skills).sort();
  }

  /**
   * Extract staff information from tasks using correct database field names
   */
  static extractStaffInformation(tasks: RecurringTaskDB[]): StaffInformation[] {
    const staffMap = new Map<string, string>();
    
    tasks.forEach(task => {
      if (task.preferred_staff_id) {
        // Generate a display name from staff ID (should be enhanced with actual staff lookup)
        staffMap.set(task.preferred_staff_id, `Staff ${task.preferred_staff_id.slice(0, 8)}`);
      }
    });
    
    const staffArray = Array.from(staffMap.entries()).map(([id, name]) => ({ id, name }));
    
    console.log(`👥 [STAFF EXTRACTION] Extracted staff information:`, {
      uniqueStaffCount: staffArray.length,
      staffList: staffArray
    });
    
    return staffArray;
  }

  /**
   * Format month key into human-readable label
   */
  private static formatMonthLabel(monthKey: string): string {
    try {
      const date = new Date(monthKey);
      return date.toLocaleDateString('en-US', MONTH_FORMAT_OPTIONS);
    } catch {
      return monthKey;
    }
  }
}
