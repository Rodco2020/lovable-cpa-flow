
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ClientFormValues } from '@/hooks/useClientForm';
import { LegalNameField } from './BasicFields/LegalNameField';
import { PrimaryContactField } from './BasicFields/PrimaryContactField';
import { ContactInfoFields } from './BasicFields/ContactInfoFields';
import { BillingAddressField } from './BasicFields/BillingAddressField';
import { IndustryStatusFields } from './BasicFields/IndustryStatusFields';

interface BasicInformationSectionProps {
  form: UseFormReturn<ClientFormValues>;
}

/**
 * Basic information section of the client form
 * 
 * Contains fields for client name, contact info, address, industry and status
 * 
 * This is now a composition of smaller components that handle each field or field group,
 * making the code more maintainable and testable.
 */
const BasicInformationSection: React.FC<BasicInformationSectionProps> = ({ form }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Basic Information</h3>
      
      <LegalNameField form={form} />
      <PrimaryContactField form={form} />
      <ContactInfoFields form={form} />
      <BillingAddressField form={form} />
      <IndustryStatusFields form={form} />
    </div>
  );
};

export default BasicInformationSection;
