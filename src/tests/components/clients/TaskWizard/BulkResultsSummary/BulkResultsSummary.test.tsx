
/**
 * Bulk Results Summary Tests
 * 
 * Unit tests for the refactored BulkResultsSummary component functionality.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BulkResultsSummary } from '../../../../../components/clients/TaskWizard/BulkResultsSummary/BulkResultsSummary';
import { BulkOperationResult } from '../../../../../components/clients/TaskWizard/types';

describe('BulkResultsSummary', () => {
  const mockResult: BulkOperationResult = {
    totalOperations: 10,
    successfulOperations: 8,
    failedOperations: 2,
    errors: [
      { clientId: 'client-1', templateId: 'template-1', error: 'Test error 1' },
      { clientId: 'client-2', templateId: 'template-2', error: 'Test error 2' }
    ],
    processingTime: 5000,
    results: [
      { id: 'task-1', name: 'Test Task 1', client_id: 'client-1', template_id: 'template-1', status: 'active' },
      { id: 'task-2', name: 'Test Task 2', client_id: 'client-2', template_id: 'template-2', status: 'active' }
    ]
  };

  const mockProps = {
    result: mockResult,
    onRetryFailed: jest.fn(),
    onExportResults: jest.fn(),
    onViewDetails: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render operation results header', () => {
    render(<BulkResultsSummary {...mockProps} />);
    expect(screen.getByText('Operation Results')).toBeInTheDocument();
  });

  it('should display summary statistics correctly', () => {
    render(<BulkResultsSummary {...mockProps} />);
    
    expect(screen.getByText('8')).toBeInTheDocument(); // Successful operations
    expect(screen.getByText('2')).toBeInTheDocument(); // Failed operations
    expect(screen.getByText('10')).toBeInTheDocument(); // Total operations
    expect(screen.getByText('80.0% success rate')).toBeInTheDocument();
  });

  it('should show retry button when there are failed operations', () => {
    render(<BulkResultsSummary {...mockProps} />);
    expect(screen.getByText('Retry Failed')).toBeInTheDocument();
  });

  it('should not show retry button when there are no failed operations', () => {
    const successResult = {
      ...mockResult,
      failedOperations: 0,
      errors: []
    };

    render(<BulkResultsSummary {...mockProps} result={successResult} />);
    expect(screen.queryByText('Retry Failed')).not.toBeInTheDocument();
  });

  it('should call onExportResults when export button is clicked', () => {
    render(<BulkResultsSummary {...mockProps} />);
    
    const exportButton = screen.getByText('Export');
    fireEvent.click(exportButton);
    
    expect(mockProps.onExportResults).toHaveBeenCalledTimes(1);
  });

  it('should switch between tabs correctly', () => {
    render(<BulkResultsSummary {...mockProps} />);
    
    // Click on Successes tab
    const successesTab = screen.getByText('Successes');
    fireEvent.click(successesTab);
    
    expect(screen.getByText('Successful Operations (8)')).toBeInTheDocument();
    
    // Click on Errors tab
    const errorsTab = screen.getByText('Errors');
    fireEvent.click(errorsTab);
    
    expect(screen.getByText('Failed Operations (2)')).toBeInTheDocument();
  });

  it('should display performance metrics', () => {
    render(<BulkResultsSummary {...mockProps} />);
    
    expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
    expect(screen.getByText('5s')).toBeInTheDocument(); // Processing time
  });
});
