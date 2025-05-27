
/**
 * Operation Summary Tests
 * 
 * Unit tests for the OperationSummary component functionality.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { OperationSummary } from '../../../../../components/clients/TaskWizard/BulkOperationsPanel/OperationSummary';

describe('OperationSummary', () => {
  it('should display correct counts', () => {
    render(
      <OperationSummary 
        selectedClientCount={5}
        selectedTemplateCount={3}
      />
    );

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument(); // 5 * 3 = 15
  });

  it('should calculate total operations correctly', () => {
    render(
      <OperationSummary 
        selectedClientCount={10}
        selectedTemplateCount={2}
      />
    );

    expect(screen.getByText('20')).toBeInTheDocument(); // 10 * 2 = 20
  });
});
