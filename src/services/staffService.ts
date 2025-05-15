import { v4 as uuidv4 } from "uuid";
import { Staff, TimeSlot, WeeklyAvailability } from "@/types/staff";
import { supabase } from "@/integrations/supabase/client";

// Staff CRUD operations
export const getAllStaff = async (): Promise<Staff[]> => {
  const { data, error } = await supabase
    .from('staff')
    .select('*');
  
  if (error) {
    console.error("Error fetching staff:", error);
    throw error;
  }
  
  // Map the database fields to our Staff model
  return data.map(item => ({
    id: item.id,
    fullName: item.full_name,
    roleTitle: item.role_title || "",
    skills: item.assigned_skills || [],
    costPerHour: item.cost_per_hour,
    email: item.email,
    phone: item.phone || "",
    status: item.status,
    createdAt: item.created_at,
    updatedAt: item.updated_at
  }));
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
    status: data.status,
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
    status: data.status,
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
    status: data.status,
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

// For now, we'll keep the mock implementations for TimeSlot operations,
// but we can implement them with Supabase in a future update

// Mock timeslots for the current day
const generateMockTimeSlots = (date: string): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const startHour = 8; // 8 AM
  const endHour = 17; // 5 PM

  mockStaff.forEach(staff => {
    for (let hour = startHour; hour < endHour; hour++) {
      // Create two 30-minute slots per hour
      for (let minutes of [0, 30]) {
        slots.push({
          id: uuidv4(),
          staffId: staff.id,
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

// Mock weekly availability
const mockWeeklyAvailability: WeeklyAvailability[] = mockStaff.flatMap(staff => {
  return [1, 2, 3, 4, 5].flatMap(day => { // Monday to Friday
    return [
      {
        staffId: staff.id,
        dayOfWeek: day as 0 | 1 | 2 | 3 | 4 | 5 | 6,
        startTime: "09:00",
        endTime: "12:00",
        isAvailable: true,
      },
      {
        staffId: staff.id,
        dayOfWeek: day as 0 | 1 | 2 | 3 | 4 | 5 | 6,
        startTime: "13:00",
        endTime: "17:00",
        isAvailable: true,
      }
    ];
  });
});

// TimeSlot operations
export const getTimeSlotsByDate = async (date: string): Promise<TimeSlot[]> => {
  return Promise.resolve(generateMockTimeSlots(date));
};

export const getTimeSlotsByStaffAndDate = async (staffId: string, date: string): Promise<TimeSlot[]> => {
  const allSlots = await getTimeSlotsByDate(date);
  return allSlots.filter(slot => slot.staffId === staffId);
};

export const updateTimeSlot = async (
  id: string, 
  data: Partial<Omit<TimeSlot, "id" | "staffId" | "date">>
): Promise<TimeSlot | undefined> => {
  // In a real app, this would update the database
  // For this mock service, we'll just return a modified slot
  const slots = await getTimeSlotsByDate(new Date().toISOString().split('T')[0]);
  const slotIndex = slots.findIndex(slot => slot.id === id);
  
  if (slotIndex === -1) {
    return Promise.resolve(undefined);
  }
  
  const updatedSlot = {
    ...slots[slotIndex],
    ...data,
  };
  
  return Promise.resolve(updatedSlot);
};

// Weekly availability operations
export const getWeeklyAvailabilityByStaff = async (staffId: string): Promise<WeeklyAvailability[]> => {
  return Promise.resolve(mockWeeklyAvailability.filter(avail => avail.staffId === staffId));
};

export const updateWeeklyAvailability = async (
  staffId: string,
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6,
  availabilities: Omit<WeeklyAvailability, "staffId" | "dayOfWeek">[]
): Promise<WeeklyAvailability[]> => {
  // In a real app, this would update the database
  // For this mock service, we'll just return the new availabilities
  const newAvailabilities = availabilities.map(avail => ({
    staffId,
    dayOfWeek,
    ...avail,
  }));
  
  return Promise.resolve(newAvailabilities);
};
