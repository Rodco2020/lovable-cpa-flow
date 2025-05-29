import { Client } from '@/types/client';

export interface SelectSourceClientStepProps {
  sourceClientId: string | null;
  onSelectClient: (clientId: string) => void;
  availableClients: Client[];
  isLoading: boolean;
  setSourceClientId?: (clientId: string) => void;
}

export interface SelectTargetClientStepProps {
  sourceClientId: string;
  targetClientId: string | null;
  onSelectClient: (clientId: string) => void;
  availableClients: Client[];
  isLoading: boolean;
  sourceClientName: string;
}

export interface EnhancedSelectTasksStepProps {
  sourceClientId: string;
  targetClientId: string | null;
  selectedTaskIds: string[];
  setSelectedTaskIds: (taskIds: string[]) => void;
}
