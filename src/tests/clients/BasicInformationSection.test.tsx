
import React from 'react';
import { render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import BasicInformationSection from '@/components/clients/ClientForm/BasicInformationSection';
import { clientFormSchema, getDefaultValues } from '@/hooks/useClientForm/schema';
import type { ClientFormValues } from '@/hooks/useClientForm';

// Wrapper component to provide the form context
const FormWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: getDefaultValues()
  });
  
  return (
    <Form {...form}>
      <form>{children}</form>
    </Form>
  );
};

describe('BasicInformationSection Component', () => {
  const mockForm = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: getDefaultValues()
  });

  test('renders all form fields correctly', () => {
    render(
      <FormWrapper>
        <BasicInformationSection form={mockForm} />
      </FormWrapper>
    );

    // Check for section heading
    expect(screen.getByText('Basic Information')).toBeInTheDocument();

    // Check for field labels
    expect(screen.getByText('Legal Name*')).toBeInTheDocument();
    expect(screen.getByText('Primary Contact*')).toBeInTheDocument();
    expect(screen.getByText('Email*')).toBeInTheDocument();
    expect(screen.getByText('Phone*')).toBeInTheDocument();
    expect(screen.getByText('Billing Address*')).toBeInTheDocument();
    expect(screen.getByText('Industry*')).toBeInTheDocument();
    expect(screen.getByText('Status*')).toBeInTheDocument();

    // Check for input elements
    expect(screen.getByPlaceholderText("Enter client's legal name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Full name of primary contact")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("contact@example.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("(555) 123-4567")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Full billing address")).toBeInTheDocument();
  });
});
