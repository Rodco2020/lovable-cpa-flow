
import React from 'react';
import ClientFormContent from './ClientFormContent';

/**
 * ClientForm component
 * 
 * Main entry point for the client form functionality.
 * This component serves as a wrapper around the actual form implementation,
 * allowing for easier composition and testing.
 */
const ClientForm: React.FC = () => {
  return <ClientFormContent />;
};

export default ClientForm;
