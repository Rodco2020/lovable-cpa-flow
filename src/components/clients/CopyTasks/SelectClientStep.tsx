
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Client } from '@/types/client';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { SelectClientStepProps } from './types';

/**
 * First step of the copy client tasks dialog
 * Allows selecting which client to copy tasks to
 */
export const SelectClientStep: React.FC<{
  availableClients: Client[];
  targetClientId: string;
  setTargetClientId: (id: string) => void;
  isLoading: boolean;
  sourceClientId: string;
  onSelectClient: (id: string) => void;
}> = ({
  availableClients,
  targetClientId,
  setTargetClientId,
  isLoading,
  sourceClientId,
  onSelectClient
}) => {
  const navigate = useNavigate();
  
  // Handle selection change
  const handleValueChange = (id: string) => {
    setTargetClientId(id);
    onSelectClient(id);
  };
  
  // Handle "no clients available" scenario
  const handleCreateNewClient = () => {
    navigate('/clients/new');
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Select the client you want to copy tasks to:
      </p>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : availableClients.length > 0 ? (
        <Select
          value={targetClientId}
          onValueChange={handleValueChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a client" />
          </SelectTrigger>
          <SelectContent>
            {availableClients.map((client: Client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.legalName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <div className="rounded-md bg-yellow-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">No other active clients available</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>You need at least one more active client to copy tasks to.</p>
                <div className="mt-4">
                  <Button size="sm" onClick={handleCreateNewClient}>
                    Create New Client
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
