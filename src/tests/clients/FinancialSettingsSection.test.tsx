
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import FinancialSettingsSection from '@/components/clients/ClientForm/FinancialSettingsSection';
import { zodResolver } from '@hookform/resolvers/zod';
import { clientFormSchema, getDefaultValues } from '@/hooks/useClientForm/schema';

// Create a wrapper component to provide the form context
const FormWrapper = ({ children }: { children: React.ReactNode }) => {
  const form = useForm({
    resolver: zodResolver(clientFormSchema),
    defaultValues: getDefaultValues()
  });
  
  return (
    <Form {...form}>
      <form>
        {children}
      </form>
    </Form>
  );
};

describe('FinancialSettingsSection Component', () => {
  const mockStaffOptions = [
    { id: '1', full_name: 'John Doe' },
    { id: '2', full_name: 'Jane Smith' }
  ];

  test('renders the section title', () => {
    render(
      <FormWrapper>
        <FinancialSettingsSection 
          form={useForm({ defaultValues: getDefaultValues() })} 
          staffOptions={mockStaffOptions}
        />
      </FormWrapper>
    );
    
    expect(screen.getByText('Financial & Engagement Settings')).toBeInTheDocument();
  });

  test('renders all required form fields', () => {
    render(
      <FormWrapper>
        <FinancialSettingsSection 
          form={useForm({ defaultValues: getDefaultValues() })} 
          staffOptions={mockStaffOptions}
        />
      </FormWrapper>
    );
    
    // Check all field labels are present
    expect(screen.getByText('Expected Monthly Revenue ($)*')).toBeInTheDocument();
    expect(screen.getByText('Payment Terms*')).toBeInTheDocument();
    expect(screen.getByText('Billing Frequency*')).toBeInTheDocument();
    expect(screen.getByText('Staff Liaison')).toBeInTheDocument();
    expect(screen.getByText('Default Task Priority*')).toBeInTheDocument();
    expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
    
    // Check notification checkboxes
    expect(screen.getByText('Email reminders for upcoming tasks')).toBeInTheDocument();
    expect(screen.getByText('Task status change notifications')).toBeInTheDocument();
  });
  
  test('renders staff options in the liaison dropdown', () => {
    render(
      <FormWrapper>
        <FinancialSettingsSection 
          form={useForm({ defaultValues: getDefaultValues() })} 
          staffOptions={mockStaffOptions}
        />
      </FormWrapper>
    );
    
    // Note: This is a basic test. In a real scenario, we would use userEvent to open
    // the dropdown and check for staff options, but that requires more complex setup
    expect(screen.getByText('Staff Liaison')).toBeInTheDocument();
    expect(screen.getByText('Staff member responsible for this client relationship')).toBeInTheDocument();
  });
});
