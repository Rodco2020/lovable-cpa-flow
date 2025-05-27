
import { supabase } from '@/lib/supabaseClient';
import { ClientDetailReportData, ClientReportFilters } from '@/types/clientReporting';
import { StaffLiaisonReportData, ReportFilters } from '@/types/reporting';
import { logError } from '@/services/errorLoggingService';

/**
 * Centralized Reporting Data Service
 * 
 * Aggregates and optimizes data fetching for all reporting needs
 * with caching, error handling, and performance monitoring
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class ReportingDataService {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private getCacheKey(type: string, params: any): string {
    return `${type}:${JSON.stringify(params)}`;
  }

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  private setCache<T>(key: string, data: T, ttl: number = this.CACHE_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Get aggregated client data with optimized queries
   */
  async getClientReportData(clientId: string, filters: ClientReportFilters): Promise<ClientDetailReportData> {
    const cacheKey = this.getCacheKey('client-report', { clientId, filters });
    const cached = this.getFromCache<ClientDetailReportData>(cacheKey);
    
    if (cached) {
      console.log('Returning cached client report data');
      return cached;
    }

    try {
      const startTime = performance.now();
      
      // Optimized single query for client with liaison
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select(`
          id,
          legal_name,
          primary_contact,
          email,
          phone,
          industry,
          status,
          expected_monthly_revenue,
          staff_liaison_id,
          staff:staff!clients_staff_liaison_id_fkey(full_name)
        `)
        .eq('id', clientId)
        .single();

      if (clientError) throw clientError;

      // Parallel data fetching for better performance
      const [recurringTasksResult, taskInstancesResult] = await Promise.all([
        supabase
          .from('recurring_tasks')
          .select('*')
          .eq('client_id', clientId),
        supabase
          .from('task_instances')
          .select('*')
          .eq('client_id', clientId)
      ]);

      if (recurringTasksResult.error) throw recurringTasksResult.error;
      if (taskInstancesResult.error) throw taskInstancesResult.error;

      // Process and aggregate data
      const reportData = this.processClientReportData(
        clientData,
        recurringTasksResult.data || [],
        taskInstancesResult.data || []
      );

      const duration = performance.now() - startTime;
      console.log(`Client report generated in ${duration.toFixed(2)}ms`);

      this.setCache(cacheKey, reportData);
      return reportData;
    } catch (error) {
      logError('Failed to generate client report', 'error', {
        component: 'ReportingDataService',
        clientId,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get staff liaison report with optimized aggregations
   */
  async getStaffLiaisonData(filters: ReportFilters): Promise<StaffLiaisonReportData> {
    const cacheKey = this.getCacheKey('staff-liaison', filters);
    const cached = this.getFromCache<StaffLiaisonReportData>(cacheKey);
    
    if (cached) {
      console.log('Returning cached staff liaison data');
      return cached;
    }

    try {
      const startTime = performance.now();

      // Optimized query with aggregations
      const { data: aggregatedData, error } = await supabase
        .rpc('get_staff_liaison_summary', {
          filter_date_from: filters.dateRange.from.toISOString(),
          filter_date_to: filters.dateRange.to.toISOString()
        });

      if (error) throw error;

      const duration = performance.now() - startTime;
      console.log(`Staff liaison report generated in ${duration.toFixed(2)}ms`);

      const reportData = this.processStaffLiaisonData(aggregatedData);
      this.setCache(cacheKey, reportData);
      return reportData;
    } catch (error) {
      logError('Failed to generate staff liaison report', 'error', {
        component: 'ReportingDataService',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Clear cache for specific report type or all cache
   */
  clearCache(type?: string): void {
    if (type) {
      const keysToDelete = Array.from(this.cache.keys()).filter(key => key.startsWith(type));
      keysToDelete.forEach(key => this.cache.delete(key));
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }

  private processClientReportData(
    client: any,
    recurringTasks: any[],
    taskInstances: any[]
  ): ClientDetailReportData {
    // Implement data processing logic here
    // This is a simplified version - the full implementation would include
    // all the calculations from the existing service
    
    const allTasks = [...recurringTasks, ...taskInstances];
    const completedTasks = allTasks.filter(t => t.status === 'Completed');
    
    return {
      client: {
        id: client.id,
        legalName: client.legal_name,
        primaryContact: client.primary_contact,
        email: client.email,
        phone: client.phone,
        industry: client.industry,
        status: client.status,
        staffLiaisonName: client.staff?.full_name
      },
      taskMetrics: {
        totalTasks: allTasks.length,
        completedTasks: completedTasks.length,
        activeTasks: allTasks.filter(t => t.status === 'In Progress' || t.status === 'Scheduled').length,
        overdueTasks: allTasks.filter(t => 
          t.due_date && 
          new Date(t.due_date) < new Date() && 
          t.status !== 'Completed'
        ).length,
        totalEstimatedHours: allTasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0),
        completedHours: completedTasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0),
        remainingHours: allTasks.filter(t => t.status !== 'Completed').reduce((sum, t) => sum + (t.estimated_hours || 0), 0),
        completionRate: allTasks.length > 0 ? (completedTasks.length / allTasks.length) * 100 : 0,
        averageTaskDuration: completedTasks.length > 0 
          ? completedTasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0) / completedTasks.length 
          : 0
      },
      revenueMetrics: {
        expectedMonthlyRevenue: client.expected_monthly_revenue || 0,
        ytdProjectedRevenue: (client.expected_monthly_revenue || 0) * 12,
        taskValueBreakdown: []
      },
      taskBreakdown: {
        recurring: recurringTasks.map(task => ({
          taskId: task.id,
          taskName: task.name,
          taskType: 'recurring' as const,
          category: task.category,
          status: task.status,
          priority: task.priority,
          estimatedHours: task.estimated_hours,
          dueDate: task.due_date ? new Date(task.due_date) : null,
          notes: task.notes
        })),
        adhoc: taskInstances.map(task => ({
          taskId: task.id,
          taskName: task.name,
          taskType: 'adhoc' as const,
          category: task.category,
          status: task.status,
          priority: task.priority,
          estimatedHours: task.estimated_hours,
          dueDate: task.due_date ? new Date(task.due_date) : null,
          completedDate: task.completed_at ? new Date(task.completed_at) : null,
          notes: task.notes
        }))
      },
      timeline: []
    };
  }

  private processStaffLiaisonData(data: any[]): StaffLiaisonReportData {
    // Process staff liaison aggregated data
    return {
      summary: data.map(item => ({
        staffLiaisonId: item.staff_id,
        staffLiaisonName: item.staff_name || 'Unassigned',
        clientCount: item.client_count || 0,
        expectedMonthlyRevenue: item.total_revenue || 0,
        activeTasksCount: item.active_tasks || 0,
        completedTasksCount: item.completed_tasks || 0,
        totalTasksCount: item.total_tasks || 0,
        averageRevenuePerClient: item.avg_revenue_per_client || 0,
        taskCompletionRate: item.completion_rate || 0
      })),
      availableStaff: [],
      totalRevenue: data.reduce((sum, item) => sum + (item.total_revenue || 0), 0),
      totalClients: data.reduce((sum, item) => sum + (item.client_count || 0), 0),
      totalTasks: data.reduce((sum, item) => sum + (item.total_tasks || 0), 0)
    };
  }
}

export const reportingDataService = new ReportingDataService();
export default reportingDataService;
