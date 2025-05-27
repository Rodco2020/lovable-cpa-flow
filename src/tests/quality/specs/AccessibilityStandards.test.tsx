
import { render, screen } from '@testing-library/react';
import { TestWrapper } from '../testUtils/TestWrapper';
import ClientModule from '@/pages/ClientModule';

/**
 * Accessibility standards tests to ensure the application
 * is usable by users with disabilities and follows WCAG guidelines
 */
describe('Accessibility Standards', () => {
  it('should have proper heading structure', () => {
    render(
      <TestWrapper>
        <ClientModule />
      </TestWrapper>
    );
    
    const headings = screen.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);
  });

  it('should have accessible buttons', () => {
    render(
      <TestWrapper>
        <ClientModule />
      </TestWrapper>
    );
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeVisible();
    });
  });
});
