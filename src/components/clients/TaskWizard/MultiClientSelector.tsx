
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Search, Building2, DollarSign, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { Client } from '@/types/client';

interface MultiClientSelectorProps {
  clients: Client[];
  selectedClientIds: string[];
  onSelectionChange: (clientIds: string[]) => void;
  maxSelections?: number;
  isLoading?: boolean;
}

export const MultiClientSelector: React.FC<MultiClientSelectorProps> = ({
  clients,
  selectedClientIds,
  onSelectionChange,
  maxSelections,
  isLoading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('');
  const [filterStatus, setFilterStatus] = useState('Active');

  // Filter and search clients
  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const matchesSearch = client.legalName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesIndustry = !filterIndustry || client.industry === filterIndustry;
      const matchesStatus = !filterStatus || client.status === filterStatus;
      return matchesSearch && matchesIndustry && matchesStatus;
    });
  }, [clients, searchTerm, filterIndustry, filterStatus]);

  // Get unique industries for filter
  const industries = useMemo(() => {
    return [...new Set(clients.map(client => client.industry))];
  }, [clients]);

  const handleClientToggle = (clientId: string) => {
    const isCurrentlySelected = selectedClientIds.includes(clientId);
    
    if (isCurrentlySelected) {
      onSelectionChange(selectedClientIds.filter(id => id !== clientId));
    } else {
      if (maxSelections && selectedClientIds.length >= maxSelections) {
        return; // Don't allow more selections
      }
      onSelectionChange([...selectedClientIds, clientId]);
    }
  };

  const handleSelectAll = () => {
    const filteredIds = filteredClients.map(client => client.id);
    const allSelected = filteredIds.every(id => selectedClientIds.includes(id));
    
    if (allSelected) {
      // Deselect all filtered clients
      onSelectionChange(selectedClientIds.filter(id => !filteredIds.includes(id)));
    } else {
      // Select all filtered clients (respecting max limit)
      const newSelections = [...selectedClientIds];
      filteredIds.forEach(id => {
        if (!newSelections.includes(id)) {
          if (!maxSelections || newSelections.length < maxSelections) {
            newSelections.push(id);
          }
        }
      });
      onSelectionChange(newSelections);
    }
  };

  const clearSelection = () => {
    onSelectionChange([]);
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

  const isMaxReached = maxSelections && selectedClientIds.length >= maxSelections;

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
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background"
        >
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Bulk Actions */}
      <div className="flex items-center justify-between p-3 bg-muted rounded-md">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={filteredClients.length > 0 && filteredClients.every(client => selectedClientIds.includes(client.id))}
              onCheckedChange={handleSelectAll}
              disabled={isMaxReached && filteredClients.some(client => !selectedClientIds.includes(client.id))}
            />
            <span className="text-sm font-medium">
              Select All ({filteredClients.length})
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={clearSelection}>
            Clear Selection
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <Users className="h-3 w-3" />
            <span>{selectedClientIds.length} selected</span>
          </Badge>
          {maxSelections && (
            <Badge variant={isMaxReached ? "destructive" : "secondary"}>
              {selectedClientIds.length}/{maxSelections}
            </Badge>
          )}
        </div>
      </div>

      {/* Selection Status */}
      {isMaxReached && (
        <div className="flex items-center space-x-2 p-3 bg-orange-50 border border-orange-200 rounded-md">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <span className="text-sm text-orange-600">
            Maximum selection limit reached ({maxSelections})
          </span>
        </div>
      )}

      {/* Client List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredClients.map(client => {
          const isSelected = selectedClientIds.includes(client.id);
          const canSelect = !isMaxReached || isSelected;
          
          return (
            <Card 
              key={client.id}
              className={`cursor-pointer transition-all hover:shadow-sm ${
                isSelected ? 'ring-2 ring-primary border-primary bg-primary/5' : ''
              } ${!canSelect ? 'opacity-50' : ''}`}
              onClick={() => canSelect && handleClientToggle(client.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => canSelect && handleClientToggle(client.id)}
                      disabled={!canSelect}
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{client.legalName}</h4>
                        {isSelected && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
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
                        <Badge variant="outline" size="sm">
                          {client.status}
                        </Badge>
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
          No clients found matching your criteria
        </div>
      )}
    </div>
  );
};
