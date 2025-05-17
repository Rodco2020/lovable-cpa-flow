
import { v4 as uuidv4 } from 'uuid';
import { add, format, startOfWeek, addDays, isEqual, parseISO } from 'date-fns';
import { StaffMember, StaffStatus, StaffAvailability, StaffAvailabilitySlot, AvailabilitySummary, TimeSlot, WeeklyAvailability } from '@/types/staff';
import { SkillType } from '@/types/task';

// Get all staff members
export async function getAllStaff(): Promise<StaffMember[]> {
  // Mock implementation
  const staff: StaffMember[] = [];
  
  for (let i = 0; i < 5; i++) {
    staff.push({
      id: uuidv4(),
      fullName: `Staff Member ${i + 1}`,
      roleTitle: ['Junior Accountant', 'Senior Accountant', 'Tax Specialist', 'Audit Manager', 'Partner'][i],
      email: `staff${i + 1}@example.com`,
      phone: `(555) 123-${1000 + i}`,
      skills: ['Tax', 'Bookkeeping', 'Advisory', 'Audit'].slice(0, i + 1) as SkillType[],
      costPerHour: 50 + (i * 25),
      status: i < 4 ? 'Active' as StaffStatus : 'Inactive' as StaffStatus,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  
  return staff;
}

// Get staff member by ID
export async function getStaffById(id: string): Promise<StaffMember | null> {
  try {
    const allStaff = await getAllStaff();
    return allStaff.find(staff => staff.id === id) || null;
  } catch (error) {
    console.error("Error fetching staff:", error);
    return null;
  }
}

// Create a new staff member
export async function createStaff(staff: Omit<StaffMember, 'id' | 'createdAt' | 'updatedAt'>): Promise<StaffMember> {
  // Mock implementation
  const newStaff: StaffMember = {
    ...staff,
    id: uuidv4(),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  console.log("Created new staff member:", newStaff);
  return newStaff;
}

// Update a staff member
export async function updateStaff(id: string, updates: Partial<Omit<StaffMember, 'id' | 'createdAt'>>): Promise<StaffMember | null> {
  // Mock implementation
  try {
    const staffMember = await getStaffById(id);
    
    if (!staffMember) {
      console.error(`Staff member with ID ${id} not found`);
      return null;
    }
    
    const updatedStaff: StaffMember = {
      ...staffMember,
      ...updates,
      updatedAt: new Date()
    };
    
    console.log("Updated staff member:", updatedStaff);
    return updatedStaff;
  } catch (error) {
    console.error("Error updating staff:", error);
    return null;
  }
}

// Get staff availability for a specific day
export async function getStaffAvailabilityByDay(staffId: string, date: Date): Promise<TimeSlot[]> {
  // Mock implementation
  const dayOfWeek = date.getDay(); // 0-6, where 0 is Sunday
  const weeklyAvailability = await getWeeklyAvailabilityByStaff(staffId);
  
  // Convert the availability template into actual time slots for the day
  const slots: TimeSlot[] = [];
  const baseDate = date;
  
  // Generate time slots for standard business hours (9 AM to 5 PM)
  for (let hour = 9; hour < 17; hour++) {
    // Two 30-minute slots per hour
    for (let minute = 0; minute < 60; minute += 30) {
      const startTime = new Date(baseDate);
      startTime.setHours(hour, minute, 0, 0);
      
      const endTime = new Date(baseDate);
      endTime.setHours(hour, minute + 30, 0, 0);
      
      // Default availability based on day of week and time
      // (e.g., more likely available during middle of day, less at edges)
      let isAvailable = true;
      
      // Randomize some unavailability
      if (hour === 12 || (Math.random() > 0.8)) {
        isAvailable = false;
      }
      
      slots.push({
        id: uuidv4(),
        staffId,
        startTime,
        endTime,
        isAvailable,
        taskId: isAvailable ? (Math.random() > 0.7 ? uuidv4() : undefined) : undefined
      });
    }
  }
  
  return slots;
}

// Get time slots for a specific date and staff
export async function getTimeSlotsByStaffAndDate(staffId: string, date: Date): Promise<TimeSlot[]> {
  // Ensure we have a proper date
  const dateToUse = date instanceof Date ? date : new Date(date);
  return getStaffAvailabilityByDay(staffId, dateToUse);
}

// Get availability for all staff on a specific date
export async function getTimeSlotsByDate(staffId: string, date: Date): Promise<TimeSlot[]> {
  // Ensure date is a Date object
  const dateToUse = date instanceof Date ? date : new Date(date);
  return getStaffAvailabilityByDay(staffId, dateToUse);
}

// Get weekly availability for a staff member
export async function getWeeklyAvailabilityByStaff(staffId: string): Promise<StaffAvailability> {
  // Mock implementation that returns a week's worth of availability
  const today = new Date();
  const startOfCurrentWeek = startOfWeek(today);
  
  const weeklyAvail: WeeklyAvailability = {
    startDate: startOfCurrentWeek,
    endDate: addDays(startOfCurrentWeek, 6),
    days: [],
    totalHours: 0,
  };
  
  // Generate daily availability for each day of the week
  for (let i = 0; i < 7; i++) {
    const currentDay = addDays(startOfCurrentWeek, i);
    const dailySlots = await getStaffAvailabilityByDay(staffId, currentDay);
    
    // Calculate total available hours
    const availableHours = dailySlots.filter(slot => slot.isAvailable).length * 0.5; // Each slot is 30 minutes
    
    weeklyAvail.days.push({
      date: currentDay,
      slots: dailySlots,
      totalHours: availableHours
    });
    
    weeklyAvail.totalHours += availableHours;
  }
  
  return [weeklyAvail];
}

// Get availability summary for a staff member
export async function getAvailabilitySummary(staffId: string): Promise<AvailabilitySummary> {
  // Calculate a summary of availability based on the weekly template
  const weeklyAvail = await getWeeklyAvailabilityByStaff(staffId);
  
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dailyBreakdown: { [day: string]: number } = {};
  
  // Initialize with zeros
  daysOfWeek.forEach(day => {
    dailyBreakdown[day] = 0;
  });
  
  // Fill in actual values
  weeklyAvail[0].days.forEach(day => {
    const dayName = format(day.date, 'EEEE');
    dailyBreakdown[dayName] = day.totalHours;
  });
  
  const totalWeeklyHours = weeklyAvail[0].totalHours;
  
  // Assuming a standard 40-hour workweek
  const utilizationPercentage = Math.min(100, (totalWeeklyHours / 40) * 100);
  
  return {
    totalWeeklyHours,
    dailyBreakdown,
    utilizationPercentage,
    weeklyTotal: totalWeeklyHours,
    dailySummaries: dailyBreakdown,
    averageDailyHours: totalWeeklyHours / 5, // Assuming 5 workdays
  };
}

// Batch update weekly availability
export async function batchUpdateWeeklyAvailability(
  availabilitySlots: StaffAvailabilitySlot[]
): Promise<boolean> {
  try {
    // Mock implementation
    console.log("Updating availability slots:", availabilitySlots);
    
    return true;
  } catch (error) {
    console.error("Error updating availability:", error);
    return false;
  }
}
