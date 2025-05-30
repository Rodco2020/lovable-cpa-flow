
import React from 'react';
import { Button } from '@/components/ui/button';
import { Building, PlusCircle } from 'lucide-react';

interface ClientListEmptyStateProps {
  hasClients: boolean;
  onAddClient: () => void;
}

export const ClientListEmptyState: React.FC<ClientListEmptyStateProps> = ({
  hasClients,
  onAddClient
}) => {
  return (
    <div className="text-center py-8">
      <Building className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
      <h3 className="mt-2 text-lg font-semibold">No clients found</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {hasClients ? 'Try adjusting your search.' : 'Get started by adding your first client.'}
      </p>
      <Button onClick={onAddClient}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Add New Client
      </Button>
    </div>
  );
};
