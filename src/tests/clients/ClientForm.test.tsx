
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ClientForm from '../../components/clients/ClientForm';
import { useClientForm } from '../../hooks/useClientForm';

// Mock the useClientForm hook
jest.mock('../../hooks/useClientForm', () => ({
  useClientForm: jest.fn()
}));

describe('ClientForm Component', () => {
  // Default mock implementation
  const defaultMock = {
    form: {
      handleSubmit: jest.fn(),
      control: {},
      watch: jest.fn(),
    },
    isEditMode: false,
    isLoading: false,
    isClientLoading: false,
    staffOptions: [],
    onSubmit: jest.fn(),
    navigate: jest.fn(),
  };

  beforeEach(() => {
    (useClientForm as jest.Mock).mockReturnValue(defaultMock);
  });

  test('renders loading state when client data is loading', () => {
    (useClientForm as jest.Mock).mockReturnValue({
      ...defaultMock,
      isClientLoading: true,
    });
    
    render(
      <BrowserRouter>
        <ClientForm />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Loading client data...')).toBeInTheDocument();
  });

  test('renders add client form when not in edit mode', () => {
    render(
      <BrowserRouter>
        <ClientForm />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Add New Client')).toBeInTheDocument();
    expect(screen.getByText('Enter client details to create a new client profile')).toBeInTheDocument();
  });

  test('renders edit client form when in edit mode', () => {
    (useClientForm as jest.Mock).mockReturnValue({
      ...defaultMock,
      isEditMode: true,
    });
    
    render(
      <BrowserRouter>
        <ClientForm />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Edit Client')).toBeInTheDocument();
    expect(screen.getByText('Update client information and preferences')).toBeInTheDocument();
  });

  // Add more tests as needed
});
