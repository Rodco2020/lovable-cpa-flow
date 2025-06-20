
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DemandMatrixControlsPanel } from '../DemandMatrixControlsPanel';

/**
 * Test suite for refactored DemandMatrixControlsPanel
 * Ensures exact functionality preservation after refactoring into smaller components
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
    preferredStaffFilterMode: 'specific' as const,
    onPreferredStaffFilterModeChange: vi.fn(),
    preferredStaffLoading: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Refactored Component Structure', () => {
    it('renders the same header as original', () => {
      render(<DemandMatrixControlsPanel {...mockProps} />);
      
      expect(screen.getByText('Matrix Controls')).toBeInTheDocument();
      expect(screen.getByLabelText('Collapse controls')).toBeInTheDocument();
    });

    it('renders all filter sections when expanded', () => {
      render(<DemandMatrixControlsPanel {...mockProps} />);
      
      expect(screen.getByText('Time Range')).toBeInTheDocument();
      expect(screen.getByText('Skills Filter')).toBeInTheDocument();
      expect(screen.getByText('Clients Filter')).toBeInTheDocument();
      expect(screen.getByText('Preferred Staff Filter')).toBeInTheDocument();
    });

    it('renders action buttons exactly as before', () => {
      render(<DemandMatrixControlsPanel {...mockProps} />);
      
      expect(screen.getByText('Export Matrix Data')).toBeInTheDocument();
      expect(screen.getByText('Reset All Filters')).toBeInTheDocument();
    });
  });

  describe('Functionality Preservation', () => {
    it('preserves toggle controls functionality', () => {
      render(<DemandMatrixControlsPanel {...mockProps} />);
      
      const toggleButton = screen.getByLabelText('Collapse controls');
      fireEvent.click(toggleButton);
      
      expect(mockProps.onToggleControls).toHaveBeenCalledTimes(1);
    });

    it('preserves skill selection functionality', () => {
      render(<DemandMatrixControlsPanel {...mockProps} />);
      
      const seniorStaffCheckbox = screen.getByRole('checkbox', { name: /senior staff/i });
      fireEvent.click(seniorStaffCheckbox);
      
      expect(mockProps.onSkillToggle).toHaveBeenCalledWith('Senior Staff');
    });

    it('preserves client selection functionality', () => {
      render(<DemandMatrixControlsPanel {...mockProps} />);
      
      const clientBCheckbox = screen.getByRole('checkbox', { name: /client b/i });
      fireEvent.click(clientBCheckbox);
      
      expect(mockProps.onClientToggle).toHaveBeenCalledWith('2');
    });

    it('preserves reset functionality', () => {
      render(<DemandMatrixControlsPanel {...mockProps} />);
      
      fireEvent.click(screen.getByText('Reset All Filters'));
      expect(mockProps.onReset).toHaveBeenCalledTimes(1);
    });

    it('preserves three-mode staff filtering functionality', () => {
      render(<DemandMatrixControlsPanel {...mockProps} />);
      
      const allModeRadio = screen.getByRole('radio', { name: /all tasks/i });
      fireEvent.click(allModeRadio);
      
      expect(mockProps.onPreferredStaffFilterModeChange).toHaveBeenCalledWith('all');
    });
  });

  describe('Conditional Rendering Preservation', () => {
    it('hides content when collapsed, exactly as before', () => {
      const collapsedProps = {
        ...mockProps,
        isControlsExpanded: false
      };
      
      render(<DemandMatrixControlsPanel {...collapsedProps} />);
      
      // Should not show individual filter sections
      expect(screen.queryByText('Time Range')).not.toBeInTheDocument();
      expect(screen.queryByRole('checkbox', { name: /senior staff/i })).not.toBeInTheDocument();
    });

    it('shows all content when expanded, exactly as before', () => {
      render(<DemandMatrixControlsPanel {...mockProps} />);
      
      // Should show all filter sections
      expect(screen.getByText('Time Range')).toBeInTheDocument();
      expect(screen.getByText('Skills Filter')).toBeInTheDocument();
      expect(screen.getByText('Clients Filter')).toBeInTheDocument();
      expect(screen.getByText('Preferred Staff Filter')).toBeInTheDocument();
    });
  });

  describe('Enhanced Export Functionality Preservation', () => {
    it('maintains export dialog integration', () => {
      render(<DemandMatrixControlsPanel {...mockProps} />);
      
      // Export button should be present and functional
      const exportButton = screen.getByText('Export Matrix Data');
      expect(exportButton).toBeInTheDocument();
    });
  });

  describe('Badge and Count Display Preservation', () => {
    it('shows correct skill selection counts', () => {
      render(<DemandMatrixControlsPanel {...mockProps} />);
      
      // Should show 1/3 for skills (1 selected out of 3 available)
      expect(screen.getByText('1/3')).toBeInTheDocument();
    });

    it('shows correct client selection counts', () => {
      render(<DemandMatrixControlsPanel {...mockProps} />);
      
      // Should show 1/2 for clients (1 selected out of 2 available)
      expect(screen.getByText('1/2')).toBeInTheDocument();
    });
  });
});
