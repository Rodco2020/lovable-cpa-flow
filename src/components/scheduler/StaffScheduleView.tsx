
import React, { useEffect, useState } from "react";
import { getAllStaff } from "@/services/staffService";
import { TaskInstance } from "@/types/task";
import { Staff, TimeSlot } from "@/types/staff";
import { getTimeSlotsByDate } from "@/services/staffService";
import { format } from "date-fns";
import StaffScheduleCard from "./StaffScheduleCard";
import { scheduleTask } from "@/services/schedulerService";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { generateAvailabilityMasks, AvailabilityMask } from "@/services/integrations/schedulerIntegration";
import { useEventPublisher } from "@/hooks/useAppEvent";

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
  const [availabilityMasks, setAvailabilityMasks] = useState<Record<string, AvailabilityMask>>({});
  const { publishEvent } = useEventPublisher();
  
  // Format date for API calls
  const formattedDate = format(currentDate, "yyyy-MM-dd");
  
  // Load staff and their time slots
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Fetch all staff
        const staffList = await getAllStaff();
        setStaff(staffList.filter(s => s.status === "active"));
        
        // Load time slots for each staff member
        const slots: Record<string, TimeSlot[]> = {};
        const masks: Record<string, AvailabilityMask> = {};
        
        for (const s of staffList.filter(s => s.status === "active")) {
          // Get time slots from the service
          const staffSlots = await getTimeSlotsByDate(formattedDate);
          slots[s.id] = staffSlots.filter(slot => slot.staffId === s.id);
          
          // Get availability mask from integration service
          const availMasks = await generateAvailabilityMasks(s.id, currentDate, 1);
          if (availMasks.length > 0) {
            masks[s.id] = availMasks[0];
          }
        }
        
        setTimeSlots(slots);
        setAvailabilityMasks(masks);
      } catch (error) {
        console.error("Error loading staff schedule data:", error);
        toast({
          variant: "destructive",
          title: "Error loading schedule",
          description: "Failed to load staff schedule data. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [formattedDate]);
  
  // Handle scheduling a task
  const handleScheduleTask = async (staffId: string, timeSlotId: string, startTime: string) => {
    if (!selectedTask) return;
    
    try {
      // Parse start time and create an end time 1 hour later
      const [hour, minute] = startTime.split(":").map(Number);
      const endHour = hour + 1;
      const endTime = `${endHour < 10 ? '0' + endHour : endHour}:${minute < 10 ? '0' + minute : minute}`;
      
      // Schedule the task
      await scheduleTask(
        selectedTask.id,
        staffId,
        formattedDate,
        startTime,
        endTime
      );
      
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
      
      toast({
        title: "Task scheduled",
        description: `Task "${selectedTask.name}" has been scheduled.`,
      });
    } catch (error) {
      console.error("Error scheduling task:", error);
      toast({
        variant: "destructive",
        title: "Error scheduling task",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };
  
  // Filter staff based on required skills if a task is selected
  const filteredStaff = selectedTask && selectedTask.requiredSkills && selectedTask.requiredSkills.length > 0
    ? staff.filter(s => 
        selectedTask.requiredSkills.some(skill => 
          s.skills.includes(skill)
        )
      )
    : staff;
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
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
            date={currentDate}
            timeSlots={timeSlots[s.id] || []}
            selectedTask={selectedTask}
            onScheduleTask={handleScheduleTask}
            availabilityMask={availabilityMasks[s.id]}
          />
        ))}
      </div>
    </div>
  );
};

export default StaffScheduleView;
