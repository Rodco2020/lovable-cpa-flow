
import React from 'react';
import { render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { IndustryStatusFields } from '@/components/clients/ClientForm/BasicFields/IndustryStatusFields';
import { clientFormSchema, getDefaultValues } from '@/hooks/useClientForm/schema';
import type { ClientFormValues } from '@/hooks/useClientForm';

describe('IndustryStatusFields Component', () => {
  const mockForm = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: getDefaultValues()
  });

  test('renders industry and status fields correctly', () => {
    render(
      <Form {...mockForm}>
        <form>
          <IndustryStatusFields form={mockForm} />
        </form>
      </Form>
    );

    expect(screen.getByText('Industry*')).toBeInTheDocument();
    expect(screen.getByText('Status*')).toBeInTheDocument();
    
    // Since SelectContent might not be in the document until clicked, we check for the triggers
    expect(screen.getAllByRole('combobox')).toHaveLength(2);
  });
});
