
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { format, parseISO, isEqual } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getTimeSlotsByStaffAndDate, getStaffById } from '@/services/staffService';
import { StaffMember, TimeSlot } from '@/types/staff';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface DailyPlannerProps {
  staffId: string;
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
}

const DailyPlanner: React.FC<DailyPlannerProps> = ({ 
  staffId, 
  selectedDate = new Date(), 
  onDateChange 
}) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [staff, setStaff] = useState<StaffMember | null>(null);
  
  // Load time slots for the selected date and staff
  useEffect(() => {
    const fetchTimeSlots = async () => {
      try {
        setIsLoading(true);
        
        // Ensure we have a proper Date object
        const dateToUse = selectedDate instanceof Date 
          ? selectedDate 
          : new Date(selectedDate);
        
        const [slotsData, staffData] = await Promise.all([
          getTimeSlotsByStaffAndDate(staffId, dateToUse),
          getStaffById(staffId)
        ]);
        
        setTimeSlots(slotsData);
        setStaff(staffData);
        setError(null);
      } catch (err) {
        console.error("Error fetching time slots:", err);
        setError("Failed to load daily schedule");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTimeSlots();
  }, [staffId, selectedDate]);
  
  // Calculate schedule summary
  const scheduleSummary = timeSlots.reduce((summary, slot) => {
    const updatedSummary = { ...summary };
    
    if (slot.isAvailable && !slot.taskId) {
      updatedSummary.availableSlots += 1;
      updatedSummary.availableHours += 0.5; // Each slot is 30 minutes
    } else if (!slot.isAvailable) {
      updatedSummary.unavailableSlots += 1;
    }
    
    if (slot.taskId) {
      updatedSummary.assignedSlots += 1;
      updatedSummary.assignedHours += 0.5;
    }
    
    return updatedSummary;
  }, { 
    availableSlots: 0, 
    availableHours: 0, 
    unavailableSlots: 0, 
    assignedSlots: 0, 
    assignedHours: 0 
  });
  
  // Helper to format time from a date object
  const formatTime = (date: Date): string => {
    return date instanceof Date ? format(date, 'h:mm a') : '';
  };
  
  // Group slots by hour for better visual organization
  const groupedTimeSlots = timeSlots.reduce((groups: Record<string, TimeSlot[]>, slot) => {
    // Format the hour as a key (e.g. "9:00 AM")
    const hourKey = format(slot.startTime, 'h:00 a');
    
    if (!groups[hourKey]) {
      groups[hourKey] = [];
    }
    
    groups[hourKey].push(slot);
    return groups;
  }, {});
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <p>Loading daily schedule...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-red-500 justify-center py-8">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <span>Daily Planner</span>
          </CardTitle>
          
          <div className="text-sm text-muted-foreground">
            {format(
              selectedDate instanceof Date ? selectedDate : new Date(selectedDate), 
              'EEEE, MMMM d, yyyy'
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Schedule summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-md p-3">
            <div className="text-sm text-muted-foreground">Available</div>
            <div className="text-2xl font-semibold">{scheduleSummary.availableHours} hrs</div>
          </div>
          
          <div className="bg-green-50 rounded-md p-3">
            <div className="text-sm text-muted-foreground">Assigned</div>
            <div className="text-2xl font-semibold">{scheduleSummary.assignedHours} hrs</div>
          </div>
          
          <div className="bg-gray-50 rounded-md p-3">
            <div className="text-sm text-muted-foreground">Utilization</div>
            <div className="text-2xl font-semibold">
              {scheduleSummary.availableHours + scheduleSummary.assignedHours > 0
                ? Math.round((scheduleSummary.assignedHours / (scheduleSummary.availableHours + scheduleSummary.assignedHours)) * 100)
                : 0}%
            </div>
          </div>
        </div>
        
        {/* Time slots */}
        <div className="space-y-4">
          {Object.entries(groupedTimeSlots).map(([hour, slots]) => (
            <div key={hour}>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium text-sm">{hour}</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                {slots.map(slot => (
                  <div 
                    key={slot.id}
                    className={`p-3 rounded-md border ${
                      slot.taskId
                        ? 'bg-green-50 border-green-200'
                        : slot.isAvailable
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between">
                      <div className="font-medium text-sm">
                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                      </div>
                      
                      <Badge variant={
                        slot.taskId ? "default" : 
                        slot.isAvailable ? "outline" : "secondary"
                      }>
                        {slot.taskId ? "Assigned" : 
                          slot.isAvailable ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                    
                    {slot.taskId && (
                      <div className="mt-1 text-sm text-muted-foreground flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                        <span>Task assigned</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <Separator className="my-4" />
            </div>
          ))}
          
          {Object.keys(groupedTimeSlots).length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              No time slots available for this day.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyPlanner;
