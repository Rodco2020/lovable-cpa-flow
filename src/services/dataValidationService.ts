
import { supabase } from '@/integrations/supabase/client';
import { logError } from '@/services/errorLoggingService';

/**
 * General Data Validation Service
 * 
 * Provides validation functions for general data integrity checks
 * across the application. This is separate from the demand-specific
 * validation services.
 */
class DataValidationService {
  /**
   * Validate that a client reference exists and is active
   */
  async validateClientReference(clientId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, status')
        .eq('id', clientId)
        .single();

      if (error) {
        logError('Client validation query failed', 'error', {
          component: 'DataValidationService',
          details: error.message
        });
        return false;
      }

      return data && data.status === 'Active';
    } catch (error) {
      logError('Client validation failed', 'error', {
        component: 'DataValidationService',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  /**
   * Validate that a staff member exists and is active
   */
  async validateStaffReference(staffId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('id, status')
        .eq('id', staffId)
        .single();

      if (error) {
        logError('Staff validation query failed', 'error', {
          component: 'DataValidationService',
          details: error.message
        });
        return false;
      }

      return data && data.status === 'Active';
    } catch (error) {
      logError('Staff validation failed', 'error', {
        component: 'DataValidationService',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  /**
   * Validate task template exists
   */
  async validateTaskTemplate(templateId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('task_templates')
        .select('id')
        .eq('id', templateId)
        .eq('is_archived', false)
        .single();

      if (error) {
        logError('Task template validation query failed', 'error', {
          component: 'DataValidationService',
          details: error.message
        });
        return false;
      }

      return !!data;
    } catch (error) {
      logError('Task template validation failed', 'error', {
        component: 'DataValidationService',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }
}

export const dataValidationService = new DataValidationService();
export default dataValidationService;
