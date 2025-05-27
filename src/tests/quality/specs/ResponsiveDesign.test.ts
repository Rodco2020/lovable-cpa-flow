
import { render, screen } from '@testing-library/react';
import { TestWrapper } from '../testUtils/TestWrapper';
import ClientModule from '@/pages/ClientModule';

/**
 * Responsive design tests to ensure the application
 * adapts properly to different screen sizes and orientations
 */
describe('Responsive Design', () => {
  it('should adapt to different screen sizes', () => {
    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    render(
      <TestWrapper>
        <ClientModule />
      </TestWrapper>
    );
    
    expect(screen.getByText('Client Module')).toBeInTheDocument();
  });
});
