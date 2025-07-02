
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Client } from '@/types/client';
import { StaffOption } from '@/types/staffOption';
import { FormattedTask } from '../types';
import { OptimizedTaskDataService } from '../services/optimizedTaskDataService';
import { TaskDataUtils } from '../utils/taskDataUtils';
import { SkillDeduplicationService } from '../services/skillDeduplicationService';
import { getActiveStaffForDropdown } from '@/services/staff/staffDropdownService';

/**
 * Hook to manage the data fetching process for clients and tasks
 * Handles loading states, error handling, and data transformation
 * Now uses optimized staff dropdown service for better performance
 */
export const useTaskDataFetching = () => {
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [formattedTasks, setFormattedTasks] = useState<FormattedTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [availablePriorities, setAvailablePriorities] = useState<string[]>([]);

  // Fetch staff options using the optimized dropdown service
  const { data: staffOptions = [], isLoading: isStaffLoading } = useQuery({
    queryKey: ['staff-dropdown-options'],
    queryFn: getActiveStaffForDropdown,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 10 * 60 * 1000, // 10 minutes cache (renamed from cacheTime)
  });

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('[Phase 1] Starting optimized data fetch using single queries...');
      
      // Phase 1: Use optimized service that fetches all data with 2 queries instead of 220+
      const { 
        formattedTasks: allTasks, 
        skills, 
        priorities, 
        clients: fetchedClients 
      } = await OptimizedTaskDataService.fetchAllClientTasks();
      
      setClients(fetchedClients);
      
      // Sort tasks by due date
      const sortedTasks = TaskDataUtils.sortTasksByDueDate(allTasks);
      
      // Validate data integrity
      if (!TaskDataUtils.validateTaskData(sortedTasks)) {
        console.warn('Some task data validation issues detected');
      }
      
      // Convert sets to arrays for state
      const skillsArray = Array.from(skills);
      const prioritiesArray = Array.from(priorities);
      
      // Update state
      setFormattedTasks(sortedTasks);
      setAvailableSkills(skillsArray);
      setAvailablePriorities(prioritiesArray);
      
      // Log performance metrics
      console.log(`[Phase 1] Successfully loaded ${sortedTasks.length} tasks from ${fetchedClients.length} clients`);
      console.log(`[Phase 1] Found ${skillsArray.length} unique skills and ${prioritiesArray.length} unique priorities`);
      console.log('[Phase 1] Performance improvement: Reduced from 220+ queries to 2 optimized queries');
      
      // Log statistics for debugging
      TaskDataUtils.logTaskStatistics(sortedTasks);
      
    } catch (error) {
      console.error('[Phase 1] Error fetching optimized data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load client tasks';
      setError(errorMessage);
      toast({
        title: "Error",
        description: "There was an error loading client tasks",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchData();
    toast({
      title: "Success",
      description: "Task updated successfully",
    });
  };

  return {
    clients,
    formattedTasks,
    isLoading: isLoading || isStaffLoading,
    error,
    availableSkills,
    availablePriorities,
    staffOptions,
    fetchData,
    handleRefresh
  };
};
