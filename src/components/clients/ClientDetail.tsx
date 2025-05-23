
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { useClientDetails } from '@/hooks/useClientDetails';
import ClientDetailHeader from './ClientDetailHeader';
import ClientInfoCard from './ClientInfoCard';
import ClientTasksSection from './ClientTasksSection';

/**
 * Client detail view component
 * Displays client information and manages related tasks
 */
const ClientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { client, isLoading, refreshClient, handleDelete } = useClientDetails(id);
  
  if (isLoading) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-64">
            <p>Loading client details...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!client) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-64">
            <p>Client not found.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <ClientDetailHeader 
          clientName={client.legalName} 
          clientId={client.id}
          onDelete={handleDelete}
        />
        <CardDescription>
          View client details and manage related tasks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ClientInfoCard client={client} />
        <ClientTasksSection 
          clientId={client.id} 
          clientName={client.legalName}
          onRefreshClient={refreshClient} 
        />
      </CardContent>
    </Card>
  );
};

export default ClientDetail;
