
import { useState, useMemo } from 'react';
import type { Client } from '../types';

export const useClientSearch = (clients: Client[]) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Enhanced search filtering with debugging
  const filteredClients = useMemo(() => {
    if (!searchTerm) {
      console.log('🔍 ClientFilterSection: No search term, showing all active clients:', clients.length);
      return clients;
    }
    
    const filtered = clients.filter(client =>
      client.legal_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.industry?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    console.log('🔍 ClientFilterSection: Search filtered results:', {
      searchTerm,
      filteredCount: filtered.length,
      totalActiveClients: clients.length
    });
    
    return filtered;
  }, [clients, searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    filteredClients
  };
};
