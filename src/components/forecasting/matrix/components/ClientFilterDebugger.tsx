
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Debug component to monitor client data and status distribution
 * This component provides visibility into the client database state
 */
export const ClientFilterDebugger: React.FC = () => {
  const { data: debugData, isLoading } = useQuery({
    queryKey: ['client-filter-debug'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, legal_name, status')
        .order('legal_name');
      
      if (error) throw error;
      
      const statusCounts = data?.reduce((acc, client) => {
        const status = client.status || 'null';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};
      
      const activeClients = data?.filter(c => c.status?.toLowerCase() === 'active') || [];
      
      return {
        totalClients: data?.length || 0,
        statusCounts,
        activeClients: activeClients.length,
        sampleClients: data?.slice(0, 5) || [],
        uniqueStatuses: Object.keys(statusCounts)
      };
    },
    refetchInterval: 10000 // Refresh every 10 seconds
  });

  if (isLoading) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-blue-700">Client Filter Debugger</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-blue-600">Loading debug data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-blue-700">Client Filter Debugger</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium text-blue-700">Total Clients:</div>
            <div className="text-blue-600">{debugData?.totalClients || 0}</div>
          </div>
          <div>
            <div className="font-medium text-blue-700">Active Clients:</div>
            <div className="text-blue-600">{debugData?.activeClients || 0}</div>
          </div>
        </div>
        
        <div>
          <div className="font-medium text-blue-700 mb-2">Status Distribution:</div>
          <div className="flex flex-wrap gap-1">
            {Object.entries(debugData?.statusCounts || {}).map(([status, count]) => (
              <Badge 
                key={status} 
                variant={status.toLowerCase() === 'active' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {status}: {count}
              </Badge>
            ))}
          </div>
        </div>
        
        {debugData?.sampleClients && debugData.sampleClients.length > 0 && (
          <div>
            <div className="font-medium text-blue-700 mb-2">Sample Clients:</div>
            <div className="space-y-1 text-xs">
              {debugData.sampleClients.map(client => (
                <div key={client.id} className="flex justify-between">
                  <span className="truncate">{client.legal_name}</span>
                  <Badge variant="outline" className="text-xs">
                    {client.status || 'null'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
