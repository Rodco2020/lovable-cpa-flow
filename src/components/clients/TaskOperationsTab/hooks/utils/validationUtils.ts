
/**
 * Validates template and client selection for assignment operations
 * Returns array of validation error messages
 */
export const validateTemplateAssignmentSelection = (
  selectedTemplateIds: string[],
  selectedClientIds: string[]
): string[] => {
  const errors: string[] = [];
  
  if (selectedTemplateIds.length === 0) {
    errors.push('Please select at least one template');
  }
  
  if (selectedClientIds.length === 0) {
    errors.push('Please select at least one client');
  }
  
  if (selectedTemplateIds.length > 10) {
    errors.push('Maximum 10 templates can be selected at once');
  }
  
  if (selectedClientIds.length > 50) {
    errors.push('Maximum 50 clients can be selected at once');
  }
  
  return errors;
};
