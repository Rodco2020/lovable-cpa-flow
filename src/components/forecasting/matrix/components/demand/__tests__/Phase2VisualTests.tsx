
/**
 * Phase 2 Visual Regression Tests
 * 
 * Utilities and test cases to verify visual consistency and responsive behavior
 * of the Preferred Staff Filter implementation across different screen sizes.
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PreferredStaffFilterSection } from '../components/PreferredStaffFilterSection';

const mockStaffData = [
  { id: 'staff-1', name: 'John Smith' },
  { id: 'staff-2', name: 'Jane Doe' },
  { id: 'staff-3', name: 'Mike Johnson' },
  { id: 'staff-4', name: 'Sarah Wilson' },
  { id: 'staff-5', name: 'David Brown' }
];

export const Phase2VisualTests = () => {
  describe('Phase 2 Visual Regression Tests', () => {
    const mockViewport = (width: number, height: number) => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: width,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: height,
      });
      window.dispatchEvent(new Event('resize'));
    };

    describe('Mobile Layout (375px)', () => {
      it('should render properly on mobile screens', () => {
        mockViewport(375, 667);
        
        render(
          <PreferredStaffFilterSection
            selectedPreferredStaff={[]}
            onPreferredStaffToggle={() => {}}
            availablePreferredStaff={mockStaffData}
            preferredStaffLoading={false}
            preferredStaffError={null}
            isAllPreferredStaffSelected={false}
          />
        );
        
        // Verify responsive elements are present
        expect(screen.getByText('Preferred Staff')).toBeInTheDocument();
        expect(screen.getByRole('group')).toHaveClass('max-h-32', 'overflow-y-auto');
      });

      it('should handle text truncation on small screens', () => {
        mockViewport(375, 667);
        
        const longNameStaff = [
          { id: 'staff-1', name: 'This is an extremely long staff member name that should be properly truncated on mobile devices' }
        ];
        
        render(
          <PreferredStaffFilterSection
            selectedPreferredStaff={[]}
            onPreferredStaffToggle={() => {}}
            availablePreferredStaff={longNameStaff}
            preferredStaffLoading={false}
            preferredStaffError={null}
            isAllPreferredStaffSelected={false}
          />
        );
        
        const label = screen.getByText(longNameStaff[0].name);
        expect(label).toHaveClass('truncate');
      });
    });

    describe('Tablet Layout (768px)', () => {
      it('should adapt to tablet screen sizes', () => {
        mockViewport(768, 1024);
        
        render(
          <PreferredStaffFilterSection
            selectedPreferredStaff={['staff-1', 'staff-2']}
            onPreferredStaffToggle={() => {}}
            availablePreferredStaff={mockStaffData}
            preferredStaffLoading={false}
            preferredStaffError={null}
            isAllPreferredStaffSelected={false}
          />
        );
        
        // Verify layout maintains proper hierarchy
        expect(screen.getByText('2 of 5 selected')).toBeInTheDocument();
        expect(screen.getByRole('group')).toBeInTheDocument();
      });
    });

    describe('Desktop Layout (1920px)', () => {
      it('should display properly on large screens', () => {
        mockViewport(1920, 1080);
        
        render(
          <PreferredStaffFilterSection
            selectedPreferredStaff={mockStaffData.map(s => s.id)}
            onPreferredStaffToggle={() => {}}
            availablePreferredStaff={mockStaffData}
            preferredStaffLoading={false}
            preferredStaffError={null}
            isAllPreferredStaffSelected={true}
          />
        );
        
        // Verify all elements are accessible
        expect(screen.getByText('None')).toBeInTheDocument(); // Shows "None" when all selected
        expect(screen.getByText('5 of 5 selected')).toBeInTheDocument();
      });
    });

    describe('Loading State Visuals', () => {
      it('should display consistent loading animations', () => {
        render(
          <PreferredStaffFilterSection
            selectedPreferredStaff={[]}
            onPreferredStaffToggle={() => {}}
            availablePreferredStaff={[]}
            preferredStaffLoading={true}
            preferredStaffError={null}
            isAllPreferredStaffSelected={false}
          />
        );
        
        // Check loading spinner consistency
        const spinner = screen.getByLabelText('Loading preferred staff');
        expect(spinner).toBeInTheDocument();
        
        // Check skeleton loaders
        const skeletons = document.querySelectorAll('.animate-pulse');
        expect(skeletons.length).toBeGreaterThan(0);
      });
    });

    describe('Error State Visuals', () => {
      it('should display error styling consistently', () => {
        render(
          <PreferredStaffFilterSection
            selectedPreferredStaff={[]}
            onPreferredStaffToggle={() => {}}
            availablePreferredStaff={[]}
            preferredStaffLoading={false}
            preferredStaffError="Network connection failed"
            isAllPreferredStaffSelected={false}
          />
        );
        
        const errorElement = screen.getByRole('alert');
        
        // Verify error styling classes
        expect(errorElement).toHaveClass(
          'text-xs',
          'text-destructive', 
          'bg-destructive/10',
          'p-2',
          'rounded',
          'flex',
          'items-center',
          'gap-2',
          'mb-2'
        );
      });
    });

    describe('Visual Hierarchy Tests', () => {
      it('should maintain proper visual separation between sections', () => {
        render(
          <PreferredStaffFilterSection
            selectedPreferredStaff={['staff-1']}
            onPreferredStaffToggle={() => {}}
            availablePreferredStaff={mockStaffData}
            preferredStaffLoading={false}
            preferredStaffError={null}
            isAllPreferredStaffSelected={false}
          />
        );
        
        // Check header spacing
        const headerContainer = screen.getByText('Preferred Staff').closest('div');
        expect(headerContainer).toHaveClass('mb-3');
        
        // Check summary section spacing
        const summaryContainer = screen.getByText('1 of 5 selected').closest('div');
        expect(summaryContainer).toHaveClass('mt-2');
      });
    });

    describe('Icon Integration Tests', () => {
      it('should display icons with proper sizing and alignment', () => {
        render(
          <PreferredStaffFilterSection
            selectedPreferredStaff={[]}
            onPreferredStaffToggle={() => {}}
            availablePreferredStaff={mockStaffData}
            preferredStaffLoading={false}
            preferredStaffError="Test error"
            isAllPreferredStaffSelected={false}
            onRetryPreferredStaff={() => {}}
          />
        );
        
        // Verify Users icon is present and properly sized
        const usersIcon = document.querySelector('.lucide-users');
        expect(usersIcon).toBeInTheDocument();
        
        // Verify Alert icon in error state
        const alertIcon = document.querySelector('.lucide-alert-circle');
        expect(alertIcon).toBeInTheDocument();
        
        // Verify Retry icon
        const retryIcon = document.querySelector('.lucide-refresh-cw');
        expect(retryIcon).toBeInTheDocument();
      });
    });
  });
};

/**
 * Test snapshots for visual regression detection
 */
export const generatePhase2VisualSnapshots = () => {
  const scenarios = [
    {
      name: 'default-state',
      props: {
        selectedPreferredStaff: [],
        availablePreferredStaff: mockStaffData,
        preferredStaffLoading: false,
        preferredStaffError: null,
        isAllPreferredStaffSelected: false
      }
    },
    {
      name: 'loading-state',
      props: {
        selectedPreferredStaff: [],
        availablePreferredStaff: [],
        preferredStaffLoading: true,
        preferredStaffError: null,
        isAllPreferredStaffSelected: false
      }
    },
    {
      name: 'error-state',
      props: {
        selectedPreferredStaff: [],
        availablePreferredStaff: [],
        preferredStaffLoading: false,
        preferredStaffError: 'Failed to load staff data',
        isAllPreferredStaffSelected: false
      }
    },
    {
      name: 'partial-selection',
      props: {
        selectedPreferredStaff: ['staff-1', 'staff-3'],
        availablePreferredStaff: mockStaffData,
        preferredStaffLoading: false,
        preferredStaffError: null,
        isAllPreferredStaffSelected: false
      }
    },
    {
      name: 'all-selected',
      props: {
        selectedPreferredStaff: mockStaffData.map(s => s.id),
        availablePreferredStaff: mockStaffData,
        preferredStaffLoading: false,
        preferredStaffError: null,
        isAllPreferredStaffSelected: true
      }
    }
  ];

  return scenarios;
};
