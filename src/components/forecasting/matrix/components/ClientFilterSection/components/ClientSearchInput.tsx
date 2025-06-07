
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ClientSearchInputProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export const ClientSearchInput: React.FC<ClientSearchInputProps> = ({
  searchTerm,
  onSearchChange
}) => {
  return (
    <div className="relative">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search clients..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-8 text-sm"
      />
    </div>
  );
};
