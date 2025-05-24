
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Building2, DollarSign } from 'lucide-react';
import { Client } from '@/types/client';

interface ClientSelectorForTemplatesProps {
  clients: Client[];
  onSelectClients: (clientIds: string[]) => void;
  selectedClientIds: string[];
  isLoading?: boolean;
  allowMultiple?: boolean;
}

export const ClientSelectorForTemplates: React.FC<ClientSelectorForTemplatesProps> = ({
  clients,
  onSelectClients,
  selectedClientIds,
  isLoading = false,
  allowMultiple = true
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('');

  // Filter clients based on search and industry
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.legalName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = !filterIndustry || client.industry === filterIndustry;
    return matchesSearch && matchesIndustry && client.status === 'Active';
  });

  // Get unique industries for filter dropdown
  const industries = [...new Set(clients.map(client => client.industry))];

  const handleClientToggle = (clientId: string) => {
    if (allowMultiple) {
      const newSelection = selectedClientIds.includes(clientId)
        ? selectedClientIds.filter(id => id !== clientId)
        : [...selectedClientIds, clientId];
      onSelectClients(newSelection);
    } else {
      onSelectClients([clientId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedClientIds.length === filteredClients.length) {
      onSelectClients([]);
    } else {
      onSelectClients(filteredClients.map(client => client.id));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={filterIndustry}
          onChange={(e) => setFilterIndustry(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background"
        >
          <option value="">All Industries</option>
          {industries.map(industry => (
            <option key={industry} value={industry}>{industry}</option>
          ))}
        </select>
      </div>

      {/* Bulk Actions */}
      {allowMultiple && filteredClients.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-muted rounded-md">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={selectedClientIds.length === filteredClients.length}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm font-medium">Select All ({filteredClients.length})</span>
          </div>
          <Badge variant="outline">
            {selectedClientIds.length} selected
          </Badge>
        </div>
      )}

      {/* Client List */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {filteredClients.map(client => {
          const isSelected = selectedClientIds.includes(client.id);
          
          return (
            <Card 
              key={client.id}
              className={`cursor-pointer transition-all hover:shadow-sm ${
                isSelected ? 'ring-2 ring-primary border-primary' : ''
              }`}
              onClick={() => handleClientToggle(client.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {allowMultiple && (
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleClientToggle(client.id)}
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{client.legalName}</h4>
                        {isSelected && !allowMultiple && (
                          <Badge variant="default">Selected</Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center">
                          <Building2 className="h-3 w-3 mr-1" />
                          {client.industry}
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-3 w-3 mr-1" />
                          ${client.expectedMonthlyRevenue?.toLocaleString() || '0'}/mo
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No active clients found matching your criteria
        </div>
      )}
    </div>
  );
};
