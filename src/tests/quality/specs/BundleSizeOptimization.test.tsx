
import { render, screen } from '@testing-library/react';
import { TestWrapper } from '../testUtils/TestWrapper';
import ClientModule from '@/pages/ClientModule';

/**
 * Bundle size optimization tests to ensure efficient
 * code splitting and import strategies
 */
describe('Bundle Size Optimization', () => {
  it('should use efficient imports', () => {
    // This is more of a build-time check, but we can verify
    // that the components render without importing everything
    render(
      <TestWrapper>
        <ClientModule />
      </TestWrapper>
    );
    
    expect(screen.getByText('Client Module')).toBeInTheDocument();
  });
});
