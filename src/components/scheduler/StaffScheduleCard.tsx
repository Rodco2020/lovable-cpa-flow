
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, parse } from "date-fns";
import { cn } from "@/lib/utils";
import { Staff } from "@/types/staff";
import { TimeSlot } from "@/types/staff";
import { TaskInstance } from "@/types/task";
import { AvailabilityMask } from "@/services/integrations/schedulerIntegration";
import { CalendarClock } from "lucide-react";

interface StaffScheduleCardProps {
  staff: Staff;
  date: Date;
  timeSlots: TimeSlot[];
  selectedTask: TaskInstance | null;
  availabilityMask?: AvailabilityMask;
  onScheduleTask: (staffId: string, timeSlotId: string, startTime: string) => void;
}

const StaffScheduleCard: React.FC<StaffScheduleCardProps> = ({ 
  staff, 
  date, 
  timeSlots, 
  selectedTask,
  availabilityMask,
  onScheduleTask 
}) => {
  // Generate time slots for display (8:00 AM to 5:00 PM in 30-minute increments)
  const timeLabels = Array.from({ length: 18 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8; // Start at 8 AM
    const minutes = i % 2 === 0 ? "00" : "30";
    return `${hour < 10 ? '0' + hour : hour}:${minutes}`;
  });
  
  // Check if a time is within any availability mask slot
  const isInAvailabilityMask = (time: string): boolean => {
    if (!availabilityMask) return false;
    
    // Check if this time is within any mask slot's range
    return availabilityMask.availableSlots.some(slot => {
      return slot.startTime <= time && slot.endTime > time;
    });
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span>{staff.fullName}</span>
            <span className="text-sm font-normal text-muted-foreground">
              {staff.roleTitle}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-normal text-muted-foreground">
              ${staff.costPerHour}/hour
            </span>
            {availabilityMask && (
              <div className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                <CalendarClock className="h-3 w-3 mr-1" />
                <span>Template Available</span>
              </div>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-[80px_1fr] divide-x overflow-x-auto">
          <div className="bg-slate-50 text-slate-500">
            {/* Time labels column */}
            {timeLabels.map((time, index) => (
              <div 
                key={time}
                className={cn(
                  "h-12 flex items-center justify-center text-sm border-b",
                  index % 2 === 0 ? "bg-slate-50" : "bg-slate-100"
                )}
              >
                {time}
              </div>
            ))}
          </div>
          
          <div>
            {/* Schedule column */}
            {timeLabels.map((time, index) => {
              // Find time slot for this time
              const timeStart = time;
              const slot = timeSlots.find(s => s.startTime === timeStart);
              const isInTemplateMask = isInAvailabilityMask(time);
              
              return (
                <div 
                  key={time}
                  className={cn(
                    "h-12 p-1 border-b",
                    index % 2 === 0 ? "bg-white" : "bg-slate-50",
                    !slot?.isAvailable && "bg-gray-100",
                    isInTemplateMask && "bg-green-50/30" // Subtle highlight for template availability
                  )}
                >
                  {slot?.isAvailable && !slot.taskId && (
                    <div className="h-full flex items-center justify-center">
                      {selectedTask && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className={cn(
                            "h-8 w-full text-xs text-green-700 border-green-300 bg-green-50 hover:bg-green-100 hover:text-green-800",
                            isInTemplateMask && "ring-1 ring-green-200"
                          )}
                          onClick={() => onScheduleTask(staff.id, slot.id, time)}
                        >
                          {isInTemplateMask ? "✓ Schedule Here" : "Schedule Here"}
                        </Button>
                      )}
                    </div>
                  )}
                  
                  {slot?.taskId && (
                    <div className="h-full bg-blue-50 border border-blue-200 rounded-md p-2 flex flex-col">
                      <span className="text-xs text-blue-800 font-medium">Assigned Task</span>
                    </div>
                  )}
                  
                  {slot && !slot.isAvailable && !slot.taskId && (
                    <div className="h-full bg-slate-100 border border-slate-200 rounded-md p-1 flex items-center justify-center">
                      <span className="text-xs text-slate-500">Unavailable</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StaffScheduleCard;
