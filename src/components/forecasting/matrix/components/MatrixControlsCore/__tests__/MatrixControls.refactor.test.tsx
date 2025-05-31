
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MatrixControls } from '../../../MatrixControls';
import { useMatrixSkills } from '../../../hooks/useMatrixSkills';

// Mock the useMatrixSkills hook
jest.mock('../../../hooks/useMatrixSkills');
const mockUseMatrixSkills = useMatrixSkills as jest.MockedFunction<typeof useMatrixSkills>;

/**
 * Refactoring Test Suite
 * Ensures the refactored MatrixControls component maintains exact same functionality
 */
describe('MatrixControls - Refactoring Validation', () => {
  const mockProps = {
    selectedSkills: ['Junior Staff', 'Senior Staff'],
    onSkillToggle: jest.fn(),
    viewMode: 'hours' as const,
    onViewModeChange: jest.fn(),
    monthRange: { start: 0, end: 11 },
    onMonthRangeChange: jest.fn(),
    onExport: jest.fn(),
    onReset: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMatrixSkills.mockReturnValue({
      availableSkills: ['Junior Staff', 'Senior Staff', 'CPA'],
      isLoading: false,
      error: null,
      refetchSkills: jest.fn(),
      validateSkillSelection: jest.fn().mockResolvedValue({
        valid: ['Junior Staff', 'Senior Staff', 'CPA'],
        invalid: []
      })
    });
  });

  describe('Component Structure', () => {
    it('renders all required sections', () => {
      render(<MatrixControls {...mockProps} />);
      
      // Header
      expect(screen.getByText('Matrix Controls')).toBeInTheDocument();
      expect(screen.getByText('Reset')).toBeInTheDocument();
      
      // View Mode
      expect(screen.getByText('View Mode')).toBeInTheDocument();
      
      // Month Range
      expect(screen.getByText('Month Range')).toBeInTheDocument();
      
      // Skills Filter
      expect(screen.getByText('Skills Filter')).toBeInTheDocument();
      
      // Actions
      expect(screen.getByText('Actions')).toBeInTheDocument();
      expect(screen.getByText('Export Matrix')).toBeInTheDocument();
    });

    it('displays skills with checkboxes', () => {
      render(<MatrixControls {...mockProps} />);
      
      expect(screen.getByLabelText('Junior Staff')).toBeInTheDocument();
      expect(screen.getByLabelText('Senior Staff')).toBeInTheDocument();
      expect(screen.getByLabelText('CPA')).toBeInTheDocument();
    });

    it('shows correct selection count badge', () => {
      render(<MatrixControls {...mockProps} />);
      
      expect(screen.getByText('2 of 3 selected')).toBeInTheDocument();
      expect(screen.getByText('From Database')).toBeInTheDocument();
    });
  });

  describe('Functionality Preservation', () => {
    it('calls onSkillToggle when skill checkbox is clicked', () => {
      render(<MatrixControls {...mockProps} />);
      
      const cpaTecheckbox = screen.getByLabelText('CPA');
      fireEvent.click(cpaTecheckbox);
      
      expect(mockProps.onSkillToggle).toHaveBeenCalledWith('CPA');
    });

    it('calls onReset when reset button is clicked', () => {
      render(<MatrixControls {...mockProps} />);
      
      const resetButton = screen.getByText('Reset');
      fireEvent.click(resetButton);
      
      expect(mockProps.onReset).toHaveBeenCalled();
    });

    it('calls onExport when export button is clicked', () => {
      render(<MatrixControls {...mockProps} />);
      
      const exportButton = screen.getByText('Export Matrix');
      fireEvent.click(exportButton);
      
      expect(mockProps.onExport).toHaveBeenCalled();
    });

    it('handles Show All/Hide All functionality', () => {
      render(<MatrixControls {...mockProps} />);
      
      const showAllButton = screen.getByText('Show All');
      fireEvent.click(showAllButton);
      
      // Should call onSkillToggle for the unselected skill
      expect(mockProps.onSkillToggle).toHaveBeenCalledWith('CPA');
    });
  });

  describe('Loading and Error States', () => {
    it('displays loading state correctly', () => {
      mockUseMatrixSkills.mockReturnValue({
        availableSkills: [],
        isLoading: true,
        error: null,
        refetchSkills: jest.fn(),
        validateSkillSelection: jest.fn().mockResolvedValue({
          valid: [],
          invalid: []
        })
      });

      render(<MatrixControls {...mockProps} />);
      
      expect(screen.getByText('Skills Filter')).toBeInTheDocument();
      // Loading animation should be present
      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('displays error state correctly', () => {
      const mockRefetch = jest.fn();
      mockUseMatrixSkills.mockReturnValue({
        availableSkills: [],
        isLoading: false,
        error: 'Failed to load skills',
        refetchSkills: mockRefetch,
        validateSkillSelection: jest.fn().mockResolvedValue({
          valid: [],
          invalid: []
        })
      });

      render(<MatrixControls {...mockProps} />);
      
      expect(screen.getByText('Failed to load skills')).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
      
      // Test retry functionality
      fireEvent.click(screen.getByText('Retry'));
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('maintains proper labeling for form controls', () => {
      render(<MatrixControls {...mockProps} />);
      
      // All checkboxes should have proper labels
      expect(screen.getByLabelText('Junior Staff')).toBeInTheDocument();
      expect(screen.getByLabelText('Senior Staff')).toBeInTheDocument();
      expect(screen.getByLabelText('CPA')).toBeInTheDocument();
      
      // Select elements should have labels
      expect(screen.getByText('View Mode')).toBeInTheDocument();
      expect(screen.getByText('Month Range')).toBeInTheDocument();
    });
  });
});
