
import React, { useMemo, useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';
import { Client } from '@/types/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PerformanceOptimizedClientListProps {
  clients: Client[];
  selectedClientId?: string;
  onSelectClient: (clientId: string) => void;
  excludeClientId?: string;
  maxHeight?: number;
}

interface ClientRowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    filteredClients: Client[];
    selectedClientId?: string;
    onSelectClient: (clientId: string) => void;
    excludeClientId?: string;
  };
}

const ClientRow: React.FC<ClientRowProps> = ({ index, style, data }) => {
  const { filteredClients, selectedClientId, onSelectClient, excludeClientId } = data;
  const client = filteredClients[index];
  
  if (!client) return null;

  const isSelected = selectedClientId === client.id;
  const isExcluded = excludeClientId === client.id;
  
  return (
    <div style={style} className="px-2 py-1">
      <Card 
        className={`cursor-pointer transition-all duration-200 ${
          isExcluded 
            ? 'opacity-50 cursor-not-allowed bg-gray-100' 
            : isSelected
            ? 'ring-2 ring-blue-500 bg-blue-50' 
            : 'hover:bg-accent hover:shadow-md'
        }`}
        onClick={() => !isExcluded && onSelectClient(client.id)}
      >
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">{client.legalName}</h4>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {client.status}
                </Badge>
                {client.industry && (
                  <span className="text-xs text-muted-foreground truncate">
                    {client.industry}
                  </span>
                )}
              </div>
            </div>
            {isExcluded && (
              <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
                Source
              </Badge>
            )}
            {isSelected && !isExcluded && (
              <Badge variant="outline" className="text-xs text-blue-600 border-blue-300">
                Selected
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const PerformanceOptimizedClientList: React.FC<PerformanceOptimizedClientListProps> = ({
  clients,
  selectedClientId,
  onSelectClient,
  excludeClientId,
  maxHeight = 400
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const matchesSearch = client.legalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           client.industry?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [clients, searchTerm, statusFilter]);

  const itemData = useMemo(() => ({
    filteredClients,
    selectedClientId,
    onSelectClient,
    excludeClientId
  }), [filteredClients, selectedClientId, onSelectClient, excludeClientId]);

  const uniqueStatuses = useMemo(() => {
    const statuses = [...new Set(clients.map(c => c.status))];
    return ['all', ...statuses];
  }, [clients]);

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients by name or industry..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex space-x-1">
            {uniqueStatuses.map(status => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className="text-xs"
              >
                {status === 'all' ? 'All' : status}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="text-xs text-muted-foreground flex justify-between">
        <span>Showing {filteredClients.length} of {clients.length} clients</span>
        {excludeClientId && (
          <span>Source client excluded from selection</span>
        )}
      </div>

      {/* Virtualized Client List */}
      {filteredClients.length > 0 ? (
        <List
          height={maxHeight}
          itemCount={filteredClients.length}
          itemSize={80}
          itemData={itemData}
          className="border rounded-md"
        >
          {ClientRow}
        </List>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No clients found matching your criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
