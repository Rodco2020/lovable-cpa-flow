
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllClients } from '@/services/clientService';
import { Client } from '@/types/client';

export const useClientListData = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: clients, isLoading, error } = useQuery({
    queryKey: ['clients'],
    queryFn: () => getAllClients(),
  });

  // Filter clients based on search term
  const filteredClients = clients?.filter(client => 
    client.legalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.primaryContact.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.staffLiaisonName && client.staffLiaisonName.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  return {
    clients,
    filteredClients,
    isLoading,
    error,
    searchTerm,
    setSearchTerm
  };
};
