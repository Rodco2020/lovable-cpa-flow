
export interface Staff {
  id: string;
  fullName: string;
  roleTitle: string;
  skills: string[];
  assignedSkills: string[];
  costPerHour: number;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface StaffOption {
  id: string;
  full_name: string;
}

export interface TimeSlot {
  id?: string;
  staffId: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  taskId?: string;
  date: string;
}

export interface WeeklyAvailability {
  id?: string;
  staffId: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface AvailabilitySummary {
  weeklyTotal: number;
  averageDailyHours: number;
  peakDay: number;
  dailySummaries: Array<{
    day: number;
    totalHours: number;
    slots: Array<{ startTime: string; endTime: string; }>;
  }>;
}
