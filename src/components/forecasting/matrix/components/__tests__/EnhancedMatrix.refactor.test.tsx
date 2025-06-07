
import { render, screen, waitFor } from '@testing-library/react';
import { TestWrapper } from '@/tests/quality/testUtils/TestWrapper';
import { EnhancedCapacityMatrix } from '../../EnhancedCapacityMatrix';
import { useEnhancedMatrixData } from '../../hooks/useEnhancedMatrixData';
import { useEnhancedMatrixExport } from '../../hooks/useEnhancedMatrixExport';
import { useEnhancedMatrixPrint } from '../../hooks/useEnhancedMatrixPrint';
import { filterMatrixData } from '../../utils/matrixDataFilter';

// Mock the hooks
jest.mock('../../hooks/useEnhancedMatrixData');
jest.mock('../../hooks/useEnhancedMatrixExport');
jest.mock('../../hooks/useEnhancedMatrixPrint');

const mockUseEnhancedMatrixData = useEnhancedMatrixData as jest.MockedFunction<typeof useEnhancedMatrixData>;
const mockUseEnhancedMatrixExport = useEnhancedMatrixExport as jest.MockedFunction<typeof useEnhancedMatrixExport>;
const mockUseEnhancedMatrixPrint = useEnhancedMatrixPrint as jest.MockedFunction<typeof useEnhancedMatrixPrint>;

describe('Enhanced Matrix Refactoring', () => {
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

  describe('Component Structure', () => {
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
  });

  describe('Hook Integration', () => {
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
  });

  describe('Data Filtering', () => {
    it('should filter data correctly', () => {
      const mockMatrixData = {
        skills: ['Junior', 'Senior'],
        months: [
          { key: '2024-01', label: 'Jan 2024' },
          { key: '2024-02', label: 'Feb 2024' }
        ],
        dataPoints: [
          { skillType: 'Junior', month: '2024-01', demandHours: 100, capacityHours: 120, gap: 20, utilizationPercent: 83 },
          { skillType: 'Senior', month: '2024-01', demandHours: 80, capacityHours: 100, gap: 20, utilizationPercent: 80 }
        ],
        totalDemand: 180,
        totalCapacity: 220
      };

      const result = filterMatrixData(mockMatrixData, {
        selectedSkills: ['Junior'],
        monthRange: { start: 0, end: 0 }
      });

      expect(result).toBeDefined();
      expect(result?.skills).toEqual(['Junior']);
      expect(result?.months).toHaveLength(1);
      expect(result?.dataPoints).toHaveLength(1);
      expect(result?.dataPoints[0].skillType).toBe('Junior');
    });
  });

  describe('State Management', () => {
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
  });
});

describe('Matrix Data Filter Utility', () => {
  it('should return null for null input', () => {
    const result = filterMatrixData(null, {
      selectedSkills: [],
      monthRange: { start: 0, end: 11 }
    });

    expect(result).toBeNull();
  });

  it('should filter skills correctly', () => {
    const mockData = {
      skills: ['Junior', 'Senior', 'CPA'],
      months: [{ key: '2024-01', label: 'Jan 2024' }],
      dataPoints: [
        { skillType: 'Junior', month: '2024-01', demandHours: 100, capacityHours: 120, gap: 20, utilizationPercent: 83 },
        { skillType: 'Senior', month: '2024-01', demandHours: 80, capacityHours: 100, gap: 20, utilizationPercent: 80 }
      ],
      totalDemand: 180,
      totalCapacity: 220
    };

    const result = filterMatrixData(mockData, {
      selectedSkills: ['Junior', 'Senior'],
      monthRange: { start: 0, end: 0 }
    });

    expect(result?.skills).toEqual(['Junior', 'Senior']);
    expect(result?.dataPoints).toHaveLength(2);
  });
});
