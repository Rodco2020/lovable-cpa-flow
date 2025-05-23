
import { v4 as uuidv4 } from "uuid";
import { TimeSlot } from "@/types/staff";

/**
 * Time Slot Management Functions
 * These functions handle staff time slots for scheduling
 */

/**
 * Generate mock time slots for development/testing
 * @param date The date to generate slots for
 * @returns An array of time slots
 */
const generateMockTimeSlots = (date: string): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const startHour = 8; // 8 AM
  const endHour = 17; // 5 PM

  // Instead of using mockStaff, we use fixed IDs for the mock data
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

/**
 * Get all time slots for a specified date
 * @param date The date to fetch slots for
 * @returns Promise resolving to an array of time slots
 */
export const getTimeSlotsByDate = async (date: string): Promise<TimeSlot[]> => {
  console.log(`Fetching time slots for date: ${date}`);
  // Since staff_timeslots table doesn't exist yet, return mock data
  return generateMockTimeSlots(date);
};

/**
 * Get time slots for a specific staff member on a specified date
 * @param staffId The UUID of the staff member
 * @param date The date to fetch slots for
 * @returns Promise resolving to an array of time slots
 */
export const getTimeSlotsByStaffAndDate = async (staffId: string, date: string): Promise<TimeSlot[]> => {
  console.log(`Fetching time slots for staff ${staffId} on date: ${date}`);
  // Since staff_timeslots table doesn't exist yet, return mock data filtered by staffId
  return generateMockTimeSlots(date).filter(slot => slot.staffId === staffId);
};

/**
 * Generate empty time slots for a day (helper function)
 * @param staffId The UUID of the staff member
 * @param date The date to generate slots for
 * @returns An array of empty time slots
 */
export const generateEmptyTimeSlots = (staffId: string, date: string): TimeSlot[] => {
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

/**
 * Update a time slot
 * @param id The UUID of the time slot to update
 * @param data The partial time slot data to update
 * @returns Promise resolving to the updated time slot or undefined if not found
 */
export const updateTimeSlot = async (
  id: string, 
  data: Partial<Omit<TimeSlot, "id" | "staffId" | "date">>
): Promise<TimeSlot | undefined> => {
  // Since staff_timeslots table doesn't exist yet, we can't update in the database
  console.log("Mock updating time slot:", id, data);
  return undefined;
};
