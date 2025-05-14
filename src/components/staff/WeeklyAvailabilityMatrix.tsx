
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getWeeklyAvailabilityByStaff, getStaffById } from "@/services/staffService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

const WeeklyAvailabilityMatrix: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  // State to manage the selected cells
  const [selectedCells, setSelectedCells] = useState<Record<string, boolean>>({});
  
  const { data: staff } = useQuery({
    queryKey: ["staff", id],
    queryFn: () => getStaffById(id || ""),
    enabled: !!id,
  });
  
  const { data: weeklyAvailability, isLoading } = useQuery({
    queryKey: ["weeklyAvailability", id],
    queryFn: () => getWeeklyAvailabilityByStaff(id || ""),
    enabled: !!id,
  });
  
  // Initialize selected cells based on fetched availability
  React.useEffect(() => {
    if (weeklyAvailability) {
      const initialSelection: Record<string, boolean> = {};
      weeklyAvailability.forEach(avail => {
        // Convert time ranges to individual cells
        const startHour = parseInt(avail.startTime.split(':')[0]);
        const startMinute = parseInt(avail.startTime.split(':')[1]);
        const endHour = parseInt(avail.endTime.split(':')[0]);
        const endMinute = parseInt(avail.endTime.split(':')[1]);
        
        // Generate all 30-minute slots in the range
        for (let h = startHour; h <= endHour; h++) {
          for (let m = 0; m < 60; m += 30) {
            // Skip slots before start time or after end time
            if ((h === startHour && m < startMinute) || (h === endHour && m >= endMinute)) {
              continue;
            }
            const key = `${avail.dayOfWeek}-${h}-${m}`;
            initialSelection[key] = avail.isAvailable;
          }
        }
      });
      setSelectedCells(initialSelection);
    }
  }, [weeklyAvailability]);
  
  const toggleCell = (day: number, hour: number, minute: number) => {
    const key = `${day}-${hour}-${minute}`;
    setSelectedCells(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  const handleSave = () => {
    // In a real app, you would save this availability matrix
    // For now, just show a success message
    toast({
      title: "Availability updated",
      description: "Weekly availability has been saved successfully.",
    });
  };
  
  if (!id || isLoading) {
    return <div className="flex justify-center p-8">Loading availability data...</div>;
  }
  
  // Generate time slots for the grid
  const hours = Array.from({ length: 10 }, (_, i) => i + 8); // 8 AM to 5 PM
  const days = [
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">
          {staff?.fullName}'s Weekly Availability
        </h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Availability Matrix</CardTitle>
          <p className="text-sm text-muted-foreground">
            Click on time slots to mark them as available or unavailable
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Grid header */}
              <div className="grid grid-cols-[120px_repeat(5,1fr)]">
                <div className="p-2 font-medium">Time</div>
                {days.map(day => (
                  <div key={day.value} className="p-2 text-center font-medium">
                    {day.label}
                  </div>
                ))}
              </div>
              
              {/* Grid body */}
              {hours.map(hour => (
                <React.Fragment key={hour}>
                  {[0, 30].map(minute => {
                    const timeLabel = `${hour}:${minute === 0 ? '00' : minute}`;
                    return (
                      <div key={`${hour}:${minute}`} className="grid grid-cols-[120px_repeat(5,1fr)] border-t">
                        <div className="p-2 text-sm text-muted-foreground">
                          {timeLabel}
                        </div>
                        
                        {days.map(day => {
                          const cellKey = `${day.value}-${hour}-${minute}`;
                          const isSelected = !!selectedCells[cellKey];
                          
                          return (
                            <div key={day.value} className="p-1 text-center">
                              <div
                                onClick={() => toggleCell(day.value, hour, minute)}
                                className={`
                                  h-8 rounded-md cursor-pointer transition-colors
                                  ${isSelected ? 'bg-green-100 hover:bg-green-200' : 'bg-gray-100 hover:bg-gray-200'}
                                  border ${isSelected ? 'border-green-300' : 'border-gray-200'}
                                `}
                              >
                                {isSelected && (
                                  <div className="h-full flex items-center justify-center">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end space-x-3">
        <Button variant="outline">Reset to Default</Button>
        <Button onClick={handleSave}>Save Availability</Button>
      </div>
    </div>
  );
};

export default WeeklyAvailabilityMatrix;
