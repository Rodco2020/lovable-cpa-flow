
/**
 * Summary Stats Component Tests
 * 
 * Unit tests for the SummaryStats component.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { SummaryStats } from '../../../../../../components/clients/TaskWizard/BulkResultsSummary/components/SummaryStats';
import { BulkOperationResult } from '../../../../../../components/clients/TaskWizard/types';

describe('SummaryStats', () => {
  const mockResult: BulkOperationResult = {
    totalOperations: 10,
    successfulOperations: 8,
    failedOperations: 2,
    errors: [],
    processingTime: 5000,
    results: []
  };

  it('should display correct statistics', () => {
    render(<SummaryStats result={mockResult} successRate={80} />);
    
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('80.0% success rate')).toBeInTheDocument();
    expect(screen.getByText('20.0% failure rate')).toBeInTheDocument();
  });

  it('should format processing time correctly', () => {
    render(<SummaryStats result={mockResult} successRate={80} />);
    expect(screen.getByText('5s')).toBeInTheDocument();
  });
});
