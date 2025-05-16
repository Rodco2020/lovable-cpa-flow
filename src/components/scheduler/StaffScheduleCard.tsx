
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Staff } from "@/types/staff";
import { TaskInstance } from "@/types/task";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader } from "lucide-react";

interface StaffScheduleCardProps {
  staff: Staff;
  selectedTask: TaskInstance | null;
  currentDate: Date;
  availableSlots: {
    startTime: string;
    endTime: string;
  }[];
  onSchedule?: (staffId: string, startTime: string, endTime: string) => void;
}

const StaffScheduleCard: React.FC<StaffScheduleCardProps> = ({
  staff,
  selectedTask,
  currentDate,
  availableSlots,
  onSchedule,
}) => {
  const [selectedSlot, setSelectedSlot] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);

  const handleSchedule = async () => {
    if (selectedSlot && onSchedule) {
      setIsScheduling(true);
      const [startTime, endTime] = selectedSlot.split("-");
      
      try {
        await onSchedule(staff.id, startTime, endTime);
        setSelectedSlot("");
      } catch (error) {
        console.error("Error in schedule handler:", error);
      } finally {
        setIsScheduling(false);
      }
    }
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
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
        {availableSlots.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">
            No available time slots for this day
          </div>
        ) : (
          <div className="space-y-4">
            <Select 
              value={selectedSlot} 
              onValueChange={setSelectedSlot}
              disabled={isScheduling || !selectedTask}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select time slot" />
              </SelectTrigger>
              <SelectContent>
                {availableSlots.map((slot, index) => (
                  <SelectItem key={index} value={`${slot.startTime}-${slot.endTime}`}>
                    {slot.startTime} - {slot.endTime}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              className="w-full"
              onClick={handleSchedule}
              disabled={!selectedTask || !selectedSlot || isScheduling}
            >
              {isScheduling ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Scheduling...
                </>
              ) : (
                "Schedule"
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StaffScheduleCard;
