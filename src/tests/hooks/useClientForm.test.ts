
import { renderHook, act } from '@testing-library/react';
import { useClientForm } from '@/hooks/useClientForm';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getStaffForLiaisonDropdown } from '@/services/clientService';

// Mock the dependencies
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
  useParams: jest.fn().mockReturnValue({})
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn()
}));

jest.mock('@/services/clientService', () => ({
  getStaffForLiaisonDropdown: jest.fn(),
  getClientById: jest.fn(),
  createClient: jest.fn(),
  updateClient: jest.fn()
}));

describe('useClientForm hook', () => {
  const mockNavigate = jest.fn();
  const mockStaffOptions = [
    { id: '1', full_name: 'John Doe' },
    { id: '2', full_name: 'Jane Smith' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useQuery as jest.Mock).mockReturnValue({
      data: mockStaffOptions
    });
  });

  test('should initialize with default values and return expected properties', () => {
    const { result } = renderHook(() => useClientForm());
    
    expect(result.current).toHaveProperty('form');
    expect(result.current).toHaveProperty('isEditMode', false);
    expect(result.current).toHaveProperty('isLoading', false);
    expect(result.current).toHaveProperty('isClientLoading', false);
    expect(result.current).toHaveProperty('client', null);
    expect(result.current).toHaveProperty('staffOptions', mockStaffOptions);
    expect(result.current).toHaveProperty('onSubmit');
    expect(result.current).toHaveProperty('navigate');
  });

  test('should fetch staff options on initialization', () => {
    renderHook(() => useClientForm());
    
    expect(useQuery).toHaveBeenCalledWith({
      queryKey: ['staff', 'liaison-options'],
      queryFn: getStaffForLiaisonDropdown,
    });
  });
});
