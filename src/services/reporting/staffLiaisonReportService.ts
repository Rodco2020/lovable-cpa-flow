
import { supabase } from '@/lib/supabaseClient';
import { ReportFilters, StaffLiaisonReportData, StaffLiaisonSummaryData, ClientTaskDetail } from '@/types/reporting';

/**
 * Staff Liaison Report Service
 * 
 * Provides functionality for generating staff liaison revenue reports
 * including revenue calculations, task counts, and client assignments.
 */

export const getStaffLiaisonReportData = async (filters: ReportFilters): Promise<StaffLiaisonReportData> => {
  try {
    console.log('Fetching staff liaison report data with filters:', filters);

    // Get all clients with their liaison assignments and expected revenue
    const { data: clientsData, error: clientsError } = await supabase
      .from('clients')
      .select(`
        id,
        legal_name,
        staff_liaison_id,
        expected_monthly_revenue,
        status
      `)
      .eq('status', 'Active');

    if (clientsError) {
      console.error('Error fetching clients:', clientsError);
      throw clientsError;
    }

    // Get staff members for liaison names
    const { data: staffData, error: staffError } = await supabase
      .from('staff')
      .select('id, full_name')
      .eq('status', 'active');

    if (staffError) {
      console.error('Error fetching staff:', staffError);
      throw staffError;
    }

    // Get task counts by client
    const { data: recurringTasks, error: recurringError } = await supabase
      .from('recurring_tasks')
      .select('client_id, status, is_active');

    if (recurringError) {
      console.error('Error fetching recurring tasks:', recurringError);
      throw recurringError;
    }

    const { data: taskInstances, error: instancesError } = await supabase
      .from('task_instances')
      .select('client_id, status');

    if (instancesError) {
      console.error('Error fetching task instances:', instancesError);
      throw instancesError;
    }

    // Create staff lookup map
    const staffMap = new Map(staffData.map(staff => [staff.id, staff.full_name]));

    // Group clients by staff liaison
    const liaisonGroups = new Map<string, any[]>();

    clientsData.forEach(client => {
      const liaisonId = client.staff_liaison_id || 'unassigned';
      if (!liaisonGroups.has(liaisonId)) {
        liaisonGroups.set(liaisonId, []);
      }
      liaisonGroups.get(liaisonId)!.push(client);
    });

    // Calculate summary data for each liaison
    const summary: StaffLiaisonSummaryData[] = [];

    for (const [liaisonId, clients] of liaisonGroups) {
      const liaisonName = liaisonId === 'unassigned' 
        ? 'Unassigned'
        : staffMap.get(liaisonId) || 'Unknown Staff';

      const clientIds = clients.map(c => c.id);
      
      // Calculate revenue
      const expectedMonthlyRevenue = clients.reduce(
        (sum, client) => sum + (client.expected_monthly_revenue || 0), 
        0
      );

      // Count tasks for these clients
      const clientRecurringTasks = recurringTasks.filter(task => 
        clientIds.includes(task.client_id)
      );
      
      const clientTaskInstances = taskInstances.filter(task => 
        clientIds.includes(task.client_id)
      );

      const activeTasksCount = clientRecurringTasks.filter(task => 
        task.is_active && task.status !== 'Completed'
      ).length + clientTaskInstances.filter(task => 
        task.status === 'Scheduled' || task.status === 'In Progress'
      ).length;

      const completedTasksCount = clientRecurringTasks.filter(task => 
        task.status === 'Completed'
      ).length + clientTaskInstances.filter(task => 
        task.status === 'Completed'
      ).length;

      const totalTasksCount = clientRecurringTasks.length + clientTaskInstances.length;

      const averageRevenuePerClient = clients.length > 0 
        ? expectedMonthlyRevenue / clients.length 
        : 0;

      const taskCompletionRate = totalTasksCount > 0 
        ? (completedTasksCount / totalTasksCount) * 100 
        : 0;

      summary.push({
        staffLiaisonId: liaisonId === 'unassigned' ? null : liaisonId,
        staffLiaisonName: liaisonName,
        clientCount: clients.length,
        expectedMonthlyRevenue,
        activeTasksCount,
        completedTasksCount,
        totalTasksCount,
        averageRevenuePerClient,
        taskCompletionRate
      });
    }

    // Sort by revenue descending
    summary.sort((a, b) => b.expectedMonthlyRevenue - a.expectedMonthlyRevenue);

    // Calculate totals
    const totalRevenue = summary.reduce((sum, item) => sum + item.expectedMonthlyRevenue, 0);
    const totalClients = summary.reduce((sum, item) => sum + item.clientCount, 0);
    const totalTasks = summary.reduce((sum, item) => sum + item.totalTasksCount, 0);

    console.log('Staff liaison report data generated successfully');

    return {
      summary,
      availableStaff: staffData,
      totalRevenue,
      totalClients,
      totalTasks
    };
  } catch (error) {
    console.error('Error generating staff liaison report:', error);
    throw error;
  }
};

export const getClientTasksByLiaison = async (
  liaisonId: string | null, 
  filters: ReportFilters
): Promise<ClientTaskDetail[]> => {
  try {
    console.log('Fetching client tasks for liaison:', liaisonId);

    // Get clients for this liaison
    let clientsQuery = supabase
      .from('clients')
      .select('id, legal_name, expected_monthly_revenue');

    if (liaisonId) {
      clientsQuery = clientsQuery.eq('staff_liaison_id', liaisonId);
    } else {
      clientsQuery = clientsQuery.is('staff_liaison_id', null);
    }

    const { data: clients, error: clientsError } = await clientsQuery;

    if (clientsError) {
      console.error('Error fetching clients for liaison:', clientsError);
      throw clientsError;
    }

    if (!clients || clients.length === 0) {
      return [];
    }

    const clientIds = clients.map(c => c.id);
    const clientMap = new Map(clients.map(c => [c.id, c]));

    const details: ClientTaskDetail[] = [];

    // Get recurring tasks
    const { data: recurringTasks, error: recurringError } = await supabase
      .from('recurring_tasks')
      .select('*')
      .in('client_id', clientIds);

    if (recurringError) {
      console.error('Error fetching recurring tasks:', recurringError);
      throw recurringError;
    }

    // Get task instances
    const { data: taskInstances, error: instancesError } = await supabase
      .from('task_instances')
      .select('*')
      .in('client_id', clientIds);

    if (instancesError) {
      console.error('Error fetching task instances:', instancesError);
      throw instancesError;
    }

    // Process recurring tasks
    recurringTasks?.forEach(task => {
      const client = clientMap.get(task.client_id);
      if (client) {
        details.push({
          clientId: task.client_id,
          clientName: client.legal_name,
          taskId: task.id,
          taskName: task.name,
          taskType: 'recurring',
          status: task.status,
          priority: task.priority,
          estimatedHours: task.estimated_hours,
          dueDate: task.due_date ? new Date(task.due_date) : null,
          expectedRevenue: client.expected_monthly_revenue || 0
        });
      }
    });

    // Process task instances
    taskInstances?.forEach(task => {
      const client = clientMap.get(task.client_id);
      if (client) {
        details.push({
          clientId: task.client_id,
          clientName: client.legal_name,
          taskId: task.id,
          taskName: task.name,
          taskType: 'adhoc',
          status: task.status,
          priority: task.priority,
          estimatedHours: task.estimated_hours,
          dueDate: task.due_date ? new Date(task.due_date) : null,
          expectedRevenue: client.expected_monthly_revenue || 0
        });
      }
    });

    console.log(`Found ${details.length} tasks for liaison`);
    return details;
  } catch (error) {
    console.error('Error fetching client tasks by liaison:', error);
    throw error;
  }
};
