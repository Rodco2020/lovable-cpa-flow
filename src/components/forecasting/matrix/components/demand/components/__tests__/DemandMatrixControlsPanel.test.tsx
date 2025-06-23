
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DemandMatrixControlsPanel } from '../../DemandMatrixControlsPanel';

// Mock data for testing
const mockProps = {
  isControlsExpanded: true,
  onToggleControls: jest.fn(),
  selectedSkills: ['Tax Preparation', 'Audit'],
  selectedClients: ['Client A', 'Client B'],
  selectedPreferredStaff: ['staff-1', 'staff-2'],
  onSkillToggle: jest.fn(),
  onClientToggle: jest.fn(),
  onPreferredStaffToggle: jest.fn(),
  monthRange: { start: 0, end: 11 },
  onMonthRangeChange: jest.fn(),
  onExport: jest.fn(),
  onReset: jest.fn(),
  groupingMode: 'skill' as const,
  availableSkills: ['Tax Preparation', 'Audit', 'Advisory'],
  availableClients: [
    { id: 'client-1', name: 'Client A' },
    { id: 'client-2', name: 'Client B' },
    { id: 'client-3', name: 'Client C' }
  ],
  availablePreferredStaff: [
    { id: 'staff-1', name: 'John Doe' },
    { id: 'staff-2', name: 'Jane Smith' },
    { id: 'staff-3', name: 'Bob Johnson' }
  ],
  onPrintExport: jest.fn()
};

describe('DemandMatrixControlsPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the main control panel components', () => {
    render(<DemandMatrixControlsPanel {...mockProps} />);
    
    expect(screen.getByText('Matrix Controls')).toBeInTheDocument();
    expect(screen.getByText('Time Range')).toBeInTheDocument();
    expect(screen.getByText('Skills Filter')).toBeInTheDocument();
    expect(screen.getByText('Clients Filter')).toBeInTheDocument();
    expect(screen.getByText('Preferred Staff')).toBeInTheDocument();
  });

  it('displays correct month range', () => {
    render(<DemandMatrixControlsPanel {...mockProps} />);
    
    expect(screen.getByText('Jan - Dec')).toBeInTheDocument();
    expect(screen.getByText('Start Month: Jan')).toBeInTheDocument();
    expect(screen.getByText('End Month: Dec')).toBeInTheDocument();
  });

  it('handles expand/collapse functionality', () => {
    render(<DemandMatrixControlsPanel {...mockProps} />);
    
    const collapseButton = screen.getByText('Collapse');
    fireEvent.click(collapseButton);
    
    expect(mockProps.onToggleControls).toHaveBeenCalledTimes(1);
  });

  it('displays skill checkboxes when expanded', () => {
    render(<DemandMatrixControlsPanel {...mockProps} />);
    
    expect(screen.getByLabelText('Tax Preparation')).toBeInTheDocument();
    expect(screen.getByLabelText('Audit')).toBeInTheDocument();
    expect(screen.getByLabelText('Advisory')).toBeInTheDocument();
  });

  it('handles skill toggle correctly', () => {
    render(<DemandMatrixControlsPanel {...mockProps} />);
    
    const auditCheckbox = screen.getByLabelText('Audit');
    fireEvent.click(auditCheckbox);
    
    expect(mockProps.onSkillToggle).toHaveBeenCalledWith('Audit');
  });

  it('displays client checkboxes when expanded', () => {
    render(<DemandMatrixControlsPanel {...mockProps} />);
    
    expect(screen.getByLabelText('Client A')).toBeInTheDocument();
    expect(screen.getByLabelText('Client B')).toBeInTheDocument();
    expect(screen.getByLabelText('Client C')).toBeInTheDocument();
  });

  it('handles client toggle correctly', () => {
    render(<DemandMatrixControlsPanel {...mockProps} />);
    
    const clientCheckbox = screen.getByLabelText('Client A');
    fireEvent.click(clientCheckbox);
    
    expect(mockProps.onClientToggle).toHaveBeenCalledWith('Client A');
  });

  it('displays action buttons', () => {
    render(<DemandMatrixControlsPanel {...mockProps} />);
    
    expect(screen.getByText('Print/Export Reports')).toBeInTheDocument();
    expect(screen.getByText('Export Data')).toBeInTheDocument();
    expect(screen.getByText('Reset Filters')).toBeInTheDocument();
  });

  it('handles export functionality', () => {
    render(<DemandMatrixControlsPanel {...mockProps} />);
    
    const exportButton = screen.getByText('Export Data');
    fireEvent.click(exportButton);
    
    expect(mockProps.onExport).toHaveBeenCalledTimes(1);
  });

  it('handles reset functionality', () => {
    render(<DemandMatrixControlsPanel {...mockProps} />);
    
    const resetButton = screen.getByText('Reset Filters');
    fireEvent.click(resetButton);
    
    expect(mockProps.onReset).toHaveBeenCalledTimes(1);
  });

  it('displays current selection summary', () => {
    render(<DemandMatrixControlsPanel {...mockProps} />);
    
    expect(screen.getByText('Mode: Skills')).toBeInTheDocument();
    expect(screen.getByText('Range: Jan - Dec')).toBeInTheDocument();
    expect(screen.getByText(/Filters:.*2 skills.*2 clients.*2 staff/)).toBeInTheDocument();
  });

  it('handles collapsed state correctly', () => {
    const collapsedProps = { ...mockProps, isControlsExpanded: false };
    render(<DemandMatrixControlsPanel {...collapsedProps} />);
    
    expect(screen.getByText('Expand')).toBeInTheDocument();
    expect(screen.getByText('2/3 skills selected')).toBeInTheDocument();
    expect(screen.getByText('2/3 clients selected')).toBeInTheDocument();
  });

  it('handles print export when provided', () => {
    render(<DemandMatrixControlsPanel {...mockProps} />);
    
    const printButton = screen.getByText('Print/Export Reports');
    fireEvent.click(printButton);
    
    expect(mockProps.onPrintExport).toHaveBeenCalledTimes(1);
  });

  it('does not show print button when onPrintExport is not provided', () => {
    const propsWithoutPrint = { ...mockProps, onPrintExport: undefined };
    render(<DemandMatrixControlsPanel {...propsWithoutPrint} />);
    
    expect(screen.queryByText('Print/Export Reports')).not.toBeInTheDocument();
  });
});
