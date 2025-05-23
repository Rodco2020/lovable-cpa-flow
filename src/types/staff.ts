
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
  status: StaffStatus | boolean;
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
