
/**
 * Task Query Builder
 * Handles construction of Supabase queries for task fetching
 */

import { supabase } from '@/integrations/supabase/client';
import { DemandFilters } from '@/types/demand';
import { TaskQueryConfig } from './types';

export class TaskQueryBuilder {
  /**
   * Build a Supabase query for fetching recurring tasks
   */
  static buildTaskQuery(filters?: DemandFilters, config: TaskQueryConfig = {}) {
    console.log('🔨 [TASK QUERY BUILDER] Building query with filters:', filters);

    const {
      includeClients = true,
      includePreferredStaff = true,
      activeOnly = true
    } = config;

    // Start with base query
    let query = supabase
      .from('recurring_tasks')
      .select(`
        *,
        ${includeClients ? 'clients!inner(id, legal_name, expected_monthly_revenue),' : ''}
        ${includePreferredStaff ? 'preferred_staff:staff(id, full_name, role_title, assigned_skills)' : ''}
      `.trim().replace(/,\s*$/, '')) // Remove trailing comma
      .order('created_at', { ascending: false });

    // Apply active filter
    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    // Apply skill filters - FIXED: use skillTypes instead of skills
    if (filters?.skillTypes && filters.skillTypes.length > 0) {
      console.log('🎯 [TASK QUERY BUILDER] Applying skill filters:', filters.skillTypes);
      
      // Use overlaps operator for array comparison
      query = query.overlaps('required_skills', filters.skillTypes);
    }

    // Apply client filters - FIXED: use clientIds instead of clients
    if (filters?.clientIds && filters.clientIds.length > 0) {
      console.log('🏢 [TASK QUERY BUILDER] Applying client filters:', filters.clientIds);
      query = query.in('client_id', filters.clientIds);
    }

    // Apply preferred staff filters - FIXED: use preferredStaffIds instead of preferredStaff
    if (filters?.preferredStaffIds && filters.preferredStaffIds.length > 0) {
      console.log('👥 [TASK QUERY BUILDER] Applying preferred staff filters:', filters.preferredStaffIds);
      query = query.in('preferred_staff_id', filters.preferredStaffIds);
    }

    console.log('✅ [TASK QUERY BUILDER] Query built successfully');
    return query;
  }

  /**
   * Build a query specifically for forecast data
   */
  static buildForecastQuery(startDate: Date) {
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1);

    console.log('📊 [TASK QUERY BUILDER] Building forecast query for period:', {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    });

    return supabase
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
        clients!inner(id, legal_name, expected_monthly_revenue),
        preferred_staff:staff(id, full_name, role_title)
      `)
      .eq('is_active', true)
      .order('client_id');
  }
}
