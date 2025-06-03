
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Client } from '@/types/client';
import { StaffOption } from '@/types/staffOption';
import { FormattedTask } from '../types';
import { TaskDataService } from '../services/taskDataService';
import { TaskDataUtils } from '../utils/taskDataUtils';
import { SkillDeduplicationService } from '../services/skillDeduplicationService';
import { getStaffForLiaisonDropdown } from '@/services/client/staffLiaisonService';

/**
 * Hook to manage the data fetching process for clients and tasks
 * Handles loading states, error handling, and data transformation
 * Now includes staff options fetching for staff liaison filtering
 */
export const useTaskDataFetching = () => {
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [formattedTasks, setFormattedTasks] = useState<FormattedTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [availablePriorities, setAvailablePriorities] = useState<string[]>([]);

  // Fetch staff options for staff liaison filtering
  const { data: staffOptions = [], isLoading: isStaffLoading } = useQuery({
    queryKey: ['staff-liaison-dropdown'],
    queryFn: getStaffForLiaisonDropdown,
    staleTime: 10 * 60 * 1000, // 10 minutes cache
  });

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch clients first
      const fetchedClients = await TaskDataService.fetchClients();
      setClients(fetchedClients);
      
      // Fetch all tasks for all clients
      const { formattedTasks: allTasks } = 
        await TaskDataService.fetchAllClientTasks(fetchedClients);
      
      // Sort tasks by due date
      const sortedTasks = TaskDataUtils.sortTasksByDueDate(allTasks);
      
      // Validate data integrity
      if (!TaskDataUtils.validateTaskData(sortedTasks)) {
        console.warn('Some task data validation issues detected');
      }
      
      // Generate filter options using the new deduplication service
      console.log('Using SkillDeduplicationService for filter options');
      const filterOptions = SkillDeduplicationService.generateFilterOptions(sortedTasks);
      
      // Update state with properly deduplicated filter options
      setFormattedTasks(sortedTasks);
      setAvailableSkills(filterOptions.skills);
      setAvailablePriorities(filterOptions.priorities);
      
      // Log statistics for debugging
      TaskDataUtils.logTaskStatistics(sortedTasks);
      console.log('Filter options generated:', {
        skillsCount: filterOptions.skills.length,
        prioritiesCount: filterOptions.priorities.length,
        clientsCount: filterOptions.clients.length,
        validation: filterOptions.validation
      });
      
    } catch (error) {
      console.error('Error fetching clients and tasks:', error);
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
