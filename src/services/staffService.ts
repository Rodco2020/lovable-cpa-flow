
import { v4 as uuidv4 } from "uuid";
import { Staff, TimeSlot, WeeklyAvailability } from "@/types/staff";

// Mock data for development
const mockStaff: Staff[] = [
  {
    id: "staff-1",
    fullName: "John Doe",
    roleTitle: "Senior Accountant",
    skills: ["skill-1", "skill-3"],
    costPerHour: 75,
    email: "john.doe@example.com",
    phone: "(555) 123-4567",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "staff-2",
    fullName: "Jane Smith",
    roleTitle: "Tax Specialist",
    skills: ["skill-2", "skill-4"],
    costPerHour: 85,
    email: "jane.smith@example.com",
    phone: "(555) 987-6543",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

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

// Staff CRUD operations
export const getAllStaff = async (): Promise<Staff[]> => {
  return Promise.resolve([...mockStaff]);
};

export const getStaffById = async (id: string): Promise<Staff | undefined> => {
  return Promise.resolve(mockStaff.find(staff => staff.id === id));
};

export const createStaff = async (staffData: Omit<Staff, "id" | "createdAt" | "updatedAt">): Promise<Staff> => {
  const newStaff: Staff = {
    id: uuidv4(),
    ...staffData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  mockStaff.push(newStaff);
  return Promise.resolve(newStaff);
};

export const updateStaff = async (id: string, staffData: Partial<Omit<Staff, "id" | "createdAt">>): Promise<Staff | undefined> => {
  const index = mockStaff.findIndex(staff => staff.id === id);
  
  if (index === -1) {
    return Promise.resolve(undefined);
  }
  
  mockStaff[index] = {
    ...mockStaff[index],
    ...staffData,
    updatedAt: new Date().toISOString(),
  };
  
  return Promise.resolve(mockStaff[index]);
};

export const deleteStaff = async (id: string): Promise<boolean> => {
  const index = mockStaff.findIndex(staff => staff.id === id);
  
  if (index === -1) {
    return Promise.resolve(false);
  }
  
  mockStaff.splice(index, 1);
  return Promise.resolve(true);
};

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
