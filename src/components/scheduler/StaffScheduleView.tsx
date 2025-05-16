
import React, { useEffect, useState } from "react";
import { getAllStaff } from "@/services/staffService";
import { TaskInstance } from "@/types/task";
import { Staff, TimeSlot } from "@/types/staff";
import { getTimeSlotsByDate } from "@/services/staffService";
import { format } from "date-fns";
import StaffScheduleCard from "./StaffScheduleCard";
import { scheduleTask } from "@/services/schedulerService";
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader } from "lucide-react";
import { generateAvailabilityMasks, AvailabilityMask } from "@/services/integrations/schedulerIntegration";
import { useEventPublisher } from "@/hooks/useAppEvent";
import { Button } from "@/components/ui/button";

interface StaffScheduleViewProps {
  selectedTask: TaskInstance | null;
  currentDate?: Date;
}

const StaffScheduleView: React.FC<StaffScheduleViewProps> = ({ 
  selectedTask,
  currentDate = new Date()
}) => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [timeSlots, setTimeSlots] = useState<Record<string, TimeSlot[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availabilityMasks, setAvailabilityMasks] = useState<Record<string, AvailabilityMask>>({});
  const { publishEvent } = useEventPublisher();
  
  // Format date for API calls
  const formattedDate = format(currentDate, "yyyy-MM-dd");
  
  // Load staff and their time slots
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all staff
      const staffList = await getAllStaff();
      const activeStaff = staffList.filter(s => s.status === "active");
      setStaff(activeStaff);
      
      if (activeStaff.length === 0) {
        setError("No active staff members found.");
        setLoading(false);
        return;
      }
      
      // Load time slots for each staff member
      const slots: Record<string, TimeSlot[]> = {};
      const masks: Record<string, AvailabilityMask> = {};
      
      for (const s of activeStaff) {
        try {
          // Get time slots from the service
          const staffSlots = await getTimeSlotsByDate(formattedDate);
          slots[s.id] = staffSlots.filter(slot => slot.staffId === s.id);
          
          // Get availability mask from integration service
          const availMasks = await generateAvailabilityMasks(s.id, currentDate, 1);
          if (availMasks.length > 0) {
            masks[s.id] = availMasks[0];
          }
        } catch (staffError) {
          console.error(`Error loading data for staff ${s.id}:`, staffError);
        }
      }
      
      setTimeSlots(slots);
      setAvailabilityMasks(masks);
    } catch (error) {
      console.error("Error loading staff schedule data:", error);
      setError("Failed to load staff schedule data. Please try again.");
      toast.error("Failed to load schedule data");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadData();
  }, [formattedDate]);
  
  // Handle scheduling a task
  const handleScheduleTask = async (staffId: string, startTime: string, endTime: string) => {
    if (!selectedTask) return;
    
    const staffName = staff.find(s => s.id === staffId)?.fullName || "selected staff";
    
    try {
      // Show loading toast
      toast.loading(`Scheduling task for ${staffName}...`);
      
      // Schedule the task
      await scheduleTask(
        selectedTask.id,
        staffId,
        formattedDate,
        startTime,
        endTime
      );
      
      // Dismiss loading toast
      toast.dismiss();
      
      // Refresh the time slots
      const updatedSlots = await getTimeSlotsByDate(formattedDate);
      
      // Update state
      setTimeSlots(prev => ({
        ...prev,
        [staffId]: updatedSlots.filter(slot => slot.staffId === staffId)
      }));
      
      // Emit event for task scheduling
      publishEvent({
        type: "task.scheduled",
        payload: {
          taskId: selectedTask.id,
          staffId,
          date: formattedDate,
          startTime,
          endTime
        },
        source: "SchedulerView"
      });
      
      toast.success(`Task "${selectedTask.name}" has been scheduled for ${staffName}`);
    } catch (error) {
      toast.dismiss();
      console.error("Error scheduling task:", error);
      toast.error("Error scheduling task");
    }
  };
  
  // Filter staff based on required skills if a task is selected
  const filteredStaff = selectedTask && selectedTask.requiredSkills && selectedTask.requiredSkills.length > 0
    ? staff.filter(s => 
        selectedTask.requiredSkills.some(skill => 
          s.skills && s.skills.includes(skill)
        )
      )
    : staff;
  
  // Convert availability masks to available slots for the schedule card
  const getAvailableSlots = (staffId: string) => {
    const mask = availabilityMasks[staffId];
    if (!mask || !mask.slots) return [];
    
    // Format available slots from the slots in the mask
    return mask.slots
      .filter(slot => slot.isAvailable) // use isAvailable instead of available
      .map(slot => {
        // Convert hour and minute to HH:MM format
        const startHour = slot.hour;
        const startMinute = slot.minute;
        const endHour = startMinute === 30 ? startHour + 1 : startHour;
        const endMinute = startMinute === 30 ? 0 : 30;
        
        return {
          startTime: `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`,
          endTime: `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`
        };
      });
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-center">
          <Loader className="h-10 w-10 animate-spin mx-auto mb-3 text-primary" />
          <p className="text-lg font-medium">Loading staff schedule data...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-5 w-5" />
        <AlertTitle>Error loading schedule data</AlertTitle>
        <AlertDescription className="mt-2">
          {error}
          <div className="mt-4">
            <Button onClick={loadData} variant="outline">Try Again</Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }
  
  if (selectedTask && filteredStaff.length === 0) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No eligible staff</AlertTitle>
        <AlertDescription>
          No staff members with the required skills ({selectedTask.requiredSkills.join(", ")}) are available.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-6">
      {selectedTask && (
        <Alert className="bg-blue-50">
          <AlertTitle>Scheduling Task: {selectedTask.name}</AlertTitle>
          <AlertDescription>
            Use the schedule buttons to assign this task to a staff member.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-6">
        {filteredStaff.map(s => (
          <StaffScheduleCard
            key={s.id}
            staff={s}
            currentDate={currentDate}
            availableSlots={getAvailableSlots(s.id)}
            selectedTask={selectedTask}
            onSchedule={(staffId, startTime, endTime) => handleScheduleTask(staffId, startTime, endTime)}
          />
        ))}
      </div>
    </div>
  );
};

export default StaffScheduleView;
