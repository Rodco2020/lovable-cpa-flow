
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Staff } from "@/types/staff";
import { TaskInstance } from "@/types/task";
import { Loader } from "lucide-react";
import DroppableTimeSlot from "./DroppableTimeSlot";

interface StaffScheduleCardProps {
  staff: Staff;
  selectedTask: TaskInstance | null;
  currentDate: Date;
  availableSlots: {
    startTime: string;
    endTime: string;
  }[];
  onSchedule?: (staffId: string, startTime: string, endTime: string) => void;
  onTaskDrop?: (taskId: string, staffId: string, startTime: string, endTime: string) => void;
  isScheduling?: boolean;
}

const StaffScheduleCard: React.FC<StaffScheduleCardProps> = ({
  staff,
  selectedTask,
  availableSlots,
  onSchedule,
  onTaskDrop,
  isScheduling = false,
}) => {
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Handler for task drops
  const handleTaskDrop = (taskId: string, staffId: string, startTime: string, endTime: string) => {
    if (onTaskDrop) {
      onTaskDrop(taskId, staffId, startTime, endTime);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-slate-50 pb-3">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>
              {getInitials(staff.fullName)}
            </AvatarFallback>
            <AvatarImage src={`/placeholder-avatar-${Math.floor(Math.random() * 5) + 1}.jpg`} />
          </Avatar>
          <div>
            <CardTitle className="text-base">{staff.fullName}</CardTitle>
            <p className="text-xs text-muted-foreground">
              {staff.roleTitle}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {isScheduling && (
          <div className="flex justify-center items-center py-4">
            <Loader className="animate-spin h-6 w-6 text-primary mr-2" />
            <span>Scheduling...</span>
          </div>
        )}
        
        {!isScheduling && availableSlots.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">
            No available time slots for this day
          </div>
        ) : (
          <div className="space-y-2">
            {!isScheduling && availableSlots.map((slot, index) => (
              <DroppableTimeSlot
                key={index}
                staffId={staff.id}
                startTime={slot.startTime}
                endTime={slot.endTime}
                onDrop={handleTaskDrop}
                isDisabled={!selectedTask}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StaffScheduleCard;
