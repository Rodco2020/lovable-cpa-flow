
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ClientSelector from '../clientDetails/ClientSelector';
import ClientTaskDetails from '../clientDetails/ClientTaskDetails';
import ClientDetailsHeader from '../clientDetails/ClientDetailsHeader';

interface ClientDetailsTabProps {
  className?: string;
}

/**
 * Client Details Tab Component
 * Displays client-specific task details and forecasting information
 */
export const ClientDetailsTab: React.FC<ClientDetailsTabProps> = ({ className }) => {
  const [selectedClientId, setSelectedClientId] = React.useState<string | null>(null);

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Client Selection Section */}
        <Card>
          <CardHeader>
            <CardTitle>Client Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientSelector
              selectedClientId={selectedClientId}
              onClientSelect={setSelectedClientId}
            />
          </CardContent>
        </Card>

        {/* Client Details Header - Only show when client is selected */}
        {selectedClientId && (
          <ClientDetailsHeader clientId={selectedClientId} />
        )}

        {/* Client Task Details - Only show when client is selected */}
        {selectedClientId && (
          <ClientTaskDetails clientId={selectedClientId} />
        )}

        {/* Empty State - Show when no client is selected */}
        {!selectedClientId && (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-muted-foreground">
                <h3 className="text-lg font-medium mb-2">Select a Client</h3>
                <p>Choose a client from the dropdown above to view their task details and forecasting information.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ClientDetailsTab;
