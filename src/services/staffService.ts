
import { v4 as uuidv4 } from 'uuid';
import { StaffMember, StaffAvailability, AvailabilitySummary, TimeSlot, DailyAvailability, WeeklyAvailability, StaffAvailabilitySlot } from '@/types/staff';
import { SkillType } from '@/types/task';

// Get all staff members
export async function getAllStaffMembers(): Promise<StaffMember[]> {
  try {
    // Mock data for staff members
    return getMockStaff();
  } catch (error) {
    console.error('Error fetching staff:', error);
    return [];
  }
}

// Alias for getAllStaffMembers for backward compatibility
export const getAllStaff = getAllStaffMembers;

// Get staff member by ID
export async function getStaffById(id: string): Promise<StaffMember | null> {
  try {
    const allStaff = await getAllStaffMembers();
    const staff = allStaff.find(s => s.id === id);
    return staff || null;
  } catch (error) {
    console.error('Error fetching staff member:', error);
    return null;
  }
}

// Create new staff member
export async function createStaff(staffData: Omit<StaffMember, 'id' | 'createdAt' | 'updatedAt'>): Promise<StaffMember | null> {
  try {
    // Convert status if lowercase
    const statusMap: Record<string, StaffMember['status']> = {
      'active': 'Active',
      'inactive': 'Inactive',
      'on leave': 'On Leave'
    };
    
    const status = typeof staffData.status === 'string' && 
      statusMap[staffData.status.toLowerCase()] ? 
      statusMap[staffData.status.toLowerCase()] : 
      staffData.status;
    
    const skills = Array.isArray(staffData.skills) ? 
      staffData.skills.map(skill => typeof skill === 'string' ? skill : String(skill)) as SkillType[] :
      [];
    
    const newStaff: StaffMember = {
      id: uuidv4(),
      fullName: staffData.fullName,
      roleTitle: staffData.roleTitle || '',
      email: staffData.email,
      phone: staffData.phone || '',
      skills: skills,
      costPerHour: staffData.costPerHour,
      status: status,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // In a real app, this would save to the database
    console.log('Created new staff member:', newStaff);
    return newStaff;
  } catch (error) {
    console.error('Error creating staff member:', error);
    return null;
  }
}

// Update staff member
export async function updateStaff(id: string, updates: Partial<Omit<StaffMember, 'id' | 'createdAt' | 'updatedAt'>>): Promise<StaffMember | null> {
  try {
    const staff = await getStaffById(id);
    if (!staff) return null;
    
    // Convert status if lowercase
    const statusMap: Record<string, StaffMember['status']> = {
      'active': 'Active',
      'inactive': 'Inactive',
      'on leave': 'On Leave'
    };
    
    const status = typeof updates.status === 'string' && 
      statusMap[updates.status.toLowerCase()] ? 
      statusMap[updates.status.toLowerCase()] : 
      updates.status;
    
    const skills = updates.skills && Array.isArray(updates.skills) ? 
      updates.skills.map(skill => typeof skill === 'string' ? skill : String(skill)) as SkillType[] :
      staff.skills;
    
    const updatedStaff: StaffMember = {
      ...staff,
      fullName: updates.fullName ?? staff.fullName,
      roleTitle: updates.roleTitle ?? staff.roleTitle,
      email: updates.email ?? staff.email,
      phone: updates.phone ?? staff.phone,
      skills: skills,
      costPerHour: updates.costPerHour ?? staff.costPerHour,
      status: status ?? staff.status,
      updatedAt: new Date()
    };
    
    // In a real app, this would update the database
    console.log('Updated staff member:', updatedStaff);
    return updatedStaff;
  } catch (error) {
    console.error('Error updating staff member:', error);
    return null;
  }
}

// Get time slots for a specific staff member and date
export async function getTimeSlotsByStaffAndDate(
  staffId: string,
  date: Date
): Promise<TimeSlot[]> {
  try {
    // Mock time slots data
    const slots: TimeSlot[] = [];
    const startOfDay = new Date(date);
    startOfDay.setHours(9, 0, 0, 0); // Start at 9 AM
    
    const endOfDay = new Date(date);
    endOfDay.setHours(17, 0, 0, 0); // End at 5 PM
    
    let currentSlot = new Date(startOfDay);
    
    while (currentSlot < endOfDay) {
      const slotEnd = new Date(currentSlot);
      slotEnd.setMinutes(currentSlot.getMinutes() + 30); // 30-minute slots
      
      const isAvailable = Math.random() > 0.3; // 70% chance of availability
      
      slots.push({
        id: uuidv4(),
        staffId,
        startTime: new Date(currentSlot),
        endTime: new Date(slotEnd),
        isAvailable,
        taskId: isAvailable ? undefined : (Math.random() > 0.5 ? uuidv4() : undefined)
      });
      
      currentSlot = slotEnd;
    }
    
    return slots;
  } catch (error) {
    console.error('Error fetching time slots:', error);
    return [];
  }
}

// Get time slots for a specific date (all staff)
export async function getTimeSlotsByDate(date: Date): Promise<Record<string, TimeSlot[]>> {
  try {
    const staff = await getAllStaffMembers();
    const staffTimeSlots: Record<string, TimeSlot[]> = {};
    
    for (const s of staff) {
      staffTimeSlots[s.id] = await getTimeSlotsByStaffAndDate(s.id, date);
    }
    
    return staffTimeSlots;
  } catch (error) {
    console.error('Error fetching time slots by date:', error);
    return {};
  }
}

// Get weekly availability for a specific staff member
export async function getWeeklyAvailabilityByStaff(staffId: string): Promise<StaffAvailabilitySlot[]> {
  try {
    // Mock weekly availability data
    const days = [0, 1, 2, 3, 4, 5, 6]; // Sunday to Saturday
    const availability: StaffAvailabilitySlot[] = [];
    
    days.forEach(day => {
      // Morning slots (9 AM - 12 PM)
      for (let hour = 9; hour < 12; hour++) {
        availability.push({
          id: uuidv4(),
          staffId: staffId,
          dayOfWeek: day,
          timeSlot: `${hour}:00-${hour}:30`,
          isAvailable: day !== 0 && day !== 6, // Unavailable on weekends
          startTime: `${hour}:00`,
          endTime: `${hour}:30`
        });
        
        availability.push({
          id: uuidv4(),
          staffId: staffId,
          dayOfWeek: day,
          timeSlot: `${hour}:30-${hour+1}:00`,
          isAvailable: day !== 0 && day !== 6, // Unavailable on weekends
          startTime: `${hour}:30`,
          endTime: `${hour+1}:00`
        });
      }
      
      // Afternoon slots (1 PM - 5 PM)
      for (let hour = 13; hour < 17; hour++) {
        availability.push({
          id: uuidv4(),
          staffId: staffId,
          dayOfWeek: day,
          timeSlot: `${hour}:00-${hour}:30`,
          isAvailable: day !== 0 && day !== 6, // Unavailable on weekends
          startTime: `${hour}:00`,
          endTime: `${hour}:30`
        });
        
        availability.push({
          id: uuidv4(),
          staffId: staffId,
          dayOfWeek: day,
          timeSlot: `${hour}:30-${hour+1}:00`,
          isAvailable: day !== 0 && day !== 6, // Unavailable on weekends
          startTime: `${hour}:30`,
          endTime: `${hour+1}:00`
        });
      }
    });
    
    return availability;
  } catch (error) {
    console.error('Error fetching weekly availability:', error);
    return [];
  }
}

// Update weekly availability in batch
export async function batchUpdateWeeklyAvailability(
  availabilitySlots: StaffAvailabilitySlot[]
): Promise<boolean> {
  try {
    // In a real app, this would update the database
    console.log('Updating availability slots:', availabilitySlots);
    return true;
  } catch (error) {
    console.error('Error updating availability slots:', error);
    return false;
  }
}

// Calculate availability summary for a staff member
export async function getAvailabilitySummary(staffId: string): Promise<AvailabilitySummary> {
  try {
    const availability = await getWeeklyAvailabilityByStaff(staffId);
    
    // Group by day of week
    const dayGroups: Record<number, StaffAvailabilitySlot[]> = {};
    for (const slot of availability) {
      if (!dayGroups[slot.dayOfWeek]) {
        dayGroups[slot.dayOfWeek] = [];
      }
      dayGroups[slot.dayOfWeek].push(slot);
    }
    
    // Calculate hours by day
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dailyBreakdown: Record<string, number> = {};
    let totalWeeklyHours = 0;
    
    for (let i = 0; i < 7; i++) {
      const daySlots = dayGroups[i] || [];
      const availableSlots = daySlots.filter(slot => slot.isAvailable);
      const dayHours = availableSlots.length * 0.5; // Each slot is 30 minutes
      
      dailyBreakdown[dayNames[i]] = dayHours;
      totalWeeklyHours += dayHours;
    }
    
    // Calculate utilization (assuming 40-hour work week is 100%)
    const utilizationPercentage = (totalWeeklyHours / 40) * 100;
    
    return {
      totalWeeklyHours,
      dailyBreakdown,
      utilizationPercentage,
      dailySummaries: dailyBreakdown
    };
  } catch (error) {
    console.error('Error calculating availability summary:', error);
    return {
      totalWeeklyHours: 0,
      dailyBreakdown: {},
      utilizationPercentage: 0,
      dailySummaries: {}
    };
  }
}

// Alias for getAvailabilitySummary for backward compatibility
export const calculateAvailabilitySummary = getAvailabilitySummary;

function getMockStaff(): StaffMember[] {
  return [
    {
      id: '1',
      fullName: 'John Smith',
      roleTitle: 'Senior Accountant',
      email: 'john.smith@example.com',
      phone: '555-123-4567',
      skills: ['Tax', 'Advisory'],
      costPerHour: 120,
      status: 'Active',
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date('2023-03-10')
    },
    {
      id: '2',
      fullName: 'Jane Doe',
      roleTitle: 'Tax Specialist',
      email: 'jane.doe@example.com',
      phone: '555-987-6543',
      skills: ['Tax', 'Compliance'],
      costPerHour: 110,
      status: 'Active',
      createdAt: new Date('2023-02-10'),
      updatedAt: new Date('2023-02-10')
    },
    {
      id: '3',
      fullName: 'Robert Johnson',
      roleTitle: 'Bookkeeper',
      email: 'robert.johnson@example.com',
      phone: '555-456-7890',
      skills: ['Bookkeeping'],
      costPerHour: 75,
      status: 'Active',
      createdAt: new Date('2022-11-05'),
      updatedAt: new Date('2023-01-20')
    },
    {
      id: '4',
      fullName: 'Sarah Williams',
      roleTitle: 'Audit Manager',
      email: 'sarah.williams@example.com',
      phone: '555-234-5678',
      skills: ['Audit', 'Compliance'],
      costPerHour: 130,
      status: 'Active',
      createdAt: new Date('2022-10-12'),
      updatedAt: new Date('2023-03-05')
    },
    {
      id: '5',
      fullName: 'Michael Brown',
      roleTitle: 'Junior Accountant',
      email: 'michael.brown@example.com',
      phone: '555-876-5432',
      skills: ['Bookkeeping', 'Tax'],
      costPerHour: 65,
      status: 'On Leave',
      createdAt: new Date('2023-03-01'),
      updatedAt: new Date('2023-04-10')
    }
  ];
}
