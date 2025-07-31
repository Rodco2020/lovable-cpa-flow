import { supabase } from '@/integrations/supabase/client';
import { ClientDataValidator } from '../validation/clientDataValidator';

/**
 * Revenue Diagnostic Service
 * 
 * Provides diagnostic tools to troubleshoot revenue calculation issues
 */
export class RevenueDiagnostic {
  /**
   * Run comprehensive revenue diagnostic for a specific staff member
   */
  static async diagnoseStaffRevenue(staffName: string): Promise<void> {
    console.log(`🔍 [REVENUE DIAGNOSTIC] Starting comprehensive revenue diagnostic for ${staffName}`);
    
    try {
      // Step 1: Check staff member exists and get their tasks
      const { data: staff, error: staffError } = await supabase
        .from('staff')
        .select('id, full_name, cost_per_hour, assigned_skills')
        .eq('full_name', staffName)
        .single();

      if (staffError || !staff) {
        console.error(`❌ [REVENUE DIAGNOSTIC] Staff member "${staffName}" not found`);
        return;
      }

      console.log(`✅ [REVENUE DIAGNOSTIC] Found staff:`, staff);

      // Step 2: Get their assigned tasks
      const { data: tasks, error: tasksError } = await supabase
        .from('recurring_tasks')
        .select(`
          *, 
          clients!inner(id, legal_name, expected_monthly_revenue)
        `)
        .eq('preferred_staff_id', staff.id)
        .eq('status', 'Unscheduled');

      if (tasksError) {
        console.error(`❌ [REVENUE DIAGNOSTIC] Error fetching tasks:`, tasksError);
        return;
      }

      console.log(`📋 [REVENUE DIAGNOSTIC] Found ${tasks?.length || 0} tasks for ${staffName}`);

      if (!tasks || tasks.length === 0) {
        console.log(`⚠️ [REVENUE DIAGNOSTIC] No tasks assigned to ${staffName} - this explains $0 revenue`);
        return;
      }

      // Step 3: Analyze client data quality
      const taskClientIds = tasks.map(task => task.client_id);
      const taskClientNames = tasks.map(task => task.clients?.legal_name || 'Unknown');

      console.log(`🔍 [REVENUE DIAGNOSTIC] Task-client relationships:`, 
        tasks.map(task => ({
          taskName: task.name,
          clientId: task.client_id,
          clientName: task.clients?.legal_name,
          expectedRevenue: task.clients?.expected_monthly_revenue
        }))
      );

      // Step 4: Use enhanced client validator
      const { clientRevenueMap, validationReport } = await ClientDataValidator.validateAndEnrichClientData(
        taskClientIds,
        taskClientNames
      );

      console.log(`📊 [REVENUE DIAGNOSTIC] Client validation results:`, validationReport);
      console.log(`💰 [REVENUE DIAGNOSTIC] Client revenue map:`, 
        Array.from(clientRevenueMap.entries()).map(([name, data]) => ({
          clientName: name,
          expectedMonthlyRevenue: data.expected_monthly_revenue
        }))
      );

      // Step 5: Check skill fee rates
      const skillNames = [...new Set(tasks.flatMap(task => task.required_skills || []))];
      console.log(`🎯 [REVENUE DIAGNOSTIC] Required skills:`, skillNames);

      const { data: skillRates, error: skillError } = await supabase
        .from('skills')
        .select('name, fee_per_hour')
        .in('name', skillNames);

      if (skillError) {
        console.error(`❌ [REVENUE DIAGNOSTIC] Error fetching skill rates:`, skillError);
      } else {
        console.log(`💵 [REVENUE DIAGNOSTIC] Skill fee rates:`, skillRates);
      }

      // Step 6: Perform data quality audit
      const auditResult = await ClientDataValidator.performDataQualityAudit();
      console.log(`📈 [REVENUE DIAGNOSTIC] Data quality audit:`, auditResult);

      // Step 7: Final summary
      console.log(`📋 [REVENUE DIAGNOSTIC] Summary for ${staffName}:`);
      console.log(`- Tasks assigned: ${tasks.length}`);
      console.log(`- Clients with revenue data: ${validationReport.clientsFoundById + validationReport.clientsFoundByName}`);
      console.log(`- Clients with zero revenue: ${validationReport.clientsWithZeroRevenue}`);
      console.log(`- Data quality issues: ${validationReport.dataQualityIssues.length}`);
      console.log(`- Available skill rates: ${skillRates?.length || 0}/${skillNames.length}`);

      if (validationReport.dataQualityIssues.length > 0) {
        console.log(`⚠️ [REVENUE DIAGNOSTIC] Issues found:`, validationReport.dataQualityIssues);
      }

    } catch (error) {
      console.error(`❌ [REVENUE DIAGNOSTIC] Critical error:`, error);
    }
  }

  /**
   * Quick diagnostic for all staff with $0 revenue
   */
  static async diagnoseZeroRevenueStaff(): Promise<void> {
    console.log(`🔍 [REVENUE DIAGNOSTIC] Finding staff with potential $0 revenue issues`);

    try {
      // Get all staff with tasks
      const { data: staffWithTasks, error } = await supabase
        .from('recurring_tasks')
        .select(`
          preferred_staff_id,
          staff:preferred_staff_id(full_name),
          clients!inner(legal_name, expected_monthly_revenue)
        `)
        .eq('status', 'Unscheduled')
        .not('preferred_staff_id', 'is', null);

      if (error) {
        console.error(`❌ [REVENUE DIAGNOSTIC] Error fetching staff tasks:`, error);
        return;
      }

      // Group by staff
      const staffGroups = new Map();
      staffWithTasks?.forEach(task => {
        const staffName = task.staff?.full_name;
        if (staffName) {
          if (!staffGroups.has(staffName)) {
            staffGroups.set(staffName, []);
          }
          staffGroups.get(staffName).push(task);
        }
      });

      console.log(`📊 [REVENUE DIAGNOSTIC] Found ${staffGroups.size} staff members with tasks`);

      // Analyze each staff member
      for (const [staffName, tasks] of staffGroups) {
        const clientsWithRevenue = tasks.filter(task => 
          task.clients?.expected_monthly_revenue > 0
        ).length;
        
        const totalTasks = tasks.length;
        const revenueIssueRisk = clientsWithRevenue === 0 ? 'HIGH' : 
                                clientsWithRevenue < totalTasks ? 'MEDIUM' : 'LOW';

        console.log(`👤 [REVENUE DIAGNOSTIC] ${staffName}: ${totalTasks} tasks, ${clientsWithRevenue} with revenue (Risk: ${revenueIssueRisk})`);
        
        if (revenueIssueRisk === 'HIGH') {
          console.log(`🚨 [REVENUE DIAGNOSTIC] ${staffName} likely has $0 revenue - no clients with positive revenue`);
        }
      }

    } catch (error) {
      console.error(`❌ [REVENUE DIAGNOSTIC] Error in zero revenue diagnostic:`, error);
    }
  }
}