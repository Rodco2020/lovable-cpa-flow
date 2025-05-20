import { v4 as uuidv4 } from "uuid";
import { Staff, TimeSlot, WeeklyAvailability, AvailabilitySummary } from "@/types/staff";
import { supabase } from "@/integrations/supabase/client";
import { normalizeSkills } from "./skillNormalizationService";
import { SkillType } from "@/types/task";

// Staff CRUD operations
export const getAllStaff = async (): Promise<Staff[]> => {
  try {
    console.log("Fetching all staff members");
    const { data, error } = await supabase
      .from('staff')
      .select('*');
    
    if (error) {
      console.error("Error fetching staff:", error);
      throw error;
    }
    
    if (!data) {
      console.warn("No staff data returned from database");
      return [];
    }
    
    console.log(`Debug - Raw staff data from database: ${data.length} staff members found`);
    
    // Map the database fields to our Staff model
    return data.map(item => ({
      id: item.id,
      fullName: item.full_name,
      roleTitle: item.role_title || "",
      skills: item.assigned_skills || [],
      costPerHour: item.cost_per_hour,
      email: item.email,
      phone: item.phone || "",
      status: (item.status === "active" ? "active" : "inactive") as Staff["status"],
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
  } catch (err) {
    console.error("Failed to fetch staff data:", err);
    throw new Error(`Database connection error: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
};

export const getStaffById = async (id: string): Promise<Staff | undefined> => {
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') { // No rows returned
      return undefined;
    }
    console.error("Error fetching staff by ID:", error);
    throw error;
  }
  
  return {
    id: data.id,
    fullName: data.full_name,
    roleTitle: data.role_title || "",
    skills: data.assigned_skills || [],
    costPerHour: data.cost_per_hour,
    email: data.email,
    phone: data.phone || "",
    status: (data.status === "active" ? "active" : "inactive") as Staff["status"],
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

export const createStaff = async (staffData: Omit<Staff, "id" | "createdAt" | "updatedAt">): Promise<Staff> => {
  const { data, error } = await supabase
    .from('staff')
    .insert({
      full_name: staffData.fullName,
      role_title: staffData.roleTitle,
      assigned_skills: staffData.skills,
      cost_per_hour: staffData.costPerHour,
      email: staffData.email,
      phone: staffData.phone,
      status: staffData.status
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error creating staff:", error);
    throw error;
  }
  
  return {
    id: data.id,
    fullName: data.full_name,
    roleTitle: data.role_title || "",
    skills: data.assigned_skills || [],
    costPerHour: data.cost_per_hour,
    email: data.email,
    phone: data.phone || "",
    status: (data.status === "active" ? "active" : "inactive") as Staff["status"],
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

export const updateStaff = async (id: string, staffData: Partial<Omit<Staff, "id" | "createdAt">>): Promise<Staff | undefined> => {
  // Map the Staff model fields to database fields
  const dbData: any = {};
  
  if (staffData.fullName !== undefined) dbData.full_name = staffData.fullName;
  if (staffData.roleTitle !== undefined) dbData.role_title = staffData.roleTitle;
  if (staffData.skills !== undefined) dbData.assigned_skills = staffData.skills;
  if (staffData.costPerHour !== undefined) dbData.cost_per_hour = staffData.costPerHour;
  if (staffData.email !== undefined) dbData.email = staffData.email;
  if (staffData.phone !== undefined) dbData.phone = staffData.phone;
  if (staffData.status !== undefined) dbData.status = staffData.status;
  
  const { data, error } = await supabase
    .from('staff')
    .update(dbData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating staff:", error);
    throw error;
  }
  
  return {
    id: data.id,
    fullName: data.full_name,
    roleTitle: data.role_title || "",
    skills: data.assigned_skills || [],
    costPerHour: data.cost_per_hour,
    email: data.email,
    phone: data.phone || "",
    status: (data.status === "active" ? "active" : "inactive") as Staff["status"],
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

export const deleteStaff = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('staff')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error("Error deleting staff:", error);
    throw error;
  }
  
  return true;
};

// TimeSlot operations using mock data instead of Supabase
// since the staff_timeslots table doesn't exist yet in the schema

// Mock timeslots for the current day
const generateMockTimeSlots = (date: string): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const startHour = 8; // 8 AM
  const endHour = 17; // 5 PM

  // Instead of using mockStaff, let's fetch the actual staff list
  // This is just a placeholder for now - we'll use fixed IDs for the mock data
  const mockStaffIds = [
    'b1e3c5a7-9d2f-4e8b-87c6-5a3f9e0d1b2c', 
    'd4f6a8c0-e2b4-6d8f-0a2c-4e6f8a0c2e4d'
  ];

  mockStaffIds.forEach(staffId => {
    for (let hour = startHour; hour < endHour; hour++) {
      // Create two 30-minute slots per hour
      for (let minutes of [0, 30]) {
        slots.push({
          id: uuidv4(),
          staffId: staffId,
          date,
          startTime: `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
          endTime: minutes === 0 
            ? `${hour.toString().padStart(2, '0')}:30` 
            : `${(hour + 1).toString().padStart(2, '0')}:00`,
          isAvailable: Math.random() > 0.3, // 70% chance of being available
        });
      }
    }
  });

  return slots;
};

// TimeSlot operations
export const getTimeSlotsByDate = async (date: string): Promise<TimeSlot[]> => {
  console.log(`Fetching time slots for date: ${date}`);
  // Since staff_timeslots table doesn't exist yet, return mock data
  return generateMockTimeSlots(date);
};

export const getTimeSlotsByStaffAndDate = async (staffId: string, date: string): Promise<TimeSlot[]> => {
  console.log(`Fetching time slots for staff ${staffId} on date: ${date}`);
  // Since staff_timeslots table doesn't exist yet, return mock data filtered by staffId
  return generateMockTimeSlots(date).filter(slot => slot.staffId === staffId);
};

// Helper function to generate empty time slots for a day
const generateEmptyTimeSlots = (staffId: string, date: string): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const startHour = 8; // 8 AM
  const endHour = 17; // 5 PM
  
  for (let hour = startHour; hour < endHour; hour++) {
    // Create two 30-minute slots per hour
    for (let minutes of [0, 30]) {
      slots.push({
        id: uuidv4(),
        staffId: staffId,
        date,
        startTime: `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
        endTime: minutes === 0 
          ? `${hour.toString().padStart(2, '0')}:30` 
          : `${(hour + 1).toString().padStart(2, '0')}:00`,
        isAvailable: true, // Default to available
      });
    }
  }
  
  return slots;
};

export const updateTimeSlot = async (
  id: string, 
  data: Partial<Omit<TimeSlot, "id" | "staffId" | "date">>
): Promise<TimeSlot | undefined> => {
  // Since staff_timeslots table doesn't exist yet, we can't update in the database
  console.log("Mock updating time slot:", id, data);
  return undefined;
};

// Weekly availability operations with improved error handling
export const getWeeklyAvailabilityByStaff = async (staffId: string): Promise<WeeklyAvailability[]> => {
  try {
    console.log(`Fetching availability for staff ${staffId}`);
    
    // First check if the connection is available
    try {
      const { error: pingError } = await supabase.from('staff_availability').select('count').limit(1);
      if (pingError) {
        console.error("Database connection error during ping:", pingError);
        throw new Error(`Database connection error: ${pingError.message}`);
      }
    } catch (pingErr) {
      console.error("Failed to connect to Supabase:", pingErr);
      throw new Error('Cannot connect to database. Please check your connection and try again.');
    }
    
    // Now fetch the actual data
    const { data, error } = await supabase
      .from('staff_availability')
      .select('*')
      .eq('staff_id', staffId);
    
    if (error) {
      console.error(`Error fetching staff availability for ${staffId}:`, error);
      throw error;
    }
    
    // If no data is found, return empty array
    if (!data || data.length === 0) {
      console.log(`No availability data found for staff ${staffId}`);
      return [];
    }
    
    console.log(`Found ${data.length} availability records for staff ${staffId}`);
    
    // Map the database records to our WeeklyAvailability model
    return data.map(item => {
      // Parse time_slot format which might be "09:00-12:00" to get start and end times
      const [startTime, endTime] = item.time_slot.split('-');
      
      return {
        staffId: item.staff_id,
        dayOfWeek: item.day_of_week as 0 | 1 | 2 | 3 | 4 | 5 | 6,
        startTime: startTime,
        endTime: endTime,
        isAvailable: item.is_available,
      };
    });
  } catch (err) {
    console.error(`Failed to fetch availability for staff ${staffId}:`, err);
    // This is where errors from both the ping and the data fetch will be caught
    // Rethrow with a more specific message
    if (err instanceof Error && err.message.includes('connection')) {
      throw err; // Already formatted connection error
    } else {
      throw new Error(`Failed to fetch availability data: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }
};

export const updateWeeklyAvailability = async (
  staffId: string,
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6,
  availabilities: Omit<WeeklyAvailability, "staffId" | "dayOfWeek">[]
): Promise<WeeklyAvailability[]> => {
  // First, get existing availabilities for this staff and day
  const { data: existingData, error: fetchError } = await supabase
    .from('staff_availability')
    .select('id')
    .eq('staff_id', staffId)
    .eq('day_of_week', dayOfWeek);
  
  if (fetchError) {
    console.error("Error fetching existing staff availability:", fetchError);
    throw fetchError;
  }
  
  // Delete existing records for this staff and day
  if (existingData && existingData.length > 0) {
    const { error: deleteError } = await supabase
      .from('staff_availability')
      .delete()
      .eq('staff_id', staffId)
      .eq('day_of_week', dayOfWeek);
    
    if (deleteError) {
      console.error("Error deleting existing staff availability:", deleteError);
      throw deleteError;
    }
  }
  
  // Prepare records for insertion
  const recordsToInsert = availabilities.map(avail => ({
    staff_id: staffId,
    day_of_week: dayOfWeek,
    time_slot: `${avail.startTime}-${avail.endTime}`,
    is_available: avail.isAvailable,
  }));
  
  // Insert new availability records
  const { data: insertedData, error: insertError } = await supabase
    .from('staff_availability')
    .insert(recordsToInsert)
    .select();
  
  if (insertError) {
    console.error("Error inserting staff availability:", insertError);
    throw insertError;
  }
  
  // Return the newly created availability records
  return insertedData.map(item => ({
    staffId: item.staff_id,
    dayOfWeek: item.day_of_week as 0 | 1 | 2 | 3 | 4 | 5 | 6,
    startTime: item.time_slot.split('-')[0],
    endTime: item.time_slot.split('-')[1],
    isAvailable: item.is_available,
  }));
};

// New batch operations for availability with improved error handling
export const batchUpdateWeeklyAvailability = async (
  staffId: string,
  availabilities: WeeklyAvailability[]
): Promise<WeeklyAvailability[]> => {
  try {
    // Group availabilities by day of week
    const availabilitiesByDay = availabilities.reduce<Record<string, Omit<WeeklyAvailability, "staffId" | "dayOfWeek">[]>>(
      (acc, avail) => {
        const day = avail.dayOfWeek.toString();
        if (!acc[day]) {
          acc[day] = [];
        }
        acc[day].push({
          startTime: avail.startTime,
          endTime: avail.endTime,
          isAvailable: avail.isAvailable,
        });
        return acc;
      },
      {}
    );
    
    // Update each day's availabilities
    const results: WeeklyAvailability[] = [];
    for (const [day, dayAvailabilities] of Object.entries(availabilitiesByDay)) {
      const dayOfWeek = parseInt(day) as 0 | 1 | 2 | 3 | 4 | 5 | 6;
      const updatedAvailabilities = await updateWeeklyAvailability(
        staffId,
        dayOfWeek,
        dayAvailabilities
      );
      results.push(...updatedAvailabilities);
    }
    
    return results;
  } catch (err) {
    console.error(`Failed to batch update availability for staff ${staffId}:`, err);
    throw new Error(`Failed to update availability data: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
};

// Calculate availability summary with improved error handling
export const calculateAvailabilitySummary = async (
  staffId: string
): Promise<AvailabilitySummary> => {
  try {
    const availabilities = await getWeeklyAvailabilityByStaff(staffId);
    
    // Calculate hours for each time slot and group by day
    const dailySummaries = Array.from({ length: 7 }, (_, i) => ({ 
      day: i, 
      totalHours: 0,
      slots: [] as { startTime: string; endTime: string }[] 
    }));
    
    // Distribution by time of day
    const distribution: { [key: string]: number } = {
      morning: 0,   // 6:00 AM - 12:00 PM
      afternoon: 0, // 12:00 PM - 5:00 PM
      evening: 0    // 5:00 PM - 10:00 PM
    };
    
    for (const avail of availabilities) {
      if (avail.isAvailable) {
        // Calculate hours in this time slot
        const startParts = avail.startTime.split(':').map(Number);
        const endParts = avail.endTime.split(':').map(Number);
        
        const startHours = startParts[0] + startParts[1] / 60;
        const endHours = endParts[0] + endParts[1] / 60;
        
        const hours = endHours - startHours;
        dailySummaries[avail.dayOfWeek].totalHours += hours;
        
        // Track detailed slot information
        dailySummaries[avail.dayOfWeek].slots.push({
          startTime: avail.startTime,
          endTime: avail.endTime
        });
        
        // Calculate distribution by time of day
        // This is a simplified algorithm - in reality we'd need to split slots that cross boundaries
        if (startHours >= 6 && startHours < 12) {
          distribution.morning += hours;
        } else if (startHours >= 12 && startHours < 17) {
          distribution.afternoon += hours;
        } else if (startHours >= 17 && startHours < 22) {
          distribution.evening += hours;
        }
      }
    }
    
    // Calculate weekly total
    const weeklyTotal = dailySummaries.reduce((sum, day) => sum + day.totalHours, 0);
    
    // Calculate average daily hours (only counting days with any availability)
    const daysWithAvailability = dailySummaries.filter(day => day.totalHours > 0).length;
    const averageDailyHours = daysWithAvailability > 0 
      ? weeklyTotal / daysWithAvailability 
      : 0;
    
    // Find peak day (day with most hours)
    const peakDay = dailySummaries.reduce((peak, day) => {
      return day.totalHours > (peak?.hours || 0) 
        ? { day: day.day, hours: day.totalHours } 
        : peak;
    }, null as { day: number; hours: number } | null);
    
    return {
      dailySummaries,
      weeklyTotal,
      averageDailyHours,
      peakDay,
      distribution,
    };
  } catch (err) {
    console.error(`Failed to calculate availability summary for staff ${staffId}:`, err);
    throw new Error(`Failed to calculate availability summary: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
};

// Enhanced function to ensure staff have availability templates
export const ensureStaffHasAvailability = async (staffId: string) => {
  // First, check if staff member already has availability templates
  const existingAvailability = await getWeeklyAvailabilityByStaff(staffId);
  
  // If availability exists, return it
  if (existingAvailability && existingAvailability.length > 0) {
    console.log(`Staff ${staffId} already has ${existingAvailability.length} availability entries`);
    return existingAvailability;
  }
  
  console.log(`Creating default availability template for staff ${staffId}`);
  
  // Create default availability for weekdays (9am-5pm, Monday-Friday)
  const defaultAvailability: WeeklyAvailability[] = [];
  
  // For each weekday (1-5 = Monday-Friday)
  for (let day = 1; day <= 5; day++) {
    defaultAvailability.push({
      staffId,
      dayOfWeek: day as 0 | 1 | 2 | 3 | 4 | 5 | 6,
      startTime: "09:00",
      endTime: "17:00",
      isAvailable: true
    });
  }
  
  // Save the default availability to the database
  try {
    const result = await batchUpdateWeeklyAvailability(staffId, defaultAvailability);
    console.log(`Created ${result.length} default availability entries for staff ${staffId}`);
    return result;
  } catch (error) {
    console.error(`Failed to create default availability for staff ${staffId}:`, error);
    
    // Return the default availability even if saving failed
    // This ensures capacity calculation can proceed
    return defaultAvailability;
  }
};

// Function to standardize skill mapping for staff members
export const mapStaffSkillsToForecastSkills = async (staffId: string) => {
  const staff = await getStaffById(staffId);
  
  if (!staff) {
    console.error(`Staff member ${staffId} not found`);
    return [];
  }
  
  // Use the centralized skill normalization service with staff ID overrides
  return normalizeSkills(staff.skills, staff.id) as SkillType[];
};
