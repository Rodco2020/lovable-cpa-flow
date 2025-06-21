
/**
 * Enhanced Data Service for Demand Matrix
 * 
 * Phase 2 Enhancement: Integrated with skill resolution service to handle
 * UUID-to-name conversion while maintaining data integrity.
 */

import { supabase } from '@/lib/supabaseClient';
import { DemandMatrixData } from '@/types/demand';
import { SkillType } from '@/types/task';
import { SkillResolutionService } from '../skillResolution/skillResolutionService';

export interface EnhancedDemandFilters {
  skills?: SkillType[];
  clients?: string[];
  preferredStaff?: string[];
  monthRange?: { start: number; end: number };
}

export class EnhancedDataService {
  /**
   * Phase 2: Enhanced fetchDemandData with skill resolution integration
   */
  static async fetchDemandData(filters: EnhancedDemandFilters = {}): Promise<{
    clients: Array<{ id: string; name: string }>;
    staff: Array<{ id: string; name: string }>;
    skills: string[];
    recurringTasks: any[];
    skillResolutionReport?: any;
  }> {
    console.log('🔍 [PHASE 2 ENHANCED DATA] Fetching comprehensive demand data with skill resolution:', filters);

    try {
      // Phase 2: Initialize skill resolution service
      await SkillResolutionService.initializeSkillCache();

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

        // Phase 2: Fetch skills with both ID and name for resolution
        supabase
          .from('skills')
          .select('id, name, category')
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

      // Phase 2: Use skill resolution service to get consistent skill names
      const skills = await SkillResolutionService.getAllSkillNames();
      const recurringTasks = tasksResult.data || [];

      // Phase 2: Enhanced task processing with skill validation
      let skillResolutionReport = null;
      if (recurringTasks.length > 0) {
        console.log('🔄 [PHASE 2 ENHANCED DATA] Validating skills in recurring tasks...');
        
        // Collect all skill references from tasks
        const allSkillRefs = new Set<string>();
        for (const task of recurringTasks) {
          if (Array.isArray(task.required_skills)) {
            task.required_skills.forEach(skill => allSkillRefs.add(skill));
          }
        }

        // Validate all skill references
        if (allSkillRefs.size > 0) {
          skillResolutionReport = await SkillResolutionService.validateSkillReferences(Array.from(allSkillRefs));
          console.log('📊 [PHASE 2 ENHANCED DATA] Skill resolution report:', skillResolutionReport);
        }
      }

      console.log('✅ [PHASE 2 ENHANCED DATA] Successfully fetched all data:', {
        clientsCount: clients.length,
        staffCount: staff.length,
        skillsCount: skills.length,
        tasksCount: recurringTasks.length,
        skillResolutionSuccess: skillResolutionReport?.isValid || false
      });

      return {
        clients,
        staff,
        skills,
        recurringTasks,
        skillResolutionReport
      };

    } catch (error) {
      console.error('❌ [PHASE 2 ENHANCED DATA] Error fetching demand data:', error);
      throw error;
    }
  }

  /**
   * Phase 2: Enhanced validation with skill mapping validation
   */
  static validateDataAvailability(data: {
    clients: any[];
    staff: any[];
    skills: any[];
    recurringTasks: any[];
    skillResolutionReport?: any;
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

    // Phase 2: Add skill resolution validation
    if (data.skillResolutionReport && !data.skillResolutionReport.isValid) {
      issues.push(`Skill resolution issues: ${data.skillResolutionReport.invalid.length} invalid skill references`);
    }

    const isValid = issues.length === 0;

    if (!isValid) {
      console.warn('⚠️ [PHASE 2 ENHANCED DATA] Data validation issues:', issues);
    }

    return { isValid, issues };
  }

  /**
   * Phase 2: Enhanced debug info with skill resolution diagnostics
   */
  static async generateDebugInfo(): Promise<{
    databaseConnection: boolean;
    tableData: { [table: string]: number };
    sampleData: any;
    skillResolutionStatus?: any;
  }> {
    try {
      console.log('🔧 [PHASE 2 ENHANCED DATA] Generating enhanced debug information...');

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

      // Phase 2: Add skill resolution status
      let skillResolutionStatus = null;
      try {
        await SkillResolutionService.initializeSkillCache();
        const allSkills = await SkillResolutionService.getAllSkillNames();
        
        skillResolutionStatus = {
          initialized: true,
          skillCount: allSkills.length,
          sampleSkills: allSkills.slice(0, 5)
        };
      } catch (error) {
        skillResolutionStatus = {
          initialized: false,
          error: error instanceof Error ? error.message : String(error)
        };
      }

      console.log('🔧 [PHASE 2 ENHANCED DATA] Enhanced debug info generated:', {
        databaseConnection,
        tableData,
        sampleDataCount: {
          clients: sampleData.clients.length,
          tasks: sampleData.tasks.length
        },
        skillResolutionStatus
      });

      return {
        databaseConnection,
        tableData,
        sampleData,
        skillResolutionStatus
      };

    } catch (error) {
      console.error('❌ [PHASE 2 ENHANCED DATA] Error generating debug info:', error);
      return {
        databaseConnection: false,
        tableData: {},
        sampleData: {},
        skillResolutionStatus: {
          initialized: false,
          error: error instanceof Error ? error.message : String(error)
        }
      };
    }
  }

  /**
   * Phase 2: New method for skill mapping validation
   */
  static async validateSkillMapping(taskSkills: string[]): Promise<{
    valid: string[];
    invalid: string[];
    resolved: string[];
    issues: string[];
  }> {
    try {
      console.log('🔍 [PHASE 2 ENHANCED DATA] Validating skill mapping for:', taskSkills);
      
      const validation = await SkillResolutionService.validateSkillReferences(taskSkills);
      
      console.log('✅ [PHASE 2 ENHANCED DATA] Skill mapping validation complete:', {
        validCount: validation.valid.length,
        invalidCount: validation.invalid.length,
        resolvedCount: validation.resolved.length
      });
      
      return {
        valid: validation.valid,
        invalid: validation.invalid,
        resolved: validation.resolved,
        issues: validation.issues
      };
    } catch (error) {
      console.error('❌ [PHASE 2 ENHANCED DATA] Error validating skill mapping:', error);
      return {
        valid: [],
        invalid: taskSkills,
        resolved: [],
        issues: [`Skill mapping validation failed: ${error}`]
      };
    }
  }
}
