
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Building2, User } from 'lucide-react';
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
  const [filterStatus, setFilterStatus] = useState('');

  // Filter clients based on search and filters
  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const matchesSearch = searchTerm === '' ||
        client.legalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.primaryContact?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesIndustry = filterIndustry === '' || client.industry === filterIndustry;
      const matchesStatus = filterStatus === '' || client.status === filterStatus;
      
      return matchesSearch && matchesIndustry && matchesStatus;
    });
  }, [clients, searchTerm, filterIndustry, filterStatus]);

  // Get unique industries and statuses for filters
  const industries = useMemo(() => [...new Set(clients.map(c => c.industry).filter(Boolean))], [clients]);
  const statuses = useMemo(() => [...new Set(clients.map(c => c.status).filter(Boolean))], [clients]);

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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Select Clients
          </CardTitle>
          
          {/* Search and Filter Controls */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients by name, industry, or contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterIndustry} onValueChange={setFilterIndustry}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Industries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Industries</SelectItem>
                {industries.map(industry => (
                  <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                {statuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Results count */}
          {(searchTerm || filterIndustry || filterStatus) && (
            <div className="mb-3 text-sm text-muted-foreground">
              Showing {filteredClients.length} of {clients.length} clients
            </div>
          )}
          
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {filteredClients.map((client) => {
              const isSelected = selectedClientIds.includes(client.id);
              
              return (
                <div
                  key={client.id}
                  className={`flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => handleClientToggle(client.id)}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleClientToggle(client.id)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{client.legalName}</div>
                      {isSelected && (
                        <Badge variant="default" className="text-xs">Selected</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      {client.industry && (
                        <>
                          <span>{client.industry}</span>
                          <span>•</span>
                        </>
                      )}
                      <span>{client.status}</span>
                      {client.primaryContact && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{client.primaryContact}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredClients.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || filterIndustry || filterStatus
                ? 'No clients found matching your criteria'
                : 'No clients available'
              }
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
