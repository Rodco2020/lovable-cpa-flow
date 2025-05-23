
import React from 'react';
import { render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { ContactInfoFields } from '@/components/clients/ClientForm/BasicFields/ContactInfoFields';
import { clientFormSchema, getDefaultValues } from '@/hooks/useClientForm/schema';
import type { ClientFormValues } from '@/hooks/useClientForm';

describe('ContactInfoFields Component', () => {
  const mockForm = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: getDefaultValues()
  });

  test('renders email and phone fields correctly', () => {
    render(
      <Form {...mockForm}>
        <form>
          <ContactInfoFields form={mockForm} />
        </form>
      </Form>
    );

    expect(screen.getByText('Email*')).toBeInTheDocument();
    expect(screen.getByText('Phone*')).toBeInTheDocument();
    expect(screen.getByPlaceholderText("contact@example.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("(555) 123-4567")).toBeInTheDocument();
  });
});
