
import { supabase } from '@/lib/supabaseClient';
import { ClientReportFilters, ClientDetailReportData, ClientTaskDetail, ClientTaskMetrics, ClientRevenueMetrics } from '@/types/clientReporting';

export const getClientDetailReport = async (
  clientId: string, 
  filters: ClientReportFilters
): Promise<ClientDetailReportData> => {
  try {
    console.log('Generating client detail report for:', clientId);

    // Get client information
    const { data: client, error: clientError } = await supabase
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
        staff_liaison_id
      `)
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      throw new Error('Client not found');
    }

    // Get staff liaison name if exists
    let staffLiaisonName = undefined;
    if (client.staff_liaison_id) {
      const { data: staff } = await supabase
        .from('staff')
        .select('full_name')
        .eq('id', client.staff_liaison_id)
        .single();
      
      staffLiaisonName = staff?.full_name;
    }

    // Get recurring tasks
    const { data: recurringTasks, error: recurringError } = await supabase
      .from('recurring_tasks')
      .select('*')
      .eq('client_id', clientId);

    if (recurringError) {
      console.error('Error fetching recurring tasks:', recurringError);
      throw recurringError;
    }

    // Get task instances
    const { data: taskInstances, error: instancesError } = await supabase
      .from('task_instances')
      .select('*')
      .eq('client_id', clientId);

    if (instancesError) {
      console.error('Error fetching task instances:', instancesError);
      throw instancesError;
    }

    // Get staff names for assignments
    const staffIds = [
      ...new Set([
        ...(taskInstances?.map(t => t.assigned_staff_id).filter(Boolean) || [])
      ])
    ];

    const { data: staffData } = await supabase
      .from('staff')
      .select('id, full_name')
      .in('id', staffIds);

    const staffMap = new Map(staffData?.map(s => [s.id, s.full_name]) || []);

    // Process recurring tasks
    const recurringTaskDetails: ClientTaskDetail[] = (recurringTasks || []).map(task => ({
      taskId: task.id,
      taskName: task.name,
      taskType: 'recurring',
      category: task.category,
      status: task.status,
      priority: task.priority,
      estimatedHours: task.estimated_hours,
      dueDate: task.due_date ? new Date(task.due_date) : null,
      notes: task.notes
    }));

    // Process task instances
    const adhocTaskDetails: ClientTaskDetail[] = (taskInstances || []).map(task => ({
      taskId: task.id,
      taskName: task.name,
      taskType: 'adhoc',
      category: task.category,
      status: task.status,
      priority: task.priority,
      estimatedHours: task.estimated_hours,
      dueDate: task.due_date ? new Date(task.due_date) : null,
      completedDate: task.completed_at ? new Date(task.completed_at) : null,
      assignedStaffName: task.assigned_staff_id ? staffMap.get(task.assigned_staff_id) : undefined,
      notes: task.notes
    }));

    // Calculate task metrics
    const allTasks = [...recurringTaskDetails, ...adhocTaskDetails];
    const completedTasks = allTasks.filter(t => t.status === 'Completed');
    const activeTasks = allTasks.filter(t => t.status === 'In Progress' || t.status === 'Scheduled');
    const overdueTasks = allTasks.filter(t => 
      t.dueDate && 
      t.dueDate < new Date() && 
      t.status !== 'Completed'
    );

    const taskMetrics: ClientTaskMetrics = {
      totalTasks: allTasks.length,
      completedTasks: completedTasks.length,
      activeTasks: activeTasks.length,
      overdueTasks: overdueTasks.length,
      totalEstimatedHours: allTasks.reduce((sum, t) => sum + t.estimatedHours, 0),
      completedHours: completedTasks.reduce((sum, t) => sum + t.estimatedHours, 0),
      remainingHours: activeTasks.reduce((sum, t) => sum + t.estimatedHours, 0),
      completionRate: allTasks.length > 0 ? (completedTasks.length / allTasks.length) * 100 : 0,
      averageTaskDuration: completedTasks.length > 0 
        ? completedTasks.reduce((sum, t) => sum + t.estimatedHours, 0) / completedTasks.length 
        : 0
    };

    // Calculate revenue metrics
    const categoryBreakdown = allTasks.reduce((acc, task) => {
      if (!acc[task.category]) {
        acc[task.category] = { estimated: 0, completed: 0 };
      }
      acc[task.category].estimated += task.estimatedHours * 150; // Assume $150/hour
      if (task.status === 'Completed') {
        acc[task.category].completed += task.estimatedHours * 150;
      }
      return acc;
    }, {} as Record<string, { estimated: number; completed: number }>);

    const revenueMetrics: ClientRevenueMetrics = {
      expectedMonthlyRevenue: client.expected_monthly_revenue || 0,
      ytdProjectedRevenue: (client.expected_monthly_revenue || 0) * 12,
      taskValueBreakdown: Object.entries(categoryBreakdown).map(([category, values]) => ({
        category,
        estimatedValue: values.estimated,
        completedValue: values.completed
      }))
    };

    // Generate timeline (last 12 months)
    const timeline = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7);
      
      const monthTasks = completedTasks.filter(t => 
        t.completedDate && 
        t.completedDate.toISOString().slice(0, 7) === monthKey
      );

      return {
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        tasksCompleted: monthTasks.length,
        revenue: monthTasks.reduce((sum, t) => sum + (t.estimatedHours * 150), 0)
      };
    }).reverse();

    return {
      client: {
        id: client.id,
        legalName: client.legal_name,
        primaryContact: client.primary_contact,
        email: client.email,
        phone: client.phone,
        industry: client.industry,
        status: client.status,
        staffLiaisonName
      },
      taskMetrics,
      revenueMetrics,
      taskBreakdown: {
        recurring: recurringTaskDetails,
        adhoc: adhocTaskDetails
      },
      timeline
    };
  } catch (error) {
    console.error('Error generating client detail report:', error);
    throw error;
  }
};

export const getClientsList = async (): Promise<Array<{ id: string; legalName: string }>> => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('id, legal_name')
      .eq('status', 'Active')
      .order('legal_name');

    if (error) {
      throw error;
    }

    return data.map(client => ({
      id: client.id,
      legalName: client.legal_name
    }));
  } catch (error) {
    console.error('Error fetching clients list:', error);
    throw error;
  }
};
