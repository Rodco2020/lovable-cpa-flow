
/**
 * Time Slot Parser Utility
 * Handles parsing of time slot strings from the database (e.g., "09:00-12:00")
 */

export interface ParsedTimeSlot {
  startTime: string;
  endTime: string;
  durationHours: number;
}

export class TimeSlotParser {
  /**
   * Parse a time slot string into structured data
   * @param timeSlot - String in format "HH:MM-HH:MM" (e.g., "09:00-12:00")
   * @returns ParsedTimeSlot object
   */
  static parseTimeSlot(timeSlot: string): ParsedTimeSlot | null {
    if (!timeSlot || typeof timeSlot !== 'string') {
      return null;
    }

    // Handle different possible formats
    const timeSlotTrimmed = timeSlot.trim();
    
    // Match format "HH:MM-HH:MM" or "HH:MM - HH:MM"
    const timeRangeMatch = timeSlotTrimmed.match(/^(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/);
    
    if (!timeRangeMatch) {
      console.warn(`Invalid time slot format: ${timeSlot}`);
      return null;
    }

    const [, startTime, endTime] = timeRangeMatch;
    
    try {
      const duration = this.calculateDuration(startTime, endTime);
      
      return {
        startTime,
        endTime,
        durationHours: duration
      };
    } catch (error) {
      console.error(`Error parsing time slot ${timeSlot}:`, error);
      return null;
    }
  }

  /**
   * Calculate duration in hours between two time strings
   * @param startTime - Start time in "HH:MM" format
   * @param endTime - End time in "HH:MM" format
   * @returns Duration in hours (decimal)
   */
  private static calculateDuration(startTime: string, endTime: string): number {
    const parseTime = (timeStr: string): number => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours + (minutes / 60);
    };

    const start = parseTime(startTime);
    const end = parseTime(endTime);
    
    // Handle cases where end time is next day (e.g., night shifts)
    if (end < start) {
      return (24 - start) + end;
    }
    
    return end - start;
  }

  /**
   * Parse multiple time slots for a day
   * @param timeSlots - Array of time slot strings
   * @returns Array of parsed time slots
   */
  static parseMultipleTimeSlots(timeSlots: string[]): ParsedTimeSlot[] {
    return timeSlots
      .map(slot => this.parseTimeSlot(slot))
      .filter((slot): slot is ParsedTimeSlot => slot !== null);
  }

  /**
   * Calculate total hours from multiple time slots
   * @param timeSlots - Array of time slot strings
   * @returns Total hours (decimal)
   */
  static calculateTotalHours(timeSlots: string[]): number {
    const parsedSlots = this.parseMultipleTimeSlots(timeSlots);
    return parsedSlots.reduce((total, slot) => total + slot.durationHours, 0);
  }

  /**
   * Validate time slot format
   * @param timeSlot - Time slot string to validate
   * @returns Boolean indicating if format is valid
   */
  static isValidTimeSlot(timeSlot: string): boolean {
    return this.parseTimeSlot(timeSlot) !== null;
  }
}
