
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { WizardState, WizardContextType, WizardAction, WizardStep } from './types';

const initialState: WizardState = {
  currentStep: 'action-selection',
  selectedAction: null,
  selectedTaskIds: [],
  isProcessing: false,
  isComplete: false,
};

const WizardContext = createContext<WizardContextType | undefined>(undefined);

interface WizardProviderProps {
  children: ReactNode;
}

export const WizardProvider: React.FC<WizardProviderProps> = ({ children }) => {
  const [state, setState] = useState<WizardState>(initialState);

  const setCurrentStep = (step: WizardStep) => {
    setState(prev => ({ ...prev, currentStep: step }));
  };

  const setSelectedAction = (action: WizardAction) => {
    setState(prev => ({ ...prev, selectedAction: action }));
  };

  const setSourceClientId = (id: string) => {
    setState(prev => ({ ...prev, sourceClientId: id }));
  };

  const setTargetClientId = (id: string) => {
    setState(prev => ({ ...prev, targetClientId: id }));
  };

  const setSelectedTaskIds = (ids: string[]) => {
    setState(prev => ({ ...prev, selectedTaskIds: ids }));
  };

  const setIsProcessing = (processing: boolean) => {
    setState(prev => ({ ...prev, isProcessing: processing }));
  };

  const setIsComplete = (complete: boolean) => {
    setState(prev => ({ ...prev, isComplete: complete }));
  };

  const resetWizard = () => {
    setState(initialState);
  };

  // Step progression logic
  const stepOrder: WizardStep[] = ['action-selection', 'client-selection', 'task-selection', 'configuration', 'confirmation', 'processing', 'success'];

  const goToNextStep = () => {
    const currentIndex = stepOrder.indexOf(state.currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const goToPreviousStep = () => {
    const currentIndex = stepOrder.indexOf(state.currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const canGoNext = (() => {
    const currentIndex = stepOrder.indexOf(state.currentStep);
    return currentIndex < stepOrder.length - 1 && !state.isProcessing;
  })();

  const canGoPrevious = (() => {
    const currentIndex = stepOrder.indexOf(state.currentStep);
    return currentIndex > 0 && !state.isProcessing;
  })();

  const contextValue: WizardContextType = {
    ...state,
    setCurrentStep,
    setSelectedAction,
    setSourceClientId,
    setTargetClientId,
    setSelectedTaskIds,
    setIsProcessing,
    setIsComplete,
    resetWizard,
    goToNextStep,
    goToPreviousStep,
    canGoNext,
    canGoPrevious,
  };

  return (
    <WizardContext.Provider value={contextValue}>
      {children}
    </WizardContext.Provider>
  );
};

export const useWizard = (): WizardContextType => {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
};
