import { v4 as uuidv4 } from 'uuid';
import { StaffMember, StaffAvailability, AvailabilitySummary, WeeklyAvailability, DailyAvailability, TimeSlot } from '@/types/staff';
import { SkillType } from '@/types/task';
import { supabase } from '@/lib/supabaseClient';
import { addDays, format, addMinutes } from 'date-fns';

// Get all staff members
export const getAllStaffMembers = async (): Promise<StaffMember[]> => {
  try {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('status', 'Active')
      .order('full_name');
      
    if (error) throw error;
    
    return data.map(staff => ({
      id: staff.id,
      fullName: staff.full_name,
      roleTitle: staff.role_title,
      email: staff.email,
      phone: staff.phone,
      skills: staff.assigned_skills,
      costPerHour: staff.cost_per_hour,
      status: staff.status,
      createdAt: new Date(staff.created_at),
      updatedAt: new Date(staff.updated_at)
    }));
  } catch (error) {
    console.error('Error fetching staff members:', error);
    return [];
  }
};

// Get staff member by ID
export const getStaffMember = async (id: string): Promise<StaffMember | null> => {
  try {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    if (!data) return null;
    
    return {
      id: data.id,
      fullName: data.full_name,
      roleTitle: data.role_title,
      email: data.email,
      phone: data.phone,
      skills: data.assigned_skills,
      costPerHour: data.cost_per_hour,
      status: data.status,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Error fetching staff member:', error);
    return null;
  }
};

// Create staff member
export const createStaffMember = async (staff: Omit<StaffMember, "id" | "createdAt" | "updatedAt">): Promise<StaffMember | null> => {
  try {
    const { data, error } = await supabase
      .from('staff')
      .insert([
        {
          full_name: staff.fullName,
          role_title: staff.roleTitle,
          email: staff.email,
          phone: staff.phone,
          assigned_skills: staff.skills,
          cost_per_hour: staff.costPerHour,
          status: staff.status
        }
      ])
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      id: data.id,
      fullName: data.full_name,
      roleTitle: data.role_title,
      email: data.email,
      phone: data.phone,
      skills: data.assigned_skills,
      costPerHour: data.cost_per_hour,
      status: data.status,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Error creating staff member:', error);
    return null;
  }
};

// Update staff member
export const updateStaffMember = async (id: string, updates: Partial<Omit<StaffMember, "id" | "createdAt" | "updatedAt">>): Promise<StaffMember | null> => {
  try {
    const updateData: Record<string, any> = {};
    
    if (updates.fullName !== undefined) updateData.full_name = updates.fullName;
    if (updates.roleTitle !== undefined) updateData.role_title = updates.roleTitle;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.skills !== undefined) updateData.assigned_skills = updates.skills;
    if (updates.costPerHour !== undefined) updateData.cost_per_hour = updates.costPerHour;
    if (updates.status !== undefined) updateData.status = updates.status;
    
    const { data, error } = await supabase
      .from('staff')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      id: data.id,
      fullName: data.full_name,
      roleTitle: data.role_title,
      email: data.email,
      phone: data.phone,
      skills: data.assigned_skills,
      costPerHour: data.cost_per_hour,
      status: data.status,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Error updating staff member:', error);
    return null;
  }
};

// Delete staff member
export const deleteStaffMember = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('staff')
      .update({ status: 'Inactive' })
      .eq('id', id);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting staff member:', error);
    return false;
  }
};

// Get staff availability
export const getStaffAvailability = async (staffId: string): Promise<WeeklyAvailability[]> => {
  try {
    // Convert StaffAvailabilitySlot[] to WeeklyAvailability[]
    const now = new Date();
    const startDate = now;
    const endDate = addDays(now, 7);
    
    // Create daily slots from 9am to 5pm
    const createDailySlots = (date: Date): TimeSlot[] => {
      const slots: TimeSlot[] = [];
      const dayStart = new Date(date);
      dayStart.setHours(9, 0, 0, 0);
      
      for (let i = 0; i < 16; i++) { // 30-minute slots for 8 hours
        const slotStart = addMinutes(dayStart, i * 30);
        const slotEnd = addMinutes(slotStart, 30);
        
        slots.push({
          id: uuidv4(),
          staffId,
          startTime: slotStart,
          endTime: slotEnd,
          isAvailable: Math.random() > 0.2 // 80% chance of being available
        });
      }
      
      return slots;
    };
    
    // Create daily availability for each day
    const dailyAvailabilities: DailyAvailability[] = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const slots = createDailySlots(currentDate);
      dailyAvailabilities.push({
        date: new Date(currentDate),
        slots,
        totalHours: slots.filter(s => s.isAvailable).length * 0.5 // 30 minutes = 0.5 hours
      });
      
      currentDate = addDays(currentDate, 1);
    }
    
    // Create weekly availability
    return [{
      startDate,
      endDate,
      days: dailyAvailabilities,
      totalHours: dailyAvailabilities.reduce((sum, day) => sum + day.totalHours, 0)
    }];
  } catch (error) {
    console.error('Error fetching staff availability:', error);
    return [];
  }
};

// Get availability summary
export const getAvailabilitySummary = async (staffId: string): Promise<AvailabilitySummary> => {
  try {
    const availability = await getStaffAvailability(staffId);
    
    // Calculate total weekly hours
    const totalWeeklyHours = availability[0].totalHours;
    
    // Create daily breakdown
    const dailyBreakdown: { [day: string]: number } = {};
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    availability[0].days.forEach(day => {
      const dayName = dayNames[day.date.getDay()];
      dailyBreakdown[dayName] = day.totalHours;
    });
    
    return {
      totalWeeklyHours,
      dailyBreakdown,
      utilizationPercentage: (totalWeeklyHours / 40) * 100 // 40 hours per week is full utilization
    };
  } catch (error) {
    console.error('Error calculating availability summary:', error);
    return {
      totalWeeklyHours: 0,
      dailyBreakdown: {},
      utilizationPercentage: 0
    };
  }
};

// Save staff availability matrix
export const saveStaffAvailabilityMatrix = async (
  staffId: string,
  availabilityData: {
    dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }[]
): Promise<boolean> => {
  try {
    // Convert to correct format for database
    const availabilityRecords = availabilityData.map(slot => ({
      staff_id: staffId,
      day_of_week: slot.dayOfWeek,
      time_slot: `${slot.startTime}-${slot.endTime}`,
      is_available: slot.isAvailable
    }));
    
    // Delete existing records
    await supabase
      .from('staff_availability')
      .delete()
      .eq('staff_id', staffId);
    
    // Insert new records
    const { error } = await supabase
      .from('staff_availability')
      .insert(availabilityRecords);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error saving staff availability matrix:', error);
    return false;
  }
};

// Get all available staff for skills
export const getAvailableStaffForSkills = async (
  skills: SkillType[],
  startTime: Date,
  endTime: Date
): Promise<StaffMember[]> => {
  try {
    // This would query for staff with matching skills and check availability
    // For now, return mock data
    
    // Get all staff with the required skills
    const allStaff = await getAllStaffMembers();
    const matchingStaff = allStaff.filter(staff => 
      staff.skills.some(skill => skills.includes(skill))
    );
    
    // Filter to those available at the required time
    // For this mock, just return a random subset
    return matchingStaff.filter(() => Math.random() > 0.3);
  } catch (error) {
    console.error('Error finding available staff:', error);
    return [];
  }
};

// Mock data
export const mockStaffList: StaffMember[] = [
  {
    id: '1',
    fullName: 'John Smith',
    roleTitle: 'Senior Tax Accountant',
    email: 'john.smith@example.com',
    phone: '555-123-4567',
    skills: ['Tax', 'Advisory'],
    costPerHour: 85,
    status: 'Active',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-05-22')
  },
  {
    id: '2',
    fullName: 'Alice Johnson',
    roleTitle: 'Audit Manager',
    email: 'alice.johnson@example.com',
    phone: '555-987-6543',
    skills: ['Audit'],
    costPerHour: 95,
    status: 'Active',
    createdAt: new Date('2022-11-01'),
    updatedAt: new Date('2023-06-10')
  },
  {
    id: '3',
    fullName: 'Bob Williams',
    roleTitle: 'Bookkeeping Specialist',
    email: 'bob.williams@example.com',
    phone: '555-246-8012',
    skills: ['Bookkeeping'],
    costPerHour: 65,
    status: 'Active',
    createdAt: new Date('2023-03-01'),
    updatedAt: new Date('2023-07-01')
  },
  {
    id: '4',
    fullName: 'Emily Davis',
    roleTitle: 'Tax Associate',
    email: 'emily.davis@example.com',
    phone: '555-789-3456',
    skills: ['Tax'],
    costPerHour: 75,
    status: 'Active',
    createdAt: new Date('2023-04-10'),
    updatedAt: new Date('2023-08-15')
  },
  {
    id: '5',
    fullName: 'Charlie Brown',
    roleTitle: 'Financial Advisor',
    email: 'charlie.brown@example.com',
    phone: '555-456-7890',
    skills: ['Advisory'],
    costPerHour: 110,
    status: 'Active',
    createdAt: new Date('2022-09-20'),
    updatedAt: new Date('2023-09-01')
  }
];
