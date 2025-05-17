
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

// Enhanced for the weekly availability matrix
export interface WeeklyAvailability {
  staffId: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 6 = Saturday
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  isAvailable: boolean;
}

// Enhanced interface for availability summaries with more detailed metrics
export interface AvailabilitySummary {
  dailySummaries: { 
    day: number; 
    totalHours: number; 
    slots: { startTime: string; endTime: string }[]; // Added slot details for more granular analysis
  }[];
  weeklyTotal: number;
  // Added metrics for capacity analysis
  averageDailyHours: number; 
  peakDay: { day: number; hours: number } | null;
  distribution: { [key: string]: number }; // Morning/afternoon/evening distribution
}

// New type for tracking capacity in different time segments
export type TimeSegment = 'morning' | 'afternoon' | 'evening';
