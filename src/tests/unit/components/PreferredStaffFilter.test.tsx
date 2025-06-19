
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PreferredStaffFilter } from '@/components/forecasting/matrix/filters/PreferredStaffFilter';
import { StaffOption } from '@/types/staffOption';

const mockStaffOptions: StaffOption[] = [
  { id: 'staff-1', full_name: 'Alice Johnson' },
  { id: 'staff-2', full_name: 'Bob Smith' },
  { id: 'staff-3', full_name: 'Carol Davis' }
];

describe('PreferredStaffFilter', () => {
  const defaultProps = {
    selectedStaffIds: [],
    onStaffSelection: jest.fn(),
    includeUnassigned: false,
    onIncludeUnassignedChange: jest.fn(),
    showOnlyPreferred: false,
    onShowOnlyPreferredChange: jest.fn(),
    staffOptions: mockStaffOptions,
    isLoading: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    test('renders filter component with staff options', () => {
      render(<PreferredStaffFilter {...defaultProps} />);
      
      expect(screen.getByText('Filter by Preferred Staff')).toBeInTheDocument();
      expect(screen.getByText('Include unassigned tasks')).toBeInTheDocument();
      expect(screen.getByText('Show only tasks with preferred staff')).toBeInTheDocument();
    });

    test('displays loading state', () => {
      render(<PreferredStaffFilter {...defaultProps} isLoading={true} />);
      
      expect(screen.getByText('Loading staff...')).toBeInTheDocument();
    });

    test('handles empty staff options', () => {
      render(<PreferredStaffFilter {...defaultProps} staffOptions={[]} />);
      
      expect(screen.getByText('No staff available')).toBeInTheDocument();
    });
  });

  describe('Staff Selection', () => {
    test('handles single staff selection', async () => {
      render(<PreferredStaffFilter {...defaultProps} />);
      
      const staffButton = screen.getByText('Alice Johnson');
      fireEvent.click(staffButton);
      
      await waitFor(() => {
        expect(defaultProps.onStaffSelection).toHaveBeenCalledWith(['staff-1']);
      });
    });

    test('handles multiple staff selection', async () => {
      const props = { ...defaultProps, selectedStaffIds: ['staff-1'] };
      render(<PreferredStaffFilter {...props} />);
      
      const staffButton = screen.getByText('Bob Smith');
      fireEvent.click(staffButton);
      
      await waitFor(() => {
        expect(defaultProps.onStaffSelection).toHaveBeenCalledWith(['staff-1', 'staff-2']);
      });
    });

    test('handles staff deselection', async () => {
      const props = { ...defaultProps, selectedStaffIds: ['staff-1', 'staff-2'] };
      render(<PreferredStaffFilter {...props} />);
      
      const staffButton = screen.getByText('Alice Johnson');
      fireEvent.click(staffButton);
      
      await waitFor(() => {
        expect(defaultProps.onStaffSelection).toHaveBeenCalledWith(['staff-2']);
      });
    });
  });

  describe('Checkbox Options', () => {
    test('handles include unassigned toggle', async () => {
      render(<PreferredStaffFilter {...defaultProps} />);
      
      const checkbox = screen.getByLabelText('Include unassigned tasks');
      fireEvent.click(checkbox);
      
      await waitFor(() => {
        expect(defaultProps.onIncludeUnassignedChange).toHaveBeenCalledWith(true);
      });
    });

    test('handles show only preferred toggle', async () => {
      render(<PreferredStaffFilter {...defaultProps} />);
      
      const checkbox = screen.getByLabelText('Show only tasks with preferred staff');
      fireEvent.click(checkbox);
      
      await waitFor(() => {
        expect(defaultProps.onShowOnlyPreferredChange).toHaveBeenCalledWith(true);
      });
    });
  });

  describe('Edge Cases', () => {
    test('handles null staff options gracefully', () => {
      render(<PreferredStaffFilter {...defaultProps} staffOptions={null as any} />);
      
      expect(screen.getByText('No staff available')).toBeInTheDocument();
    });

    test('handles staff with missing names', () => {
      const invalidStaff = [
        { id: 'staff-1', full_name: 'Alice Johnson' },
        { id: 'staff-2', full_name: '' },
        { id: 'staff-3', full_name: null as any }
      ];
      
      render(<PreferredStaffFilter {...defaultProps} staffOptions={invalidStaff} />);
      
      // Should only show valid staff
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.queryByText('')).not.toBeInTheDocument();
    });

    test('maintains selection state across re-renders', () => {
      const { rerender } = render(
        <PreferredStaffFilter {...defaultProps} selectedStaffIds={['staff-1']} />
      );
      
      expect(screen.getByText('Alice Johnson')).toHaveClass('selected');
      
      rerender(
        <PreferredStaffFilter {...defaultProps} selectedStaffIds={['staff-1']} isLoading={true} />
      );
      
      expect(screen.getByText('Loading staff...')).toBeInTheDocument();
    });
  });
});
