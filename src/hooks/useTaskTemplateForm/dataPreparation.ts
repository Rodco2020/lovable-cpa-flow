
import { TaskTemplate } from '@/types/task';

/**
 * Utility functions for preparing and validating task template form data
 */

/**
 * Prepare form data for submission
 * This ensures the data is in the correct format before sending to the API
 */
export function prepareFormDataForSubmission(formData: Partial<TaskTemplate>) {
  // Ensure we're sending the requiredSkills as an array of strings
  const preparedData = {
    ...formData,
    requiredSkills: formData.requiredSkills || []
  };
  
  console.log('Preparing form data for submission:', preparedData);
  return preparedData;
}
