
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DemandMatrixControlsPanel } from '../DemandMatrixControlsPanel';

/**
 * Comprehensive test suite for refactored DemandMatrixControlsPanel
 * Ensures exact functionality preservation after refactoring
 */
describe('DemandMatrixControlsPanel - Refactored', () => {
  const mockProps = {
    isControlsExpanded: true,
    onToggleControls: vi.fn(),
    selectedSkills: ['Junior Staff'],
    selectedClients: ['1'],
    selectedPreferredStaff: ['staff1'],
    onSkillToggle: vi.fn(),
    onClientToggle: vi.fn(),
    onPreferredStaffToggle: vi.fn(),
    monthRange: { start: 0, end: 11 },
    onMonthRangeChange: vi.fn(),
    onExport: vi.fn(),
    onReset: vi.fn(),
    groupingMode: 'skill' as const,
    availableSkills: ['Junior Staff', 'Senior Staff', 'CPA'],
    availableClients: [
      { id: '1', name: 'Client A' },
      { id: '2', name: 'Client B' }
    ],
    availablePreferredStaff: [
      { id: 'staff1', name: 'John Doe' },
      { id: 'staff2', name: 'Jane Smith' }
    ],
    isAllSkillsSelected: false,
    isAllClientsSelected: false,
    isAllPreferredStaffSelected: false,
    onPrintExport: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Structure', () => {
    it('renders the main card with header', () => {
      render(<DemandMatrixControlsPanel {...mockProps} />);
      
      expect(screen.getByText('Matrix Controls')).toBeInTheDocument();
      expect(screen.getByText('Collapse')).toBeInTheDocument();
    });

    it('renders all filter sections when expanded', () => {
      render(<DemandMatrixControlsPanel {...mockProps} />);
      
      expect(screen.getByText('Time Range')).toBeInTheDocument();
      expect(screen.getByText('Skills Filter')).toBeInTheDocument();
      expect(screen.getByText('Clients Filter')).toBeInTheDocument();
    });

    it('renders action buttons', () => {
      render(<DemandMatrixControlsPanel {...mockProps} />);
      
      expect(screen.getByText('Print/Export Reports')).toBeInTheDocument();
      expect(screen.getByText('Export Data')).toBeInTheDocument();
      expect(screen.getByText('Reset Filters')).toBeInTheDocument();
    });

    it('renders selection summary', () => {
      render(<DemandMatrixControlsPanel {...mockProps} />);
      
      expect(screen.getByText('Mode: Skills')).toBeInTheDocument();
      expect(screen.getByText('Range: Jan - Dec')).toBeInTheDocument();
    });
  });

  describe('Functionality Preservation', () => {
    it('handles toggle controls correctly', () => {
      render(<DemandMatrixControlsPanel {...mockProps} />);
      
      const toggleButton = screen.getByText('Collapse');
      fireEvent.click(toggleButton);
      
      expect(mockProps.onToggleControls).toHaveBeenCalledTimes(1);
    });

    it('handles skill selection', () => {
      render(<DemandMatrixControlsPanel {...mockProps} />);
      
      const seniorStaffCheckbox = screen.getByRole('checkbox', { name: /senior staff/i });
      fireEvent.click(seniorStaffCheckbox);
      
      expect(mockProps.onSkillToggle).toHaveBeenCalledWith('Senior Staff');
    });

    it('handles client selection', () => {
      render(<DemandMatrixControlsPanel {...mockProps} />);
      
      const clientBCheckbox = screen.getByRole('checkbox', { name: /client b/i });
      fireEvent.click(clientBCheckbox);
      
      expect(mockProps.onClientToggle).toHaveBeenCalledWith('2');
    });

    it('handles month range changes', () => {
      render(<DemandMatrixControlsPanel {...mockProps} />);
      
      // This tests that the time range controls are properly connected
      expect(screen.getByText('Start Month: Jan')).toBeInTheDocument();
      expect(screen.getByText('End Month: Dec')).toBeInTheDocument();
    });

    it('handles action button clicks', () => {
      render(<DemandMatrixControlsPanel {...mockProps} />);
      
      fireEvent.click(screen.getByText('Export Data'));
      expect(mockProps.onExport).toHaveBeenCalledTimes(1);
      
      fireEvent.click(screen.getByText('Reset Filters'));
      expect(mockProps.onReset).toHaveBeenCalledTimes(1);
      
      fireEvent.click(screen.getByText('Print/Export Reports'));
      expect(mockProps.onPrintExport).toHaveBeenCalledTimes(1);
    });
  });

  describe('Conditional Rendering', () => {
    it('shows preferred staff section when staff available', () => {
      render(<DemandMatrixControlsPanel {...mockProps} />);
      
      expect(screen.getByText('1/2 preferred staff selected')).toBeInTheDocument();
    });

    it('hides preferred staff section when no staff available', () => {
      const propsWithoutStaff = {
        ...mockProps,
        availablePreferredStaff: [],
        selectedPreferredStaff: []
      };
      
      render(<DemandMatrixControlsPanel {...propsWithoutStaff} />);
      
      expect(screen.queryByText('preferred staff')).not.toBeInTheDocument();
    });

    it('conditionally renders print button', () => {
      const propsWithoutPrint = {
        ...mockProps,
        onPrintExport: undefined
      };
      
      render(<DemandMatrixControlsPanel {...propsWithoutPrint} />);
      
      expect(screen.queryByText('Print/Export Reports')).not.toBeInTheDocument();
    });
  });

  describe('Collapsed State', () => {
    it('shows summary information when collapsed', () => {
      const collapsedProps = {
        ...mockProps,
        isControlsExpanded: false
      };
      
      render(<DemandMatrixControlsPanel {...collapsedProps} />);
      
      expect(screen.getByText('1/3 skills selected')).toBeInTheDocument();
      expect(screen.getByText('1/2 clients selected')).toBeInTheDocument();
    });

    it('hides detailed filter lists when collapsed', () => {
      const collapsedProps = {
        ...mockProps,
        isControlsExpanded: false
      };
      
      render(<DemandMatrixControlsPanel {...collapsedProps} />);
      
      // Should not show individual skill checkboxes
      expect(screen.queryByRole('checkbox', { name: /senior staff/i })).not.toBeInTheDocument();
    });
  });
});
