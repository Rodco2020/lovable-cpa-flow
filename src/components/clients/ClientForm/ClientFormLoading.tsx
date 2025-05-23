
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

/**
 * ClientFormLoading component
 * 
 * Displays a loading state when client data is being fetched.
 */
const ClientFormLoading: React.FC = () => {
  return (
    <Card className="max-w-4xl mx-auto">
      <CardContent className="pt-6">
        <div className="flex items-center justify-center h-64">
          <p>Loading client data...</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientFormLoading;
