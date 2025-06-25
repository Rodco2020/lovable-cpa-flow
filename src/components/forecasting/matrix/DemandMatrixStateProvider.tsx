
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DemandMatrixData } from '@/types/demand';
import { SkillType } from '@/types/task';
import { DemandDrillDownData } from '@/types/demandDrillDown';

/**
 * State interface for the Demand Matrix component
 */
interface DemandMatrixState {
  demandData: DemandMatrixData | null;
  isLoading: boolean;
  error: string | null;
  validationIssues: string[];
  isControlsExpanded: boolean;
  retryCount: number;
  
  // Phase 4: Advanced features state
  drillDownData: DemandDrillDownData | null;
  selectedDrillDown: {skill: SkillType; month: string} | null;
  showExportDialog: boolean;
  showPrintExportDialog: boolean;
  timeHorizon: 'quarter' | 'half-year' | 'year' | 'custom';
  customDateRange: {start: Date; end: Date} | undefined;
}

/**
 * Actions interface for state management
 */
interface DemandMatrixActions {
  setDemandData: (data: DemandMatrixData | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setValidationIssues: (issues: string[]) => void;
  setIsControlsExpanded: (expanded: boolean) => void;
  setRetryCount: (count: number) => void;
  setDrillDownData: (data: DemandDrillDownData | null) => void;
  setSelectedDrillDown: (selection: {skill: SkillType; month: string} | null) => void;
  setShowExportDialog: (show: boolean) => void;
  setShowPrintExportDialog: (show: boolean) => void;
  setTimeHorizon: (horizon: 'quarter' | 'half-year' | 'year' | 'custom') => void;
  setCustomDateRange: (range: {start: Date; end: Date} | undefined) => void;
}

/**
 * Combined context type
 */
interface DemandMatrixContextType extends DemandMatrixState, DemandMatrixActions {}

/**
 * Initial state
 */
const initialState: DemandMatrixState = {
  demandData: null,
  isLoading: true,
  error: null,
  validationIssues: [],
  isControlsExpanded: false,
  retryCount: 0,
  drillDownData: null,
  selectedDrillDown: null,
  showExportDialog: false,
  showPrintExportDialog: false,
  timeHorizon: 'year',
  customDateRange: undefined,
};

/**
 * Create the context
 */
const DemandMatrixContext = createContext<DemandMatrixContextType | undefined>(undefined);

/**
 * State Provider Component
 */
interface DemandMatrixStateProviderProps {
  children: ReactNode;
}

export const DemandMatrixStateProvider: React.FC<DemandMatrixStateProviderProps> = ({ children }) => {
  const [state, setState] = useState<DemandMatrixState>(initialState);

  const actions: DemandMatrixActions = {
    setDemandData: (data) => setState(prev => ({ ...prev, demandData: data })),
    setIsLoading: (loading) => setState(prev => ({ ...prev, isLoading: loading })),
    setError: (error) => setState(prev => ({ ...prev, error })),
    setValidationIssues: (issues) => setState(prev => ({ ...prev, validationIssues: issues })),
    setIsControlsExpanded: (expanded) => setState(prev => ({ ...prev, isControlsExpanded: expanded })),
    setRetryCount: (count) => setState(prev => ({ ...prev, retryCount: count })),
    setDrillDownData: (data) => setState(prev => ({ ...prev, drillDownData: data })),
    setSelectedDrillDown: (selection) => setState(prev => ({ ...prev, selectedDrillDown: selection })),
    setShowExportDialog: (show) => setState(prev => ({ ...prev, showExportDialog: show })),
    setShowPrintExportDialog: (show) => setState(prev => ({ ...prev, showPrintExportDialog: show })),
    setTimeHorizon: (horizon) => setState(prev => ({ ...prev, timeHorizon: horizon })),
    setCustomDateRange: (range) => setState(prev => ({ ...prev, customDateRange: range })),
  };

  const contextValue: DemandMatrixContextType = {
    ...state,
    ...actions,
  };

  return (
    <DemandMatrixContext.Provider value={contextValue}>
      {children}
    </DemandMatrixContext.Provider>
  );
};

/**
 * Custom hook to use the Demand Matrix context
 */
export const useDemandMatrixState = (): DemandMatrixContextType => {
  const context = useContext(DemandMatrixContext);
  if (context === undefined) {
    throw new Error('useDemandMatrixState must be used within a DemandMatrixStateProvider');
  }
  return context;
};
