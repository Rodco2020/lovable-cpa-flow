
/**
 * Enhanced Data Service for Demand Matrix
 * 
 * This service provides enhanced data fetching capabilities for the demand matrix,
 * connecting to real Supabase data instead of mock data.
 */

import { supabase } from '@/lib/supabaseClient';
import { DemandMatrixData } from '@/types/demand';
import { SkillType } from '@/types/task';

export interface EnhancedDemandFilters {
  skills?: SkillType[];
  clients?: string[];
  preferredStaff?: string[];
  monthRange?: { start: number; end: number };
}

export class EnhancedDataService {
  /**
   * Fetch comprehensive demand data from all relevant tables
   */
  static async fetchDemandData(filters: EnhancedDemandFilters = {}): Promise<{
    clients: Array<{ id: string; name: string }>;
    staff: Array<{ id: string; name: string }>;
    skills: string[];
    recurringTasks: any[];
  }> {
    console.log('🔍 [ENHANCED DATA] Fetching comprehensive demand data with filters:', filters);

    try {
      // Parallel fetch of all required data
      const [clientsResult, staffResult, skillsResult, tasksResult] = await Promise.all([
        // Fetch active clients
        supabase
          .from('clients')
          .select('id, legal_name, status')
          .eq('status', 'Active')
          .order('legal_name'),

        // Fetch active staff
        supabase
          .from('staff')
          .select('id, full_name, status')
          .eq('status', 'active')
          .order('full_name'),

        // Fetch all skills
        supabase
          .from('skills')
          .select('name, category')
          .order('name'),

        // Fetch active recurring tasks with all related data
        supabase
          .from('recurring_tasks')
          .select(`
            id,
            name,
            client_id,
            estimated_hours,
            required_skills,
            recurrence_type,
            recurrence_interval,
            is_active,
            preferred_staff_id,
            priority,
            category,
            clients (
              id,
              legal_name
            )
          `)
          .eq('is_active', true)
      ]);

      // Check for errors
      if (clientsResult.error) throw clientsResult.error;
      if (staffResult.error) throw staffResult.error;
      if (skillsResult.error) throw skillsResult.error;
      if (tasksResult.error) throw tasksResult.error;

      const clients = (clientsResult.data || []).map(client => ({
        id: client.id,
        name: client.legal_name
      }));

      const staff = (staffResult.data || []).map(member => ({
        id: member.id,
        name: member.full_name
      }));

      const skills = (skillsResult.data || []).map(skill => skill.name);
      const recurringTasks = tasksResult.data || [];

      console.log('✅ [ENHANCED DATA] Successfully fetched all data:', {
        clientsCount: clients.length,
        staffCount: staff.length,
        skillsCount: skills.length,
        tasksCount: recurringTasks.length
      });

      return {
        clients,
        staff,
        skills,
        recurringTasks
      };

    } catch (error) {
      console.error('❌ [ENHANCED DATA] Error fetching demand data:', error);
      throw error;
    }
  }

  /**
   * Validate that we have the minimum required data
   */
  static validateDataAvailability(data: {
    clients: any[];
    staff: any[];
    skills: any[];
    recurringTasks: any[];
  }): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];

    if (!data.clients || data.clients.length === 0) {
      issues.push('No active clients found in database');
    }

    if (!data.skills || data.skills.length === 0) {
      issues.push('No skills found in database');
    }

    if (!data.recurringTasks || data.recurringTasks.length === 0) {
      issues.push('No active recurring tasks found in database');
    }

    if (!data.staff || data.staff.length === 0) {
      issues.push('No active staff members found in database');
    }

    const isValid = issues.length === 0;

    if (!isValid) {
      console.warn('⚠️ [ENHANCED DATA] Data validation issues:', issues);
    }

    return { isValid, issues };
  }

  /**
   * Generate debugging information for troubleshooting
   */
  static async generateDebugInfo(): Promise<{
    databaseConnection: boolean;
    tableData: { [table: string]: number };
    sampleData: any;
  }> {
    try {
      console.log('🔧 [ENHANCED DATA] Generating debug information...');

      // Test database connection
      const { error: connectionError } = await supabase.from('clients').select('count').limit(1);
      const databaseConnection = !connectionError;

      // Get row counts for each table
      const tableData: { [table: string]: number } = {};
      
      const tables = ['clients', 'staff', 'skills', 'recurring_tasks'];
      for (const table of tables) {
        try {
          const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });
          tableData[table] = error ? 0 : (count || 0);
        } catch (error) {
          tableData[table] = 0;
        }
      }

      // Get sample data for analysis
      const { data: sampleClients } = await supabase
        .from('clients')
        .select('id, legal_name, status')
        .limit(3);

      const { data: sampleTasks } = await supabase
        .from('recurring_tasks')
        .select('id, name, client_id, is_active, required_skills')
        .limit(3);

      const sampleData = {
        clients: sampleClients || [],
        tasks: sampleTasks || []
      };

      console.log('🔧 [ENHANCED DATA] Debug info generated:', {
        databaseConnection,
        tableData,
        sampleDataCount: {
          clients: sampleData.clients.length,
          tasks: sampleData.tasks.length
        }
      });

      return {
        databaseConnection,
        tableData,
        sampleData
      };

    } catch (error) {
      console.error('❌ [ENHANCED DATA] Error generating debug info:', error);
      return {
        databaseConnection: false,
        tableData: {},
        sampleData: {}
      };
    }
  }
}
