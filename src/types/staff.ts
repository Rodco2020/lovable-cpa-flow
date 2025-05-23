
export type StaffStatus = 'active' | 'inactive'; // Fixed case to match what's used throughout the codebase

export interface Staff {
  id: string;
  fullName: string;
  roleTitle: string;
  skills: string[];
  assignedSkills: string[]; // Ensure this is included in the interface
  costPerHour: number;
  email: string;
  phone: string;
  status: StaffStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface StaffMember {
  id: string;
  fullName: string;
  roleTitle: string;
  skills: string[];
  assignedSkills: string[]; // Added to match Staff interface
  costPerHour: number;
  email: string;
  phone: string;
  status: StaffStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface StaffOption {
  id: string;
  full_name: string; // Note: snake_case as this is coming directly from the database
}

export interface WeeklyAvailability {
  id?: string;
  staffId: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  slots?: {
    startTime: string;
    endTime: string;
  }[];
  startTime?: string;
  endTime?: string;
  isAvailable: boolean;
}

export interface AvailabilitySummary {
  weeklyTotal: number;
  averageDailyHours: number;
  peakDay?: number; // Added to fix type error
  dailySummaries: Array<{
    day: number;
    totalHours: number;
    slots: Array<{
      startTime: string;
      endTime: string;
    }>;
  }>;
}

export interface TimeSlot {
  id?: string;
  staffId: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  taskId?: string; // Added to fix type errors
  date?: string; // Added to fix type errors
}
