
import { render } from '@testing-library/react';
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

describe('EnhancedCapacityMatrix - Hook Integration', () => {
  beforeEach(() => {
    mockUseEnhancedMatrixData.mockReturnValue({
      matrixData: null,
      isLoading: false,
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

  it('should call data management hook with correct parameters', () => {
    render(
      <TestWrapper>
        <EnhancedCapacityMatrix forecastType="actual" />
      </TestWrapper>
    );

    expect(mockUseEnhancedMatrixData).toHaveBeenCalledWith({
      forecastType: 'actual',
      selectedClientIds: []
    });
  });

  it('should integrate export functionality', () => {
    render(
      <TestWrapper>
        <EnhancedCapacityMatrix />
      </TestWrapper>
    );

    expect(mockUseEnhancedMatrixExport).toHaveBeenCalled();
  });

  it('should integrate print functionality', () => {
    render(
      <TestWrapper>
        <EnhancedCapacityMatrix />
      </TestWrapper>
    );

    expect(mockUseEnhancedMatrixPrint).toHaveBeenCalled();
  });

  it('should pass correct parameters to export hook', () => {
    const mockMatrixData = {
      skills: ['Junior', 'Senior'],
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

    render(
      <TestWrapper>
        <EnhancedCapacityMatrix />
      </TestWrapper>
    );

    expect(mockUseEnhancedMatrixExport).toHaveBeenCalledWith({
      matrixData: mockMatrixData,
      selectedSkills: expect.any(Array),
      monthRange: expect.any(Object)
    });
  });
});
