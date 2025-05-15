import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import {
  getWeeklyAvailabilityByStaff,
  getStaffById,
  batchUpdateWeeklyAvailability,
  calculateAvailabilitySummary
} from "@/services/staffService";
import { WeeklyAvailability } from "@/types/staff";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, Copy, Check, AlertCircle } from "lucide-react";
import AvailabilitySummaryPanel from "./AvailabilitySummaryPanel";
import eventService from "@/services/eventService";
import { useEventPublisher } from "@/hooks/useAppEvent";

const WeeklyAvailabilityMatrix: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { publishEvent } = useEventPublisher();
  
  // Enhanced state for selected cells
  const [selectedCells, setSelectedCells] = useState<Record<string, boolean>>({});
  const [activeDayForCopy, setActiveDayForCopy] = useState<number | null>(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectionStart, setSelectionStart] = useState<string | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  
  // Queries
  const {
    data: staff,
    isLoading: isLoadingStaff
  } = useQuery({
    queryKey: ["staff", id],
    queryFn: () => getStaffById(id || ""),
    enabled: !!id,
  });
  
  const {
    data: weeklyAvailability,
    isLoading: isLoadingAvailability,
    isError: isErrorAvailability,
    error: availabilityError
  } = useQuery({
    queryKey: ["weeklyAvailability", id],
    queryFn: () => getWeeklyAvailabilityByStaff(id || ""),
    enabled: !!id,
  });

  const {
    data: availabilitySummary,
    isLoading: isLoadingSummary
  } = useQuery({
    queryKey: ["availabilitySummary", id],
    queryFn: () => calculateAvailabilitySummary(id || ""),
    enabled: !!id,
  });

  // Mutation for updating availability
  const updateAvailabilityMutation = useMutation({
    mutationFn: (availabilities: WeeklyAvailability[]) => 
      batchUpdateWeeklyAvailability(id || "", availabilities),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weeklyAvailability", id] });
      queryClient.invalidateQueries({ queryKey: ["availabilitySummary", id] });
      
      // Emit event for the availability change
      publishEvent({
        type: "availability.template.changed",
        payload: {
          staffId: id,
          changeType: "template_updated",
          timestamp: new Date().toISOString(),
        },
        source: "WeeklyAvailabilityMatrix"
      });
      
      toast({
        title: "Availability updated",
        description: "Weekly availability has been saved successfully.",
      });
      setUnsavedChanges(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update availability: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  });
  
  // Initialize selected cells based on fetched availability
  useEffect(() => {
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
  
  // Event handlers for cell interaction
  const toggleCell = (day: number, hour: number, minute: number) => {
    const key = `${day}-${hour}-${minute}`;
    setSelectedCells(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      setUnsavedChanges(true);
      return updated;
    });
  };

  const handleCellMouseDown = (day: number, hour: number, minute: number) => {
    if (!isSelectionMode) return;
    
    const key = `${day}-${hour}-${minute}`;
    setSelectionStart(key);
    // Toggle the initial cell
    toggleCell(day, hour, minute);
  };

  const handleCellMouseEnter = (day: number, hour: number, minute: number) => {
    if (!isSelectionMode || !selectionStart) return;
    
    // Get the initial selection value
    const [startDay, startHour, startMinute] = selectionStart.split('-').map(Number);
    const initialValue = !!selectedCells[selectionStart];
    
    // Only allow selection within the same day
    if (startDay !== day) return;
    
    // Determine the range boundaries
    const minHour = Math.min(startHour, hour);
    const maxHour = Math.max(startHour, hour);
    const minMinute = hour === startHour ? Math.min(startMinute, minute) : startHour < hour ? startMinute : minute;
    const maxMinute = hour === startHour ? Math.max(startMinute, minute) : startHour > hour ? startMinute : minute;
    
    // Apply the selection to all cells in the range
    const updatedCells = { ...selectedCells };
    
    // Fill all cells within range
    for (let h = minHour; h <= maxHour; h++) {
      for (let m = 0; m < 60; m += 30) {
        if ((h === minHour && m < minMinute) || (h === maxHour && m > maxMinute)) {
          continue;
        }
        const key = `${day}-${h}-${m}`;
        updatedCells[key] = initialValue;
      }
    }
    
    setSelectedCells(updatedCells);
    setUnsavedChanges(true);
  };

  const handleCellMouseUp = () => {
    setSelectionStart(null);
  };

  // Handle selecting all for a day or time
  const selectAllForDay = (day: number) => {
    const updatedCells = { ...selectedCells };
    
    // For each time slot in the day
    for (let hour = 8; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const key = `${day}-${hour}-${minute}`;
        updatedCells[key] = true;
      }
    }
    
    setSelectedCells(updatedCells);
    setUnsavedChanges(true);
  };

  const clearAllForDay = (day: number) => {
    const updatedCells = { ...selectedCells };
    
    // For each time slot in the day
    for (let hour = 8; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const key = `${day}-${hour}-${minute}`;
        updatedCells[key] = false;
      }
    }
    
    setSelectedCells(updatedCells);
    setUnsavedChanges(true);
  };

  // Copy pattern from one day to another
  const copyDayPattern = (fromDay: number) => {
    setActiveDayForCopy(fromDay);
  };

  const applyDayPattern = (toDay: number) => {
    if (activeDayForCopy === null) return;
    
    const updatedCells = { ...selectedCells };
    
    // Copy all time slots from active day to target day
    for (let hour = 8; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const fromKey = `${activeDayForCopy}-${hour}-${minute}`;
        const toKey = `${toDay}-${hour}-${minute}`;
        updatedCells[toKey] = !!selectedCells[fromKey];
      }
    }
    
    setSelectedCells(updatedCells);
    setUnsavedChanges(true);
    setActiveDayForCopy(null);
  };

  // Save the availability to the database
  const handleSave = () => {
    if (!id) return;
    
    // Convert selected cells back to WeeklyAvailability format
    const availabilities: WeeklyAvailability[] = [];
    
    // Process each day
    for (let day = 0; day <= 6; day++) {
      let currentStartHour = -1;
      let currentStartMinute = -1;
      let isCurrentlyAvailable = false;
      
      // Go through each time slot
      for (let hour = 8; hour <= 17; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const key = `${day}-${hour}-${minute}`;
          const isAvailable = !!selectedCells[key];
          
          // If this is the start of a new availability block
          if (isAvailable && !isCurrentlyAvailable) {
            currentStartHour = hour;
            currentStartMinute = minute;
            isCurrentlyAvailable = true;
          }
          
          // If this is the end of an availability block or the last slot of the day
          const isLastSlot = hour === 17 && minute === 30;
          if ((!isAvailable && isCurrentlyAvailable) || (isLastSlot && isCurrentlyAvailable)) {
            // End time is the current slot
            const endHour = isLastSlot && isAvailable ? 18 : hour;
            const endMinute = isLastSlot && isAvailable ? 0 : minute;
            
            availabilities.push({
              staffId: id,
              dayOfWeek: day as 0 | 1 | 2 | 3 | 4 | 5 | 6,
              startTime: `${currentStartHour.toString().padStart(2, '0')}:${currentStartMinute.toString().padStart(2, '0')}`,
              endTime: `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`,
              isAvailable: true,
            });
            
            isCurrentlyAvailable = false;
          }
        }
      }
    }
    
    // Send the update to the server
    updateAvailabilityMutation.mutate(availabilities);
  };
  
  const handleReset = () => {
    if (weeklyAvailability) {
      // Reset to the last saved state
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
      setUnsavedChanges(false);
    }
  };
  
  // Define the days for display
  const days = [
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 0, label: "Sunday" },
    { value: 6, label: "Saturday" },
  ];

  // Generate time slots for the grid (8 AM to 5:30 PM)
  const hours = Array.from({ length: 10 }, (_, i) => i + 8);
  
  // Loading and error states
  const isLoading = isLoadingStaff || isLoadingAvailability;
  
  if (!id) {
    return <div className="p-6 text-center">Staff ID is required</div>;
  }
  
  if (isErrorAvailability) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 text-red-500 mb-4">
          <AlertCircle className="h-5 w-5" />
          <span>Error loading availability data</span>
        </div>
        <p className="text-sm text-muted-foreground">
          {availabilityError instanceof Error ? availabilityError.message : 'Unknown error'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            {isLoadingStaff ? (
              <Skeleton className="h-8 w-40" />
            ) : (
              <>
                <span>{staff?.fullName}'s Weekly Availability</span>
                <CalendarClock className="h-5 w-5 text-muted-foreground" />
              </>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">
            Define regular working hours that will be used for scheduling and forecasting
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSelectionMode(!isSelectionMode)}
            className={isSelectionMode ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}
          >
            {isSelectionMode ? "Exit Selection Mode" : "Enter Selection Mode"}
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="weekdays" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="weekdays">Weekdays</TabsTrigger>
          <TabsTrigger value="weekend">Weekend</TabsTrigger>
        </TabsList>
        
        <TabsContent value="weekdays">
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Availability Matrix</span>
                {unsavedChanges && (
                  <Badge variant="outline" className="text-yellow-600 bg-yellow-50">
                    Unsaved changes
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Click on time slots to mark them as available or unavailable
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="min-w-[800px]">
                    {/* Grid header with day actions */}
                    <div className="grid grid-cols-[120px_repeat(5,1fr)]">
                      <div className="p-2 font-medium">
                        Time
                      </div>
                      {days.slice(0, 5).map(day => (
                        <div key={day.value} className="p-2 text-center">
                          <div className="font-medium mb-1">{day.label}</div>
                          <div className="flex justify-center gap-1 text-xs">
                            <button
                              onClick={() => selectAllForDay(day.value)}
                              className="px-2 py-0.5 rounded bg-green-50 text-green-700 hover:bg-green-100"
                            >
                              All
                            </button>
                            <button
                              onClick={() => clearAllForDay(day.value)}
                              className="px-2 py-0.5 rounded bg-slate-50 text-slate-700 hover:bg-slate-100"
                            >
                              None
                            </button>
                            <button
                              onClick={() => activeDayForCopy === null 
                                ? copyDayPattern(day.value) 
                                : applyDayPattern(day.value)
                              }
                              className={`px-2 py-0.5 rounded ${
                                activeDayForCopy === day.value
                                  ? "bg-blue-100 text-blue-700" 
                                  : activeDayForCopy !== null
                                    ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                                    : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                              }`}
                            >
                              {activeDayForCopy === day.value ? "Copying..." : 
                                activeDayForCopy !== null ? "Paste" : "Copy"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Grid body */}
                    {hours.map(hour => (
                      <React.Fragment key={hour}>
                        {[0, 30].map(minute => {
                          const timeLabel = `${hour}:${minute === 0 ? '00' : minute}`;
                          return (
                            <div 
                              key={`${hour}:${minute}`} 
                              className="grid grid-cols-[120px_repeat(5,1fr)] border-t"
                            >
                              <div className="p-2 text-sm text-muted-foreground font-mono">
                                {timeLabel}
                              </div>
                              
                              {days.slice(0, 5).map(day => {
                                const cellKey = `${day.value}-${hour}-${minute}`;
                                const isSelected = !!selectedCells[cellKey];
                                
                                return (
                                  <div key={day.value} className="p-1 text-center">
                                    <div
                                      onMouseDown={() => handleCellMouseDown(day.value, hour, minute)}
                                      onMouseEnter={() => handleCellMouseEnter(day.value, hour, minute)}
                                      onMouseUp={handleCellMouseUp}
                                      className={`
                                        h-10 rounded-md cursor-pointer transition-all
                                        ${isSelected 
                                          ? 'bg-green-100 hover:bg-green-200 border-green-300' 
                                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200'}
                                        border
                                        ${isSelectionMode ? 'ring-2 ring-offset-1 ring-offset-white ring-primary/20' : ''}
                                      `}
                                      title={`${days.find(d => d.value === day.value)?.label} at ${timeLabel} - ${isSelected ? 'Available' : 'Not available'}`}
                                    >
                                      {isSelected && (
                                        <div className="h-full flex items-center justify-center">
                                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
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
              )}
            </CardContent>
          </Card>
          
          {/* Availability Summary */}
          <AvailabilitySummaryPanel 
            summary={availabilitySummary} 
            isLoading={isLoadingSummary} 
            days={days.slice(0, 5)} 
          />
        </TabsContent>
        
        <TabsContent value="weekend">
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Weekend Availability</CardTitle>
              <CardDescription>
                Define weekend availability if applicable
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="min-w-[600px]">
                  {/* Grid header with day actions */}
                  <div className="grid grid-cols-[120px_repeat(2,1fr)]">
                    <div className="p-2 font-medium">
                      Time
                    </div>
                    {days.slice(5, 7).map(day => (
                      <div key={day.value} className="p-2 text-center">
                        <div className="font-medium mb-1">{day.label}</div>
                        <div className="flex justify-center gap-1 text-xs">
                          <button
                            onClick={() => selectAllForDay(day.value)}
                            className="px-2 py-0.5 rounded bg-green-50 text-green-700 hover:bg-green-100"
                          >
                            All
                          </button>
                          <button
                            onClick={() => clearAllForDay(day.value)}
                            className="px-2 py-0.5 rounded bg-slate-50 text-slate-700 hover:bg-slate-100"
                          >
                            None
                          </button>
                          <button
                            onClick={() => activeDayForCopy === null 
                              ? copyDayPattern(day.value) 
                              : applyDayPattern(day.value)
                            }
                            className={`px-2 py-0.5 rounded ${
                              activeDayForCopy === day.value
                                ? "bg-blue-100 text-blue-700" 
                                : activeDayForCopy !== null
                                  ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                                  : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            {activeDayForCopy === day.value ? "Copying..." : 
                              activeDayForCopy !== null ? "Paste" : "Copy"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Grid body */}
                  {hours.map(hour => (
                    <React.Fragment key={hour}>
                      {[0, 30].map(minute => {
                        const timeLabel = `${hour}:${minute === 0 ? '00' : minute}`;
                        return (
                          <div 
                            key={`${hour}:${minute}`} 
                            className="grid grid-cols-[120px_repeat(2,1fr)] border-t"
                          >
                            <div className="p-2 text-sm text-muted-foreground font-mono">
                              {timeLabel}
                            </div>
                            
                            {days.slice(5, 7).map(day => {
                              const cellKey = `${day.value}-${hour}-${minute}`;
                              const isSelected = !!selectedCells[cellKey];
                              
                              return (
                                <div key={day.value} className="p-1 text-center">
                                  <div
                                    onMouseDown={() => handleCellMouseDown(day.value, hour, minute)}
                                    onMouseEnter={() => handleCellMouseEnter(day.value, hour, minute)}
                                    onMouseUp={handleCellMouseUp}
                                    className={`
                                      h-10 rounded-md cursor-pointer transition-all
                                      ${isSelected 
                                        ? 'bg-green-100 hover:bg-green-200 border-green-300' 
                                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200'}
                                      border
                                      ${isSelectionMode ? 'ring-2 ring-offset-1 ring-offset-white ring-primary/20' : ''}
                                    `}
                                    title={`${days.find(d => d.value === day.value)?.label} at ${timeLabel} - ${isSelected ? 'Available' : 'Not available'}`}
                                  >
                                    {isSelected && (
                                      <div className="h-full flex items-center justify-center">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
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
          
          {/* Weekend Availability Summary */}
          <AvailabilitySummaryPanel 
            summary={availabilitySummary} 
            isLoading={isLoadingSummary}
            days={days.slice(5, 7)} 
          />
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end space-x-3">
        <Button 
          variant="outline" 
          onClick={handleReset}
          disabled={!unsavedChanges || updateAvailabilityMutation.isPending}
        >
          Reset to Saved
        </Button>
        <Button 
          onClick={handleSave}
          disabled={!unsavedChanges || updateAvailabilityMutation.isPending}
        >
          {updateAvailabilityMutation.isPending ? (
            <>
              <span className="mr-2">Saving...</span>
              <span className="animate-spin">⏳</span>
            </>
          ) : unsavedChanges ? (
            <>
              <span className="mr-2">Save Changes</span>
              <Check className="h-4 w-4" />
            </>
          ) : (
            "Save Availability"
          )}
        </Button>
      </div>
    </div>
  );
};

export default WeeklyAvailabilityMatrix;
