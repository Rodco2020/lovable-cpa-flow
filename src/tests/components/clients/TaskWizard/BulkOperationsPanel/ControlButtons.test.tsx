
/**
 * Control Buttons Tests
 * 
 * Unit tests for the ControlButtons component functionality.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ControlButtons } from '../../../../../components/clients/TaskWizard/BulkOperationsPanel/ControlButtons';

describe('ControlButtons', () => {
  const mockCallbacks = {
    onStartOperation: jest.fn(),
    onPauseOperation: jest.fn(),
    onStopOperation: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render start button when not running', () => {
    render(
      <ControlButtons 
        canStart={true}
        isRunning={false}
        isPaused={false}
        {...mockCallbacks}
      />
    );

    expect(screen.getByText('Start Operations')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /pause/i })).not.toBeInTheDocument();
  });

  it('should render control buttons when running', () => {
    render(
      <ControlButtons 
        canStart={false}
        isRunning={true}
        isPaused={false}
        {...mockCallbacks}
      />
    );

    expect(screen.getByText('Start Operations')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '' })).toBeInTheDocument(); // Pause button
  });

  it('should call start operation when clicked', () => {
    render(
      <ControlButtons 
        canStart={true}
        isRunning={false}
        isPaused={false}
        {...mockCallbacks}
      />
    );

    fireEvent.click(screen.getByText('Start Operations'));
    expect(mockCallbacks.onStartOperation).toHaveBeenCalled();
  });
});
