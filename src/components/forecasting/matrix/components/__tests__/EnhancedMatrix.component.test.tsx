
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

describe('EnhancedCapacityMatrix - Component Structure', () => {
  beforeEach(() => {
    mockUseEnhancedMatrixData.mockReturnValue({
      matrixData: null,
      isLoading: false,
      isRefreshing: false,
      error: null,
      validationIssues: [],
      loadMatrixData: jest.fn()
    });

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

  it('should render without breaking existing functionality', () => {
    render(
      <TestWrapper>
        <EnhancedCapacityMatrix />
      </TestWrapper>
    );

    // Should render the matrix legend
    expect(screen.getByText(/legend/i)).toBeInTheDocument();
  });

  it('should preserve all props and behavior', () => {
    render(
      <TestWrapper>
        <EnhancedCapacityMatrix 
          className="test-class" 
          forecastType="actual"
        />
      </TestWrapper>
    );

    // Should apply className
    const container = screen.getByText(/legend/i).closest('div');
    expect(container).toHaveClass('test-class');
  });

  it('should maintain responsive layout structure', () => {
    render(
      <TestWrapper>
        <EnhancedCapacityMatrix />
      </TestWrapper>
    );

    // Should have responsive grid layout
    const gridContainer = document.querySelector('.grid.grid-cols-1.xl\\:grid-cols-4');
    expect(gridContainer).toBeInTheDocument();
  });
});
