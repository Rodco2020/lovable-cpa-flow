
import { useState, useEffect } from 'react';
import { TaskTemplate } from '@/types/task';
import { Client } from '@/types/client';
import { getTaskTemplates } from '@/services/taskService';
import { getAllClients } from '@/services/clientService';
import { toast } from 'sonner';

/**
 * Custom hook for loading task form data (templates and clients)
 * Handles the initial data fetching and loading states
 */
export const useTaskFormData = () => {
  const [taskTemplates, setTaskTemplates] = useState<TaskTemplate[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Fetches templates and clients data from API
   */
  const loadResources = async () => {
    setIsLoading(true);
    try {
      // Load both resources in parallel for better performance
      const [templateData, clientData] = await Promise.all([
        getTaskTemplates(),
        getAllClients()
      ]);
      
      setTaskTemplates(templateData);
      setClients(clientData);
    } catch (error) {
      console.error('Error loading resources:', error);
      toast.error("Failed to load necessary data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Load task templates and clients when hook mounts
   */
  useEffect(() => {
    loadResources();
  }, []);

  return {
    taskTemplates,
    clients,
    isLoading,
    loadResources
  };
};
