
import { render, screen } from '@testing-library/react';
import { TestWrapper } from '../testUtils/TestWrapper';
import ClientModule from '@/pages/ClientModule';
import TaskModule from '@/pages/TaskModule';
import ForecastingModule from '@/pages/ForecastingModule';

/**
 * Tests for critical user workflows to ensure core functionality
 * remains intact across all major application modules
 */
describe('Critical User Workflows', () => {
  it('should render Client Module without errors', () => {
    render(
      <TestWrapper>
        <ClientModule />
      </TestWrapper>
    );
    
    expect(screen.getByText('Client Module')).toBeInTheDocument();
  });

  it('should render Task Module without errors', () => {
    render(
      <TestWrapper>
        <TaskModule />
      </TestWrapper>
    );
    
    expect(screen.getByText('Task Module')).toBeInTheDocument();
  });

  it('should render Forecasting Module without errors', () => {
    render(
      <TestWrapper>
        <ForecastingModule />
      </TestWrapper>
    );
    
    expect(screen.getByText('Forecasting Module')).toBeInTheDocument();
  });
});
