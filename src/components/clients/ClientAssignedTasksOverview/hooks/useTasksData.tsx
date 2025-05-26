
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { FormattedTask } from '../types';
import { Client } from '@/types/client';
import { 
  getClientRecurringTasks, 
  getClientAdHocTasks,
  getAllClients
} from '@/services/clientService';

export const useTasksData = () => {
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [formattedTasks, setFormattedTasks] = useState<FormattedTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [availablePriorities, setAvailablePriorities] = useState<string[]>([]);

  const fetchClientsAndTasks = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch all clients first
      const fetchedClients = await getAllClients();
      setClients(fetchedClients);
      
      const allFormattedTasks: FormattedTask[] = [];
      const skills = new Set<string>();
      const priorities = new Set<string>();
      
      // Fetch tasks for each client
      for (const client of fetchedClients) {
        // Get recurring tasks
        const recurringTasks = await getClientRecurringTasks(client.id);
        
        // Format recurring tasks
        const formattedRecurringTasks: FormattedTask[] = recurringTasks.map(task => {
          // Add skills and priorities to sets for filter options
          task.requiredSkills.forEach(skill => skills.add(skill));
          priorities.add(task.priority);
          
          return {
            id: task.id,
            clientId: client.id,
            clientName: client.legalName,
            taskName: task.name,
            taskType: 'Recurring',
            dueDate: task.dueDate,
            recurrencePattern: task.recurrencePattern,
            estimatedHours: task.estimatedHours,
            requiredSkills: task.requiredSkills,
            priority: task.priority,
            status: task.status,
            isActive: task.isActive
          };
        });
        
        // Get ad-hoc tasks
        const adHocTasks = await getClientAdHocTasks(client.id);
        
        // Format ad-hoc tasks
        const formattedAdHocTasks: FormattedTask[] = adHocTasks.map(task => {
          // Add skills and priorities to sets for filter options
          task.requiredSkills.forEach(skill => skills.add(skill));
          priorities.add(task.priority);
          
          return {
            id: task.id,
            clientId: client.id,
            clientName: client.legalName,
            taskName: task.name,
            taskType: 'Ad-hoc',
            dueDate: task.dueDate,
            estimatedHours: task.estimatedHours,
            requiredSkills: task.requiredSkills,
            priority: task.priority,
            status: task.status
          };
        });
        
        // Add all tasks to the array
        allFormattedTasks.push(...formattedRecurringTasks, ...formattedAdHocTasks);
      }
      
      // Sort tasks by due date (ascending)
      allFormattedTasks.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.getTime() - b.dueDate.getTime();
      });
      
      setFormattedTasks(allFormattedTasks);
      setAvailableSkills(Array.from(skills));
      setAvailablePriorities(Array.from(priorities));
      
      console.log('Loaded tasks:', allFormattedTasks.length);
    } catch (error) {
      console.error('Error fetching clients and tasks:', error);
      setError('Failed to load client tasks');
      toast({
        title: "Error",
        description: "There was an error loading client tasks",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditComplete = () => {
    fetchClientsAndTasks();
    toast({
      title: "Success",
      description: "Task updated successfully",
    });
  };

  useEffect(() => {
    fetchClientsAndTasks();
  }, []);

  return {
    clients,
    formattedTasks,
    isLoading,
    error,
    availableSkills,
    availablePriorities,
    handleEditComplete
  };
};
