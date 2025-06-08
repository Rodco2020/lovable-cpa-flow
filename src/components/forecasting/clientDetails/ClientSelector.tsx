
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import type { Client } from '@/types/client';

interface ClientSelectorProps {
  selectedClientId: string | null;
  onClientSelect: (clientId: string | null) => void;
}

/**
 * Client Selector Component
 * Provides a dropdown for selecting clients using existing client services
 */
const ClientSelector: React.FC<ClientSelectorProps> = ({
  selectedClientId,
  onClientSelect
}) => {
  // Fetch active clients using existing Supabase client
  const {
    data: clients,
    isLoading,
    error
  } = useQuery({
    queryKey: ['clients', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, legal_name, status')
        .eq('status', 'Active')
        .order('legal_name');

      if (error) throw error;
      return data as Pick<Client, 'id' | 'legal_name' | 'status'>[];
    }
  });

  const handleValueChange = (value: string) => {
    if (value === 'none') {
      onClientSelect(null);
    } else {
      onClientSelect(value);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="client-select">Select Client</Label>
      <Select 
        value={selectedClientId || 'none'} 
        onValueChange={handleValueChange}
      >
        <SelectTrigger id="client-select" className="w-full">
          <SelectValue placeholder={isLoading ? "Loading clients..." : "Choose a client"} />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <SelectItem value="loading" disabled>
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading clients...
              </div>
            </SelectItem>
          ) : error ? (
            <SelectItem value="error" disabled>
              Error loading clients
            </SelectItem>
          ) : (
            <>
              <SelectItem value="none">Select a client...</SelectItem>
              {clients?.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.legal_name}
                </SelectItem>
              ))}
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ClientSelector;
