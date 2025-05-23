
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
export interface Staff extends StaffMember {
  // For backward compatibility with older components that use skills instead of assignedSkills
  skills?: SkillType[];
}

export interface TimeSlot {
  id: string;
  start: string;
  end: string;
  available: boolean;
  // For backward compatibility with older components
  staffId?: string;
  taskId?: string;
  startTime?: string;
  endTime?: string;
  isAvailable?: boolean;
}

export interface WeeklyAvailability {
  id: string;
  staffId: string;
  dayOfWeek: number;
  slots: TimeSlot[];
  // For backward compatibility with older components
  startTime?: string;
  endTime?: string;
  isAvailable?: boolean;
}

export interface AvailabilitySummary {
  staffId: string;
  totalHours: number;
  dailyHours: {
    [day: string]: number;
  };
  // For backward compatibility with older components
  weeklyTotal?: number;
  averageDailyHours?: number;
  dailySummaries?: {
    [day: string]: number;
  };
}

// For backward compatibility with components that expect this type
export interface StaffOption {
  id: string;
  full_name: string;
}
