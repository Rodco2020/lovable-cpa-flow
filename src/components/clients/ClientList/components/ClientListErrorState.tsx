
import React from 'react';
import { Button } from '@/components/ui/button';

interface ClientListErrorStateProps {
  onRetry: () => void;
}

export const ClientListErrorState: React.FC<ClientListErrorStateProps> = ({
  onRetry
}) => {
  return (
    <div className="p-4 text-center">
      <p className="text-red-500 mb-2">Error loading clients</p>
      <Button onClick={onRetry}>Retry</Button>
    </div>
  );
};
