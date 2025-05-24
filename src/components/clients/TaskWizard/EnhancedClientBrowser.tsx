
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Building2, Calendar, BarChart3 } from 'lucide-react';
import { Client } from '@/types/client';
import { ClientPreview } from './types';

interface EnhancedClientBrowserProps {
  clients: Client[];
  onSelectClient: (clientId: string) => void;
  selectedClientId?: string;
  isLoading?: boolean;
}

export const EnhancedClientBrowser: React.FC<EnhancedClientBrowserProps> = ({
  clients,
  onSelectClient,
  selectedClientId,
  isLoading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('');

  // Filter clients based on search and industry
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.legalName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = !filterIndustry || client.industry === filterIndustry;
    return matchesSearch && matchesIndustry;
  });

  // Get unique industries for filter dropdown
  const industries = [...new Set(clients.map(client => client.industry))];

  const getClientPreview = (client: Client): ClientPreview => ({
    id: client.id,
    name: client.legalName,
    taskCount: 0, // This would be populated from actual task data
    lastActivity: new Date(client.updatedAt),
    industry: client.industry
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
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

      {/* Client Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
        {filteredClients.map(client => {
          const preview = getClientPreview(client);
          const isSelected = selectedClientId === client.id;
          
          return (
            <Card 
              key={client.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-primary border-primary' : ''
              }`}
              onClick={() => onSelectClient(client.id)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span className="truncate">{preview.name}</span>
                  {isSelected && (
                    <Badge variant="default" className="ml-2">
                      Selected
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4 mr-2" />
                    {preview.industry}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    {preview.taskCount} tasks
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    Updated {preview.lastActivity.toLocaleDateString()}
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
