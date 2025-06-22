
import React from 'react';

interface ValidationResult {
  isValid: boolean;
  issues: string[];
}

interface ValidationStatusProps {
  validationResult: ValidationResult | null;
}

/**
 * Validation status component
 * Preserves exact validation display logic from DemandMatrixControlsFixed
 */
export const ValidationStatus: React.FC<ValidationStatusProps> = ({
  validationResult
}) => {
  if (!validationResult || validationResult.isValid) {
    return null;
  }

  return (
    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
      <div className="text-sm font-medium text-yellow-800">Data Validation Issues:</div>
      <ul className="text-sm text-yellow-700 mt-1">
        {validationResult.issues.slice(0, 3).map((issue, index) => (
          <li key={index}>• {issue}</li>
        ))}
      </ul>
    </div>
  );
};
