
/**
 * Configuration Tab Tests
 * 
 * Unit tests for the ConfigurationTab component functionality.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfigurationTab } from '../../../../../components/clients/TaskWizard/BulkOperationsPanel/ConfigurationTab';
import { BulkOperationConfig } from '../../../../../components/clients/TaskWizard/types';

describe('ConfigurationTab', () => {
  const mockConfig: BulkOperationConfig = {
    operationType: 'template-assignment',
    batchSize: 10,
    concurrency: 3,
    validationRules: []
  };

  const mockOnConfigChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render configuration fields', () => {
    render(
      <ConfigurationTab 
        config={mockConfig}
        onConfigChange={mockOnConfigChange}
      />
    );

    expect(screen.getByText('Operation Type')).toBeInTheDocument();
    expect(screen.getByText('Batch Size')).toBeInTheDocument();
    expect(screen.getByText('Concurrency')).toBeInTheDocument();
  });

  it('should update config when values change', () => {
    render(
      <ConfigurationTab 
        config={mockConfig}
        onConfigChange={mockOnConfigChange}
      />
    );

    const batchSizeInput = screen.getByDisplayValue('10');
    fireEvent.change(batchSizeInput, { target: { value: '20' } });

    expect(mockOnConfigChange).toHaveBeenCalledWith({
      ...mockConfig,
      batchSize: 20
    });
  });
});
