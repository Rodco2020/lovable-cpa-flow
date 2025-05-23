
import React from 'react';
import { render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { LegalNameField } from '@/components/clients/ClientForm/BasicFields/LegalNameField';
import { clientFormSchema, getDefaultValues } from '@/hooks/useClientForm/schema';
import type { ClientFormValues } from '@/hooks/useClientForm';

describe('LegalNameField Component', () => {
  const mockForm = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: getDefaultValues()
  });

  test('renders field with label and input correctly', () => {
    render(
      <Form {...mockForm}>
        <form>
          <LegalNameField form={mockForm} />
        </form>
      </Form>
    );

    expect(screen.getByText('Legal Name*')).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter client's legal name")).toBeInTheDocument();
  });
});
