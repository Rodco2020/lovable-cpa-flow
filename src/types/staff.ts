
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

export interface TimeSlot {
  id: string;
  staffId: string;
  startTime: Date;
  endTime: Date;
  isAvailable: boolean;
}

export interface StaffAvailabilitySlot {
  id: string;
  staffId: string;
  dayOfWeek: number; // 0-6, where 0 is Sunday
  timeSlot: string;
  isAvailable: boolean;
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
}

export type StaffAvailability = WeeklyAvailability[];
