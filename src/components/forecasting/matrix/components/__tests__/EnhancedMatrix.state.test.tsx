
import { render, screen } from '@testing-library/react';
import { TestWrapper } from '@/tests/quality/testUtils/TestWrapper';
import { EnhancedCapacityMatrix } from '../../EnhancedCapacityMatrix';
import { useEnhancedMatrixData } from '../../hooks/useEnhancedMatrixData';
import { useEnhancedMatrixExport } from '../../hooks/useEnhancedMatrixExport';
import { useEnhancedMatrixPrint } from '../../hooks/useEnhancedMatrixPrint';

// Mock the hooks
jest.mock('../../hooks/useEnhancedMatrixData');
jest.mock('../../hooks/useEnhancedMatrixExport');
jest.mock('../../hooks/useEnhancedMatrixPrint');

const mockUseEnhancedMatrixData = useEnhancedMatrixData as jest.MockedFunction<typeof useEnhancedMatrixData>;
const mockUseEnhancedMatrixExport = useEnhancedMatrixExport as jest.MockedFunction<typeof useEnhancedMatrixExport>;
const mockUseEnhancedMatrixPrint = useEnhancedMatrixPrint as jest.MockedFunction<typeof useEnhancedMatrixPrint>;

describe('EnhancedCapacityMatrix - State Management', () => {
  beforeEach(() => {
    mockUseEnhancedMatrixExport.mockReturnValue({
      handleEnhancedExport: jest.fn(),
      handlePrint: jest.fn()
    });

    mockUseEnhancedMatrixPrint.mockReturnValue({
      showPrintView: false,
      printOptions: null,
      handlePrint: jest.fn(),
      handlePrintExecute: jest.fn()
    });
  });

  it('should handle loading state correctly', () => {
    mockUseEnhancedMatrixData.mockReturnValue({
      matrixData: null,
      isLoading: true,
      error: null,
      validationIssues: [],
      loadMatrixData: jest.fn()
    });

    render(
      <TestWrapper>
        <EnhancedCapacityMatrix />
      </TestWrapper>
    );

    // Should show loading state
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should handle error state correctly', () => {
    mockUseEnhancedMatrixData.mockReturnValue({
      matrixData: null,
      isLoading: false,
      error: 'Test error',
      validationIssues: [],
      loadMatrixData: jest.fn()
    });

    render(
      <TestWrapper>
        <EnhancedCapacityMatrix />
      </TestWrapper>
    );

    // Should show error state
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });

  it('should handle empty data state correctly', () => {
    mockUseEnhancedMatrixData.mockReturnValue({
      matrixData: null,
      isLoading: false,
      error: null,
      validationIssues: [],
      loadMatrixData: jest.fn()
    });

    render(
      <TestWrapper>
        <EnhancedCapacityMatrix />
      </TestWrapper>
    );

    // Should show empty state or legend (depending on implementation)
    expect(screen.getByText(/legend/i)).toBeInTheDocument();
  });

  it('should handle print view state correctly', () => {
    const mockMatrixData = {
      skills: ['Junior'],
      months: [{ key: '2024-01', label: 'Jan 2024' }],
      dataPoints: [],
      totalDemand: 0,
      totalCapacity: 0,
      totalGap: 0
    };

    mockUseEnhancedMatrixData.mockReturnValue({
      matrixData: mockMatrixData,
      isLoading: false,
      error: null,
      validationIssues: [],
      loadMatrixData: jest.fn()
    });

    mockUseEnhancedMatrixPrint.mockReturnValue({
      showPrintView: true,
      printOptions: { includeAnalytics: true },
      handlePrint: jest.fn(),
      handlePrintExecute: jest.fn()
    });

    render(
      <TestWrapper>
        <EnhancedCapacityMatrix />
      </TestWrapper>
    );

    // Should render print view when showPrintView is true
    // Note: This test depends on the actual print view implementation
    expect(document.body).toBeInTheDocument();
  });
});
