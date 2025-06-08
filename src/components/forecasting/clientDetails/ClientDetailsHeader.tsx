
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Building2, Mail, Phone, DollarSign } from 'lucide-react';
import type { Client } from '@/types/client';

interface ClientDetailsHeaderProps {
  clientId: string;
}

// Type for the raw database response
interface DatabaseClient {
  id: string;
  legal_name: string;
  primary_contact: string;
  email: string;
  phone: string;
  industry: string;
  status: string;
  expected_monthly_revenue: number;
  billing_frequency: string;
  payment_terms: string;
  billing_address: string;
  default_task_priority: string;
  staff_liaison_id?: string | null;
  notification_preferences: {
    emailReminders: boolean;
    taskNotifications: boolean;
  };
  created_at: string;
  updated_at: string;
}

// Helper function to map database response to Client type
const mapDatabaseClientToClient = (dbClient: DatabaseClient): Client => ({
  id: dbClient.id,
  legalName: dbClient.legal_name,
  primaryContact: dbClient.primary_contact,
  email: dbClient.email,
  phone: dbClient.phone,
  billingAddress: dbClient.billing_address,
  industry: dbClient.industry as Client['industry'],
  status: dbClient.status as Client['status'],
  expectedMonthlyRevenue: dbClient.expected_monthly_revenue,
  paymentTerms: dbClient.payment_terms as Client['paymentTerms'],
  billingFrequency: dbClient.billing_frequency as Client['billingFrequency'],
  defaultTaskPriority: dbClient.default_task_priority,
  staffLiaisonId: dbClient.staff_liaison_id,
  notificationPreferences: dbClient.notification_preferences,
  createdAt: new Date(dbClient.created_at),
  updatedAt: new Date(dbClient.updated_at)
});

/**
 * Client Details Header Component
 * Displays client information and basic controls
 */
const ClientDetailsHeader: React.FC<ClientDetailsHeaderProps> = ({ clientId }) => {
  // Fetch client details
  const {
    data: client,
    isLoading,
    error
  } = useQuery({
    queryKey: ['client', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select(`
          id,
          legal_name,
          primary_contact,
          email,
          phone,
          billing_address,
          industry,
          status,
          expected_monthly_revenue,
          billing_frequency,
          payment_terms,
          default_task_priority,
          staff_liaison_id,
          notification_preferences,
          created_at,
          updated_at
        `)
        .eq('id', clientId)
        .single();

      if (error) throw error;
      return mapDatabaseClientToClient(data as DatabaseClient);
    },
    enabled: !!clientId
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading client details...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !client) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="text-center text-destructive">
            Error loading client details
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {client.legalName}
          </CardTitle>
          <Badge variant={client.status === 'Active' ? 'default' : 'secondary'}>
            {client.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Contact Information */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Contact Information</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">{client.primaryContact}</span>
              </div>
              {client.email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  {client.email}
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  {client.phone}
                </div>
              )}
            </div>
          </div>

          {/* Business Information */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Business Details</h4>
            <div className="space-y-1">
              <div className="text-sm">
                <span className="font-medium">Industry:</span> {client.industry}
              </div>
              <div className="text-sm">
                <span className="font-medium">Billing:</span> {client.billingFrequency}
              </div>
              <div className="text-sm">
                <span className="font-medium">Terms:</span> {client.paymentTerms}
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Financial Overview</h4>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-lg font-semibold">
                ${client.expectedMonthlyRevenue?.toLocaleString() || '0'}
              </span>
              <span className="text-sm text-muted-foreground">/month</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientDetailsHeader;
