
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, addDays, startOfWeek } from "date-fns";
import { getAllStaff } from "@/services/staffService";
import { updateTaskInstance } from "@/services/taskService";
import { getTimeSlotsByDate } from "@/services/staffService";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { TaskInstance } from "@/types/task";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import StaffScheduleCard from "./StaffScheduleCard";

interface StaffScheduleViewProps {
  selectedTask: TaskInstance | null;
}

const StaffScheduleView: React.FC<StaffScheduleViewProps> = ({ selectedTask }) => {
  const [date, setDate] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  // Format date as YYYY-MM-DD for API calls
  const formattedDate = format(date, "yyyy-MM-dd");
  
  const { data: staff = [], isLoading: staffLoading } = useQuery({
    queryKey: ["staff"],
    queryFn: getAllStaff,
  });
  
  const { data: timeSlots = [], isLoading: slotsLoading } = useQuery({
    queryKey: ["timeSlotsByDate", formattedDate],
    queryFn: () => getTimeSlotsByDate(formattedDate),
    enabled: !!formattedDate,
  });

  const navigateDay = (direction: number) => {
    setDate(addDays(date, direction));
  };

  // Filter staff by matching skills with the selected task
  const filteredStaff = selectedTask
    ? staff.filter(s => 
        // Check if staff has at least one of the required skills
        s.skills.some(skillId => {
          // This is a simplification - in a real app, we'd need to map skill IDs to names
          return selectedTask.requiredSkills.includes(skillId as any);
        })
      )
    : staff;

  const handleScheduleTask = async (staffId: string, timeSlotId: string, startTime: string) => {
    if (!selectedTask) return;
    
    try {
      const scheduledDate = new Date(`${formattedDate}T${startTime}`);
      
      // Calculate end time based on estimated hours
      const endDate = new Date(scheduledDate);
      endDate.setMinutes(endDate.getMinutes() + (selectedTask.estimatedHours * 60));
      
      await updateTaskInstance(selectedTask.id, {
        status: 'Scheduled',
        assignedStaffId: staffId,
        scheduledStartTime: scheduledDate,
        scheduledEndTime: endDate,
      });
      
      toast({
        title: "Task scheduled",
        description: `${selectedTask.name} has been scheduled successfully.`,
      });
    } catch (error) {
      console.error("Error scheduling task:", error);
      toast({
        title: "Scheduling failed",
        description: "There was an error scheduling the task.",
        variant: "destructive",
      });
    }
  };
  
  if (staffLoading || slotsLoading) {
    return <div className="flex justify-center p-4">Loading schedule data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          {selectedTask ? (
            <div className="p-2 bg-blue-50 border border-blue-100 rounded-md">
              <h3 className="font-medium">Selected Task: {selectedTask.name}</h3>
              <p className="text-sm text-muted-foreground">
                {selectedTask.estimatedHours} hours • {selectedTask.priority} priority
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground italic">No task selected. Select a task from the Unscheduled Tasks tab.</p>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateDay(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal w-[200px]",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => {
                  if (date) {
                    setDate(date);
                    setIsCalendarOpen(false);
                  }
                }}
              />
            </PopoverContent>
          </Popover>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateDay(1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => setDate(new Date())}
            className="ml-2"
          >
            Today
          </Button>
        </div>
      </div>
      
      {filteredStaff.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              {selectedTask 
                ? "No staff members with matching skills were found." 
                : "Please select a task to schedule."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredStaff.map(staffMember => (
            <StaffScheduleCard
              key={staffMember.id}
              staff={staffMember}
              date={date}
              timeSlots={timeSlots.filter(slot => slot.staffId === staffMember.id)}
              selectedTask={selectedTask}
              onScheduleTask={handleScheduleTask}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default StaffScheduleView;
