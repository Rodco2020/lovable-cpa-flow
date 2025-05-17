
import { SkillType } from './task';

export interface StaffMember {
  id: string;
  fullName: string;
  roleTitle?: string;
  email: string;
  phone?: string;
  skills: SkillType[];
  costPerHour: number;
  status: 'Active' | 'Inactive' | 'On Leave';
  createdAt: Date;
  updatedAt: Date;
}

// Alias for StaffMember for backward compatibility
export type Staff = StaffMember;

export type StaffStatus = 'Active' | 'Inactive' | 'On Leave';

export interface TimeSlot {
  id: string;
  staffId: string;
  startTime: Date;
  endTime: Date;
  isAvailable: boolean;
  taskId?: string; // Added taskId property for DailyPlanner component
}

export interface StaffAvailabilitySlot {
  id: string;
  staffId: string;
  dayOfWeek: number; // 0-6, where 0 is Sunday
  timeSlot: string;
  isAvailable: boolean;
  startTime?: string; // Added properties needed in WeeklyAvailabilityMatrix
  endTime?: string;
}

export interface DailyAvailability {
  date: Date;
  slots: TimeSlot[];
  totalHours: number;
}

export interface WeeklyAvailability {
  startDate: Date;
  endDate: Date;
  days: DailyAvailability[];
  totalHours: number;
  dayOfWeek?: number; // Added properties needed in WeeklyAvailabilityMatrix
  isAvailable?: boolean;
  startTime?: string;
  endTime?: string;
  staffId?: string;
}

export type StaffAvailability = WeeklyAvailability[];

export interface AvailabilitySummary {
  totalWeeklyHours: number;
  dailyBreakdown: { [day: string]: number };
  utilizationPercentage: number;
  dailySummaries?: { [day: string]: number }; // Added for AvailabilitySummaryPanel
}
