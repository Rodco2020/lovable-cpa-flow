
import React from 'react';
import { Input } from '@/components/ui/input';

interface ClientListSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  totalClients: number;
  filteredCount: number;
}

export const ClientListSearchBar: React.FC<ClientListSearchBarProps> = ({
  searchTerm,
  onSearchChange,
  totalClients,
  filteredCount
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <Input
        placeholder="Search clients..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="max-w-sm"
      />
      <div className="text-sm text-muted-foreground">
        {filteredCount} of {totalClients} clients
      </div>
    </div>
  );
};
