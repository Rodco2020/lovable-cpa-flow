
export type SkillType = string;
export type StaffStatus = "Active" | "Inactive" | "On Leave";

export interface StaffMember {
  id: string;
  fullName: string;
  roleTitle?: string;
  email: string;
  phone?: string;
  assignedSkills: SkillType[];
  costPerHour: number;
  status: StaffStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface StaffAvailability {
  id: string;
  staffId: string;
  dayOfWeek: number; // 0-6, where 0 is Sunday
  timeSlot: string; // Format: "HH:MM-HH:MM"
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StaffAvailabilityMatrix {
  staffId: string;
  weeklySchedule: {
    [dayOfWeek: number]: { // 0-6, where 0 is Sunday
      [timeSlot: string]: boolean; // "HH:MM-HH:MM": true/false
    };
  };
}

// Additional interfaces needed for backward compatibility with existing code
// These will maintain compatibility until other files can be refactored
export interface Staff extends StaffMember {}
export interface TimeSlot {
  id: string;
  start: string;
  end: string;
  available: boolean;
}
export interface WeeklyAvailability {
  id: string;
  staffId: string;
  dayOfWeek: number;
  slots: TimeSlot[];
}
export interface AvailabilitySummary {
  staffId: string;
  totalHours: number;
  dailyHours: {
    [day: string]: number;
  };
}
