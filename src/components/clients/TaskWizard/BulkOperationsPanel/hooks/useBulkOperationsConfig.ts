
import { BulkOperationConfig } from '../../types';

export const useBulkOperationsConfig = (
  config: BulkOperationConfig,
  onConfigChange: (config: BulkOperationConfig) => void
) => {
  const updateConfig = (updates: Partial<BulkOperationConfig>) => {
    onConfigChange({ ...config, ...updates });
  };

  return {
    config,
    updateConfig
  };
};
