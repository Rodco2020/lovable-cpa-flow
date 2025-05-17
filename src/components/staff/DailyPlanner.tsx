
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { format, addDays, parse, isToday } from "date-fns";
import { getTimeSlotsByStaffAndDate, getStaffById } from "@/services/staffService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const DailyPlanner: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [date, setDate] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  // Format date as YYYY-MM-DD for API calls
  const formattedDate = format(date, "yyyy-MM-dd");
  
  const { data: staff } = useQuery({
    queryKey: ["staff", id],
    queryFn: () => getStaffById(id || ""),
    enabled: !!id,
  });
  
  const { data: timeSlots, isLoading } = useQuery({
    queryKey: ["timeSlots", id, formattedDate],
    queryFn: () => getTimeSlotsByStaffAndDate(id || "", formattedDate),
    enabled: !!id,
  });
  
  const navigateDay = (direction: number) => {
    setDate(addDays(date, direction));
  };
  
  // Generate time slots for display
  const timeLabels = Array.from({ length: 18 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8; // Start at 8 AM
    const minutes = i % 2 === 0 ? "00" : "30";
    return `${hour}:${minutes}`;
  });
  
  if (!id || isLoading) {
    return <div className="flex justify-center p-8">Loading schedule data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">
          {staff?.fullName}'s Schedule
        </h1>
        
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
      
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-[80px_1fr] divide-x">
            <div className="bg-slate-50 text-slate-500">
              {/* Time labels column */}
              <div className="h-12 border-b flex items-center justify-center font-medium">
                Time
              </div>
              {timeLabels.map((time, index) => (
                <div 
                  key={time}
                  className={cn(
                    "h-16 flex items-center justify-center text-sm",
                    index % 2 === 0 ? "bg-slate-50" : "bg-slate-100"
                  )}
                >
                  {time}
                </div>
              ))}
            </div>
            
            <div>
              {/* Schedule column */}
              <div className="h-12 border-b flex items-center justify-center font-medium">
                {format(date, "EEEE, MMMM d")}
                {isToday(date) && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    Today
                  </span>
                )}
              </div>
              
              {timeLabels.map((time, index) => {
                // Find time slot for this time
                const timeStart = parse(time, "H:mm", new Date()).getHours() + 
                                 (parse(time, "H:mm", new Date()).getMinutes() / 60);
                const slot = timeSlots?.find(s => {
                  const slotStart = parseInt(s.startTime.split(':')[0]) + 
                                   (parseInt(s.startTime.split(':')[1]) / 60);
                  return Math.abs(slotStart - timeStart) < 0.01; // Account for floating point comparison
                });
                
                return (
                  <div 
                    key={time}
                    className={cn(
                      "h-16 p-1 border-b",
                      index % 2 === 0 ? "bg-white" : "bg-slate-50",
                      !slot?.isAvailable && "bg-gray-100"
                    )}
                  >
                    {slot?.isAvailable && !slot.taskId && (
                      <div className="h-full bg-green-50 border border-green-200 rounded-md p-2 flex flex-col">
                        <span className="text-xs text-green-700 font-medium">Available</span>
                      </div>
                    )}
                    
                    {slot?.taskId && (
                      <div className="h-full bg-blue-50 border border-blue-200 rounded-md p-2 flex flex-col">
                        <span className="text-xs text-blue-800 font-medium">Task #{slot.taskId.substring(0, 8)}</span>
                        <span className="text-xs text-blue-600 truncate">Client Meeting</span>
                      </div>
                    )}
                    
                    {slot && !slot.isAvailable && !slot.taskId && (
                      <div className="h-full bg-slate-100 border border-slate-200 rounded-md p-2 flex flex-col">
                        <span className="text-xs text-slate-500 font-medium">Unavailable</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end space-x-3">
        <Button variant="outline">Print Schedule</Button>
        <Button>Add Task</Button>
      </div>
    </div>
  );
};

export default DailyPlanner;
