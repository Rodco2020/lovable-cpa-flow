
import { useState } from 'react';

interface UseEnhancedMatrixStateResult {
  isControlsExpanded: boolean;
  setIsControlsExpanded: (expanded: boolean) => void;
  selectedClientIds: string[];
  setSelectedClientIds: (clientIds: string[]) => void;
  selectedSkills: string[];
  setSelectedSkills: (skills: string[]) => void;
  forecastMode: 'virtual' | 'actual';
  setForecastMode: (mode: 'virtual' | 'actual') => void;
  startMonth: Date;
  setStartMonth: (date: Date) => void;
}

export const useEnhancedMatrixState = (
  initialForecastType: 'virtual' | 'actual' = 'virtual'
): UseEnhancedMatrixStateResult => {
  const [isControlsExpanded, setIsControlsExpanded] = useState(false);
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [forecastMode, setForecastMode] = useState<'virtual' | 'actual'>(initialForecastType);
  const [startMonth, setStartMonth] = useState(new Date());

  return {
    isControlsExpanded,
    setIsControlsExpanded,
    selectedClientIds,
    setSelectedClientIds,
    selectedSkills,
    setSelectedSkills,
    forecastMode,
    setForecastMode,
    startMonth,
    setStartMonth
  };
};
