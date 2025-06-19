
import { vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { TestWrapper } from '../../quality/testUtils/TestWrapper';
import { DemandMatrix } from '@/components/forecasting/matrix/DemandMatrix';
import { DemandMatrixService } from '@/services/forecasting/demandMatrixService';

/**
 * Test Helper Functions
 * Reusable functions for common test operations
 */

export const setupMockService = (mockData: any) => {
  vi.mocked(DemandMatrixService.generateDemandMatrix).mockResolvedValue({
    matrixData: mockData
  });
};

export const renderDemandMatrix = () => {
  return render(
    <TestWrapper>
      <DemandMatrix groupingMode="skill" />
    </TestWrapper>
  );
};

export const waitForMatrixToLoad = async () => {
  await waitFor(() => {
    expect(screen.getByText('Tax Preparation')).toBeInTheDocument();
  });
};

/**
 * Helper function for date formatting (simplified for tests)
 * Provides consistent date formatting across all test scenarios
 */
export function formatTestDate(date: Date, formatString: string): string {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}
