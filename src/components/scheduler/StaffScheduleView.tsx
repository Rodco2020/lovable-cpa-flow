
// Fixing issues with date conversion and staff status
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Clock } from 'lucide-react';
import { StaffMember } from '@/types/staff';
import StaffScheduleCard from './StaffScheduleCard';
import { getAllStaff } from '@/services/staffService';
import { getTimeSlotsByDate } from '@/services/staffService';
import { scheduleTasks } from '@/services/schedulerService';
import { TaskInstance } from '@/types/task';
import { format, parseISO } from 'date-fns';

interface StaffScheduleViewProps {
  selectedDate: Date;
  unscheduledTasks: TaskInstance[];
  onTaskAssigned: () => void;
}

const StaffScheduleView: React.FC<StaffScheduleViewProps> = ({
  selectedDate,
  unscheduledTasks,
  onTaskAssigned
}) => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scheduleData, setScheduleData] = useState<Record<string, any>>({});

  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      const staffData = await getAllStaff();
      
      // Filter active staff
      const activeStaff = staffData.filter(s => s.status === 'Active');
      setStaff(activeStaff);
      
      // Fetch schedule data for each staff member
      const schedulePromises = activeStaff.map(async (s) => {
        // Convert Date object to proper format if needed
        const formattedDate = selectedDate instanceof Date 
          ? selectedDate 
          : new Date(selectedDate);
          
        const timeSlots = await getTimeSlotsByDate(s.id, formattedDate);
        return { staffId: s.id, timeSlots };
      });
      
      const scheduleResults = await Promise.all(schedulePromises);
      
      // Convert to record for easier lookup
      const scheduleRecord: Record<string, any> = {};
      scheduleResults.forEach(item => {
        scheduleRecord[item.staffId] = item.timeSlots;
      });
      
      setScheduleData(scheduleRecord);
      setError(null);
    } catch (err) {
      console.error("Error fetching staff data:", err);
      setError("Failed to load staff schedule data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [selectedDate]);

  const handleAssignTask = async (taskId: string, staffId: string, startTime: Date, endTime: Date) => {
    try {
      // Schedule the task
      const result = await scheduleTasks(
        [taskId],
        staffId,
        startTime,
        endTime
      );
      
      if (result.success) {
        onTaskAssigned();
        
        // Refresh schedule data for this staff member
        const formattedDate = selectedDate instanceof Date 
          ? selectedDate 
          : new Date(selectedDate);
          
        const updatedTimeSlots = await getTimeSlotsByDate(staffId, formattedDate);
        
        setScheduleData(prev => ({
          ...prev,
          [staffId]: updatedTimeSlots
        }));
      }
    } catch (error) {
      console.error("Error assigning task:", error);
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading staff schedule data...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  if (staff.length === 0) {
    return <div className="p-4 text-center">No active staff members found.</div>;
  }

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar className="h-4 w-4" />
        <span>Showing schedule for {format(
          selectedDate instanceof Date ? selectedDate : new Date(selectedDate), 
          'EEEE, MMMM d, yyyy'
        )}</span>
      </div>

      <div className="space-y-6">
        {staff.map((staffMember) => (
          <StaffScheduleCard
            key={staffMember.id}
            staff={staffMember}
            timeSlots={scheduleData[staffMember.id] || []}
            unscheduledTasks={unscheduledTasks}
            onAssignTask={handleAssignTask}
          />
        ))}
      </div>
    </div>
  );
};

export default StaffScheduleView;
