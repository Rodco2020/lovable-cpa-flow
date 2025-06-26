
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PreferredStaffFilterSection } from '../components/PreferredStaffFilterSection';

/**
 * Phase 2 Testing Suite: UI Components & Controls
 * 
 * Comprehensive tests for the Preferred Staff Filter Section component
 * covering all Phase 2 requirements: UI rendering, responsive behavior,
 * accessibility compliance, loading states, and error handling.
 */

const mockPreferredStaff = [
  { id: 'staff-1', name: 'John Smith' },
  { id: 'staff-2', name: 'Jane Doe' },
  { id: 'staff-3', name: 'Mike Johnson' }
];

const defaultProps = {
  selectedPreferredStaff: [],
  onPreferredStaffToggle: vi.fn(),
  availablePreferredStaff: mockPreferredStaff,
  preferredStaffLoading: false,
  preferredStaffError: null,
  isAllPreferredStaffSelected: false
};

describe('PreferredStaffFilterSection - Phase 2 Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('UI Rendering Tests', () => {
    it('should render correctly with proper styling', () => {
      render(<PreferredStaffFilterSection {...defaultProps} />);
      
      // Verify main elements are present
      expect(screen.getByText('Preferred Staff')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /select all preferred staff/i })).toBeInTheDocument();
      
      // Verify staff list renders
      mockPreferredStaff.forEach(staff => {
        expect(screen.getByText(staff.name)).toBeInTheDocument();
      });
    });

    it('should follow existing checkbox pattern', () => {
      render(<PreferredStaffFilterSection {...defaultProps} />);
      
      // Verify checkboxes are present for each staff member
      mockPreferredStaff.forEach(staff => {
        const checkbox = screen.getByRole('checkbox', { name: staff.name });
        expect(checkbox).toBeInTheDocument();
      });
    });

    it('should have scrollable container with proper max-height', () => {
      render(<PreferredStaffFilterSection {...defaultProps} />);
      
      const container = screen.getByRole('group');
      expect(container).toHaveClass('max-h-32', 'overflow-y-auto');
    });
  });

  describe('Responsive Design Tests', () => {
    it('should maintain proper spacing and visual hierarchy', () => {
      render(<PreferredStaffFilterSection {...defaultProps} />);
      
      // Check spacing classes
      const mainContainer = screen.getByRole('group').parentElement;
      expect(mainContainer).toHaveClass('space-y-2');
      
      const headerContainer = screen.getByText('Preferred Staff').closest('div');
      expect(headerContainer).toHaveClass('flex', 'items-center', 'justify-between', 'mb-3');
    });

    it('should handle long staff names with truncation', () => {
      const longNameStaff = [
        { id: 'staff-1', name: 'This is a very long staff member name that should be truncated' }
      ];
      
      render(
        <PreferredStaffFilterSection 
          {...defaultProps} 
          availablePreferredStaff={longNameStaff}
        />
      );
      
      const label = screen.getByText(longNameStaff[0].name);
      expect(label).toHaveClass('truncate');
    });
  });

  describe('Accessibility Compliance Tests', () => {
    it('should have proper aria-labels and attributes', () => {
      render(<PreferredStaffFilterSection {...defaultProps} />);
      
      // Check main label
      const label = screen.getByLabelText('Preferred Staff');
      expect(label).toBeInTheDocument();
      
      // Check group role
      const group = screen.getByRole('group');
      expect(group).toHaveAttribute('aria-labelledby', 'preferred-staff-label');
      
      // Check select all button aria-label
      const selectAllButton = screen.getByRole('button', { name: /select all preferred staff/i });
      expect(selectAllButton).toHaveAttribute('aria-label');
    });

    it('should support keyboard navigation', () => {
      render(<PreferredStaffFilterSection {...defaultProps} />);
      
      // Test tab navigation through checkboxes
      const firstCheckbox = screen.getAllByRole('checkbox')[0];
      firstCheckbox.focus();
      expect(document.activeElement).toBe(firstCheckbox);
    });

    it('should have proper checkbox associations', () => {
      render(<PreferredStaffFilterSection {...defaultProps} />);
      
      mockPreferredStaff.forEach(staff => {
        const checkbox = screen.getByRole('checkbox', { name: staff.name });
        const label = screen.getByText(staff.name);
        
        expect(checkbox).toHaveAttribute('id', `preferred-staff-${staff.id}`);
        expect(label).toHaveAttribute('for', `preferred-staff-${staff.id}`);
      });
    });
  });

  describe('Loading States Tests', () => {
    it('should display loading state properly', () => {
      render(
        <PreferredStaffFilterSection 
          {...defaultProps} 
          preferredStaffLoading={true}
        />
      );
      
      // Check loading spinner in header
      expect(screen.getByLabelText('Loading preferred staff')).toBeInTheDocument();
      
      // Check skeleton loaders
      const skeletons = screen.getAllByText('', { selector: '.animate-pulse' });
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should disable controls during loading', () => {
      render(
        <PreferredStaffFilterSection 
          {...defaultProps} 
          preferredStaffLoading={true}
        />
      );
      
      const selectAllButton = screen.getByRole('button', { name: /select all preferred staff/i });
      expect(selectAllButton).toBeDisabled();
    });
  });

  describe('Error State Tests', () => {
    it('should display error message with proper styling', () => {
      const errorMessage = 'Failed to load staff data';
      
      render(
        <PreferredStaffFilterSection 
          {...defaultProps} 
          preferredStaffError={errorMessage}
        />
      );
      
      const errorElement = screen.getByRole('alert');
      expect(errorElement).toBeInTheDocument();
      expect(errorElement).toHaveTextContent(errorMessage);
      expect(errorElement).toHaveClass('text-destructive', 'bg-destructive/10');
    });

    it('should show retry button when error occurs', () => {
      const onRetry = vi.fn();
      
      render(
        <PreferredStaffFilterSection 
          {...defaultProps} 
          preferredStaffError="Network error"
          onRetryPreferredStaff={onRetry}
        />
      );
      
      const retryButton = screen.getByRole('button', { name: /retry loading preferred staff/i });
      expect(retryButton).toBeInTheDocument();
      
      fireEvent.click(retryButton);
      expect(onRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe('Empty State Tests', () => {
    it('should display empty state message when no staff available', () => {
      render(
        <PreferredStaffFilterSection 
          {...defaultProps} 
          availablePreferredStaff={[]}
        />
      );
      
      expect(screen.getByText(/no preferred staff available/i)).toBeInTheDocument();
      expect(screen.getByText(/add staff members in the staff module/i)).toBeInTheDocument();
    });
  });

  describe('Interaction Tests', () => {
    it('should handle individual staff selection', () => {
      const onToggle = vi.fn();
      
      render(
        <PreferredStaffFilterSection 
          {...defaultProps} 
          onPreferredStaffToggle={onToggle}
        />
      );
      
      const firstStaffCheckbox = screen.getByRole('checkbox', { name: mockPreferredStaff[0].name });
      fireEvent.click(firstStaffCheckbox);
      
      expect(onToggle).toHaveBeenCalledWith(mockPreferredStaff[0].id);
    });

    it('should handle select all functionality', () => {
      const onToggle = vi.fn();
      
      render(
        <PreferredStaffFilterSection 
          {...defaultProps} 
          onPreferredStaffToggle={onToggle}
        />
      );
      
      const selectAllButton = screen.getByRole('button', { name: /select all preferred staff/i });
      fireEvent.click(selectAllButton);
      
      // Should call toggle for each staff member
      expect(onToggle).toHaveBeenCalledTimes(mockPreferredStaff.length);
      mockPreferredStaff.forEach(staff => {
        expect(onToggle).toHaveBeenCalledWith(staff.id);
      });
    });

    it('should toggle between "All" and "None" button text', () => {
      const { rerender } = render(
        <PreferredStaffFilterSection 
          {...defaultProps} 
          isAllPreferredStaffSelected={false}
        />
      );
      
      expect(screen.getByText('All')).toBeInTheDocument();
      
      rerender(
        <PreferredStaffFilterSection 
          {...defaultProps} 
          isAllPreferredStaffSelected={true}
        />
      );
      
      expect(screen.getByText('None')).toBeInTheDocument();
    });
  });

  describe('Selection Summary Tests', () => {
    it('should display correct selection count', () => {
      render(
        <PreferredStaffFilterSection 
          {...defaultProps} 
          selectedPreferredStaff={['staff-1', 'staff-2']}
        />
      );
      
      expect(screen.getByText('2 of 3 selected')).toBeInTheDocument();
    });

    it('should show active staff badge', () => {
      render(<PreferredStaffFilterSection {...defaultProps} />);
      
      expect(screen.getByText('Active Staff')).toBeInTheDocument();
    });
  });
});
