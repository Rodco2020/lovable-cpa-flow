
import { Skill } from "./skill";

export type StaffStatus = "active" | "inactive";

export interface Staff {
  id: string;
  fullName: string;
  roleTitle: string;
  skills: string[]; // References to skill IDs
  costPerHour: number;
  email: string;
  phone: string;
  status: StaffStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TimeSlot {
  id: string;
  staffId: string;
  date: string; // ISO date string
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  isAvailable: boolean;
  taskId?: string; // If assigned to a task
}

// For the weekly availability matrix
export interface WeeklyAvailability {
  staffId: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 6 = Saturday
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  isAvailable: boolean;
}
