
import React from 'react';
import { Client } from '@/types/client';

interface ClientInfoCardProps {
  client: Client;
}

/**
 * Displays a client's information in a structured format
 */
const ClientInfoCard: React.FC<ClientInfoCardProps> = ({ client }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Client Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <strong>Primary Contact:</strong> {client.primaryContact}
        </div>
        <div>
          <strong>Email:</strong> {client.email}
        </div>
        <div>
          <strong>Phone:</strong> {client.phone}
        </div>
        <div>
          <strong>Billing Address:</strong> {client.billingAddress}
        </div>
        <div>
          <strong>Industry:</strong> {client.industry}
        </div>
        <div>
          <strong>Status:</strong> {client.status}
        </div>
        <div>
          <strong>Expected Monthly Revenue:</strong> ${client.expectedMonthlyRevenue.toLocaleString()}
        </div>
        <div>
          <strong>Payment Terms:</strong> {client.paymentTerms}
        </div>
        <div>
          <strong>Billing Frequency:</strong> {client.billingFrequency}
        </div>
        <div>
          <strong>Default Task Priority:</strong> {client.defaultTaskPriority}
        </div>
      </div>
    </div>
  );
};

export default ClientInfoCard;
