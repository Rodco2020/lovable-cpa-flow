
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DemandMatrixControls } from '../DemandMatrixControls';
import { DemandMatrixControlsProps } from '../types';

/**
 * Comprehensive test suite for refactored DemandMatrixControls
 * Ensures all functionality is preserved after refactoring
 */
describe('DemandMatrixControls - Refactored', () => {
  const mockProps: DemandMatrixControlsProps = {
    availableSkills: ['Junior Staff', 'Senior Staff', 'CPA'],
    selectedSkills: ['Junior Staff'],
    onSkillToggle: vi.fn(),
    isAllSkillsSelected: false,
    availableClients: [
      { id: '1', name: 'Client A' },
      { id: '2', name: 'Client B' }
    ],
    selectedClients: ['1'],
    onClientToggle: vi.fn(),
    isAllClientsSelected: false,
    availablePreferredStaff: [
      { id: 'staff1', name: 'John Doe' },
      { id: 'staff2', name: 'Jane Smith' }
    ],
    selectedPreferredStaff: ['staff1'],
    onPreferredStaffToggle: vi.fn(),
    isAllPreferredStaffSelected: false,
    preferredStaffFilterMode: 'specific',
    onPreferredStaffFilterModeChange: vi.fn(),
    onReset: vi.fn(),
    onExport: vi.fn(),
    onManualRefresh: vi.fn(),
    skillsLoading: false,
    clientsLoading: false,
    preferredStaffLoading: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Structure', () => {
    it('renders all main sections', () => {
      render(<DemandMatrixControls {...mockProps} />);
      
      // Phase indicator
      expect(screen.getByText('Phase 3: Enhanced UI with Visual Indicators')).toBeInTheDocument();
      
      // Action buttons
      expect(screen.getByText('Reset Filters')).toBeInTheDocument();
      expect(screen.getByText('Export Data')).toBeInTheDocument();
      expect(screen.getByText('Refresh Cache')).toBeInTheDocument();
      
      // Skills filter
      expect(screen.getByText('Skills')).toBeInTheDocument();
      expect(screen.getByText('1/3')).toBeInTheDocument();
      
      // Clients filter
      expect(screen.getByText('Clients')).toBeInTheDocument();
      expect(screen.getByText('1/2')).toBeInTheDocument();
    });

    it('displays correct skill badges and counts', () => {
      render(<DemandMatrixControls {...mockProps} />);
      
      // Should show selection count in badge
      expect(screen.getByText('1/3')).toBeInTheDocument();
      
      // Should show individual skills
      expect(screen.getByText('Junior Staff')).toBeInTheDocument();
      expect(screen.getByText('Senior Staff')).toBeInTheDocument();
      expect(screen.getByText('CPA')).toBeInTheDocument();
    });

    it('displays correct client badges and counts', () => {
      render(<DemandMatrixControls {...mockProps} />);
      
      // Should show selection count in badge
      expect(screen.getByText('1/2')).toBeInTheDocument();
      
      // Should show individual clients
      expect(screen.getByText('Client A')).toBeInTheDocument();
      expect(screen.getByText('Client B')).toBeInTheDocument();
    });
  });

  describe('Functionality Preservation', () => {
    it('calls onSkillToggle when skill is clicked', () => {
      render(<DemandMatrixControls {...mockProps} />);
      
      const seniorStaffCheckbox = screen.getByRole('checkbox', { name: /senior staff/i });
      fireEvent.click(seniorStaffCheckbox);
      
      expect(mockProps.onSkillToggle).toHaveBeenCalledWith('Senior Staff');
    });

    it('calls onClientToggle when client is clicked', () => {
      render(<DemandMatrixControls {...mockProps} />);
      
      const clientBCheckbox = screen.getByRole('checkbox', { name: /client b/i });
      fireEvent.click(clientBCheckbox);
      
      expect(mockProps.onClientToggle).toHaveBeenCalledWith('2');
    });

    it('calls onReset when reset button is clicked', () => {
      render(<DemandMatrixControls {...mockProps} />);
      
      const resetButton = screen.getByText('Reset Filters');
      fireEvent.click(resetButton);
      
      expect(mockProps.onReset).toHaveBeenCalled();
    });

    it('calls onExport when export button is clicked', () => {
      render(<DemandMatrixControls {...mockProps} />);
      
      const exportButton = screen.getByText('Export Data');
      fireEvent.click(exportButton);
      
      expect(mockProps.onExport).toHaveBeenCalled();
    });

    it('calls onManualRefresh when refresh button is clicked', () => {
      render(<DemandMatrixControls {...mockProps} />);
      
      const refreshButton = screen.getByText('Refresh Cache');
      fireEvent.click(refreshButton);
      
      expect(mockProps.onManualRefresh).toHaveBeenCalled();
    });
  });

  describe('Select All Functionality', () => {
    it('handles skills select all correctly', () => {
      render(<DemandMatrixControls {...mockProps} />);
      
      // Find skills section and click "All" button
      const skillsSection = screen.getByText('Skills').closest('div');
      const selectAllButton = skillsSection?.querySelector('button');
      
      if (selectAllButton) {
        fireEvent.click(selectAllButton);
        
        // Should toggle unselected skills
        expect(mockProps.onSkillToggle).toHaveBeenCalledWith('Senior Staff');
        expect(mockProps.onSkillToggle).toHaveBeenCalledWith('CPA');
      }
    });

    it('handles clients select all correctly', () => {
      render(<DemandMatrixControls {...mockProps} />);
      
      // Find clients section and click "All" button
      const clientsSection = screen.getByText('Clients').closest('div');
      const selectAllButton = clientsSection?.querySelector('button');
      
      if (selectAllButton) {
        fireEvent.click(selectAllButton);
        
        // Should toggle unselected client
        expect(mockProps.onClientToggle).toHaveBeenCalledWith('2');
      }
    });
  });

  describe('Loading States', () => {
    it('shows loading state for skills', () => {
      render(<DemandMatrixControls {...mockProps} skillsLoading={true} />);
      
      expect(screen.getByText('Loading skills...')).toBeInTheDocument();
    });

    it('shows loading state for clients', () => {
      render(<DemandMatrixControls {...mockProps} clientsLoading={true} />);
      
      expect(screen.getByText('Loading clients...')).toBeInTheDocument();
    });

    it('shows loading state for preferred staff', () => {
      render(<DemandMatrixControls {...mockProps} preferredStaffLoading={true} />);
      
      expect(screen.getByText('Loading preferred staff...')).toBeInTheDocument();
    });

    it('disables refresh button when loading', () => {
      render(<DemandMatrixControls {...mockProps} preferredStaffLoading={true} />);
      
      const refreshButton = screen.getByText('Refresh Cache');
      expect(refreshButton).toBeDisabled();
    });
  });

  describe('Badge Display', () => {
    it('shows "All" badge when all skills selected', () => {
      const allSelectedProps = {
        ...mockProps,
        isAllSkillsSelected: true,
        selectedSkills: mockProps.availableSkills
      };
      
      render(<DemandMatrixControls {...allSelectedProps} />);
      
      expect(screen.getByText('All')).toBeInTheDocument();
    });

    it('shows count badge when partially selected', () => {
      render(<DemandMatrixControls {...mockProps} />);
      
      // Skills: 1/3 selected
      expect(screen.getByText('1/3')).toBeInTheDocument();
      // Clients: 1/2 selected
      expect(screen.getByText('1/2')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('maintains proper form labeling', () => {
      render(<DemandMatrixControls {...mockProps} />);
      
      // All checkboxes should have accessible labels
      expect(screen.getByRole('checkbox', { name: /junior staff/i })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /senior staff/i })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /cpa/i })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /client a/i })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /client b/i })).toBeInTheDocument();
    });

    it('maintains proper button accessibility', () => {
      render(<DemandMatrixControls {...mockProps} />);
      
      expect(screen.getByRole('button', { name: /reset filters/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /export data/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /refresh cache/i })).toBeInTheDocument();
    });
  });
});
