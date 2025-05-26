
/**
 * Tracks progress of assignment operations
 */
export interface OperationProgress {
  completed: number;
  total: number;
  currentOperation?: string;
  percentage: number;
  estimatedTimeRemaining?: number;
}

export interface OperationResults {
  tasksCreated: number;
  errors: string[];
  success: boolean;
}

/**
 * Creates initial progress state
 */
export const createInitialProgress = (): OperationProgress => ({
  completed: 0,
  total: 0,
  percentage: 0
});

/**
 * Creates initial operation results
 */
export const createInitialResults = (): OperationResults => ({
  tasksCreated: 0,
  errors: [],
  success: true
});

/**
 * Calculates progress percentage and estimated time remaining
 */
export const calculateProgress = (
  completed: number,
  total: number,
  startTime: number
): Partial<OperationProgress> => {
  const percentage = total > 0 ? (completed / total) * 100 : 0;
  const estimatedTimeRemaining = total > completed ? 
    ((Date.now() - startTime) / completed) * (total - completed) / 1000 : 0;

  return {
    completed,
    total,
    percentage,
    estimatedTimeRemaining
  };
};
