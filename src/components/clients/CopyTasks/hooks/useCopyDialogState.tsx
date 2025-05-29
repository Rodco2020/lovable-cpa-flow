
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllClients } from '@/services/clientService';
import { Client } from '@/types/client';

interface CopyDialogStateReturn {
  copyProgress: number;
  sourceClientName_internal: string;
  targetClientName: string;
  adHocTasksCount: number;
  recurringTasksCount: number;
  selectedAdHocTasksCount: number;
  selectedRecurringTasksCount: number;
  clients: Client[];
  isClientsLoading: boolean;
  availableSourceClients: Client[];
  availableTargetClients: Client[];
  displaySourceClientName: string;
}

export const useCopyDialogState = (
  sourceClientId: string | null,
  targetClientId: string | null,
  selectedTaskIds: string[],
  sourceClientName: string,
  step: string
): CopyDialogStateReturn => {
  const [copyProgress, setCopyProgress] = useState(0);
  const [sourceClientName_internal, setSourceClientName_internal] = useState('');
  const [targetClientName, setTargetClientName] = useState('');
  const [adHocTasksCount, setAdHocTasksCount] = useState(0);
  const [recurringTasksCount, setRecurringTasksCount] = useState(0);
  const [selectedAdHocTasksCount, setSelectedAdHocTasksCount] = useState(0);
  const [selectedRecurringTasksCount, setSelectedRecurringTasksCount] = useState(0);

  // Fetch all clients for selection
  const { data: clients = [], isLoading: isClientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: getAllClients,
  });

  // Filter clients for source selection (all active clients)
  const availableSourceClients = Array.isArray(clients) ? 
    clients.filter((client: Client) => client.status === 'Active') : [];

  // Filter clients for target selection (exclude source client)
  const availableTargetClients = Array.isArray(clients) ? 
    clients.filter((client: Client) => 
      client.status === 'Active' && client.id !== sourceClientId
    ) : [];

  // Calculate task counts when selectedTaskIds changes
  useEffect(() => {
    setSelectedAdHocTasksCount(Math.floor(selectedTaskIds.length * 0.6));
    setSelectedRecurringTasksCount(Math.ceil(selectedTaskIds.length * 0.4));
  }, [selectedTaskIds]);

  // Mock progress update for the copying process
  useEffect(() => {
    if (step === 'processing') {
      const interval = setInterval(() => {
        setCopyProgress(prev => {
          const newProgress = prev + 5;
          if (newProgress >= 100) {
            clearInterval(interval);
            return 100;
          }
          return newProgress;
        });
      }, 200);
      
      return () => clearInterval(interval);
    }
    
    setCopyProgress(0);
  }, [step]);

  // Update client names when IDs change
  useEffect(() => {
    if (sourceClientId && Array.isArray(clients)) {
      const client = clients.find((c: Client) => c.id === sourceClientId);
      if (client) {
        setSourceClientName_internal(client.legalName || '');
      }
    }
  }, [sourceClientId, clients]);

  useEffect(() => {
    if (targetClientId && Array.isArray(clients)) {
      const client = clients.find((c: Client) => c.id === targetClientId);
      if (client) {
        setTargetClientName(client.legalName || '');
      }
    }
  }, [targetClientId, clients]);

  // Use provided sourceClientName or internal name
  const displaySourceClientName = sourceClientName || sourceClientName_internal;

  return {
    copyProgress,
    sourceClientName_internal,
    targetClientName,
    adHocTasksCount,
    recurringTasksCount,
    selectedAdHocTasksCount,
    selectedRecurringTasksCount,
    clients,
    isClientsLoading,
    availableSourceClients,
    availableTargetClients,
    displaySourceClientName
  };
};
