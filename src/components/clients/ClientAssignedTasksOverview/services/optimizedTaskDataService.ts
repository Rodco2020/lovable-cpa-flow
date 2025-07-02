import { supabase } from '@/integrations/supabase/client';
import { Client } from '@/types/client';
import { FormattedTask } from '../types';
import { SkillResolutionService } from './core/skillResolutionService';

/**
 * Optimized Task Data Service - Phase 1 Implementation
 * 
 * This service replaces the N+1 query problem with a single optimized query
 * that fetches all tasks with their related data in one database call.
 * 
 * Performance improvements:
 * - Reduces 220+ queries to 2 queries (recurring + ad-hoc)
 * - Uses database joins to fetch related data efficiently
 * - Leverages new database indexes for optimal performance
 */
export class OptimizedTaskDataService {
  /**
   * Fetch all recurring tasks with related data in a single optimized query
   */
  static async fetchAllRecurringTasks(): Promise<any[]> {
    const { data, error } = await supabase
      .from('recurring_tasks')
      .select(`
        *,
        client:clients!inner(
          id,
          legal_name,
          staff_liaison:staff!staff_liaison_id(id, full_name)
        ),
        preferred_staff:staff!preferred_staff_id(id, full_name),
        template:task_templates(*)
      `)
      .eq('is_active', true)
      .order('client_id', { ascending: true });
      
    if (error) {
      console.error('Error fetching recurring tasks:', error);
      throw error;
    }
    
    return data || [];
  }

  /**
   * Fetch all ad-hoc task instances with related data in a single optimized query
   */
  static async fetchAllAdHocTasks(): Promise<any[]> {
    const { data, error } = await supabase
      .from('task_instances')
      .select(`
        *,
        client:clients!inner(
          id,
          legal_name,
          staff_liaison:staff!staff_liaison_id(id, full_name)
        ),
        template:task_templates(*),
        assigned_staff:staff!assigned_staff_id(id, full_name)
      `)
      .neq('status', 'Completed')
      .order('client_id', { ascending: true });
      
    if (error) {
      console.error('Error fetching ad-hoc tasks:', error);
      throw error;
    }
    
    return data || [];
  }

  /**
   * Format recurring task data to match the existing FormattedTask interface
   */
  static async formatRecurringTask(
    task: any,
    skills: Set<string>,
    priorities: Set<string>
  ): Promise<FormattedTask> {
    // Resolve skill IDs to names
    const resolvedSkills = await SkillResolutionService.resolveTaskSkills(task.required_skills);
    
    // Add to filter sets
    resolvedSkills.forEach(skill => skills.add(skill));
    priorities.add(task.priority);

    return {
      id: task.id,
      clientId: task.client_id,
      clientName: task.client?.legal_name || 'Unknown Client',
      taskName: task.name,
      taskType: 'Recurring',
      dueDate: task.due_date ? new Date(task.due_date) : null,
      estimatedHours: task.estimated_hours,
      priority: task.priority,
      status: task.status,
      isActive: task.is_active,
      requiredSkills: resolvedSkills,
      preferredStaffId: task.preferred_staff_id,
      preferredStaffName: task.preferred_staff?.full_name || null,
      staffLiaisonId: task.client?.staff_liaison?.id || null,
      staffLiaisonName: task.client?.staff_liaison?.full_name || null
    };
  }

  /**
   * Format ad-hoc task data to match the existing FormattedTask interface
   */
  static async formatAdHocTask(
    task: any,
    skills: Set<string>,
    priorities: Set<string>
  ): Promise<FormattedTask> {
    // Resolve skill IDs to names
    const resolvedSkills = await SkillResolutionService.resolveTaskSkills(task.required_skills);
    
    // Add to filter sets
    resolvedSkills.forEach(skill => skills.add(skill));
    priorities.add(task.priority);

    return {
      id: task.id,
      clientId: task.client_id,
      clientName: task.client?.legal_name || 'Unknown Client',
      taskName: task.name,
      taskType: 'Ad-hoc',
      dueDate: task.due_date ? new Date(task.due_date) : null,
      estimatedHours: task.estimated_hours,
      priority: task.priority,
      status: task.status,
      isActive: true, // Ad-hoc tasks don't have is_active field
      requiredSkills: resolvedSkills,
      preferredStaffId: null, // Ad-hoc tasks use assigned_staff_id
      preferredStaffName: null,
      staffLiaisonId: task.client?.staff_liaison?.id || null,
      staffLiaisonName: task.client?.staff_liaison?.full_name || null
    };
  }

  /**
   * Main method to fetch all client tasks using optimized queries
   * This replaces the N+1 query problem with 2 efficient queries
   */
  static async fetchAllClientTasks(): Promise<{
    formattedTasks: FormattedTask[];
    skills: Set<string>;
    priorities: Set<string>;
    clients: Client[];
  }> {
    console.log('[OptimizedTaskDataService] Starting optimized data fetch...');
    
    try {
      // Fetch all data with 2 optimized queries instead of 220+
      const [recurringTasks, adHocTasks] = await Promise.all([
        this.fetchAllRecurringTasks(),
        this.fetchAllAdHocTasks()
      ]);

      console.log(`[OptimizedTaskDataService] Fetched ${recurringTasks.length} recurring tasks and ${adHocTasks.length} ad-hoc tasks`);

      const skills = new Set<string>();
      const priorities = new Set<string>();
      const clientsMap = new Map<string, Client>();
      const formattedTasks: FormattedTask[] = [];

      // Process recurring tasks
      for (const task of recurringTasks) {
        const formattedTask = await this.formatRecurringTask(task, skills, priorities);
        formattedTasks.push(formattedTask);

        // Build clients map
        if (task.client && !clientsMap.has(task.client.id)) {
          clientsMap.set(task.client.id, {
            id: task.client.id,
            legalName: task.client.legal_name,
            primaryContact: '', 
            email: '',
            phone: '',
            billingAddress: '',
            industry: 'Other' as const,
            status: 'Active' as const,
            staffLiaisonId: task.client.staff_liaison?.id || null,
            staffLiaisonName: task.client.staff_liaison?.full_name || null,
            defaultTaskPriority: 'Medium',
            expectedMonthlyRevenue: 0,
            billingFrequency: 'Monthly' as const,
            paymentTerms: 'Net30' as const,
            notificationPreferences: { emailReminders: true, taskNotifications: true },
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }

      // Process ad-hoc tasks
      for (const task of adHocTasks) {
        const formattedTask = await this.formatAdHocTask(task, skills, priorities);
        formattedTasks.push(formattedTask);

        // Build clients map
        if (task.client && !clientsMap.has(task.client.id)) {
          clientsMap.set(task.client.id, {
            id: task.client.id,
            legalName: task.client.legal_name,
            primaryContact: '',
            email: '',
            phone: '',
            billingAddress: '',
            industry: 'Other' as const,
            status: 'Active' as const,
            staffLiaisonId: task.client.staff_liaison?.id || null,
            staffLiaisonName: task.client.staff_liaison?.full_name || null,
            defaultTaskPriority: 'Medium',
            expectedMonthlyRevenue: 0,
            billingFrequency: 'Monthly' as const,
            paymentTerms: 'Net30' as const,
            notificationPreferences: { emailReminders: true, taskNotifications: true },
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }

      const clients = Array.from(clientsMap.values());

      console.log(`[OptimizedTaskDataService] Processed ${formattedTasks.length} total tasks for ${clients.length} clients`);
      console.log(`[OptimizedTaskDataService] Found ${skills.size} unique skills and ${priorities.size} unique priorities`);

      return {
        formattedTasks,
        skills,
        priorities,
        clients
      };
    } catch (error) {
      console.error('[OptimizedTaskDataService] Error fetching optimized data:', error);
      throw error;
    }
  }

  /**
   * Fetch clients only (for backward compatibility)
   */
  static async fetchClients(): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select(`
        *,
        staff_liaison:staff!staff_liaison_id(id, full_name)
      `)
      .order('legal_name');

    if (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }

    return (data || []).map(client => ({
      id: client.id,
      legalName: client.legal_name,
      primaryContact: client.primary_contact,
      email: client.email,
      phone: client.phone,
      billingAddress: client.billing_address,
      industry: client.industry as any,
      status: client.status as any,
      staffLiaisonId: client.staff_liaison_id || null,
      staffLiaisonName: null, // Will be populated from join if needed
      defaultTaskPriority: client.default_task_priority,
      expectedMonthlyRevenue: client.expected_monthly_revenue,
      billingFrequency: client.billing_frequency as any,
      paymentTerms: client.payment_terms as any,
      notificationPreferences: typeof client.notification_preferences === 'object' 
        ? client.notification_preferences as any
        : { emailReminders: true, taskNotifications: true },
      createdAt: new Date(client.created_at),
      updatedAt: new Date(client.updated_at)
    }));
  }
}