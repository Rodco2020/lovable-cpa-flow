
/**
 * Refactored Staff Liaison Report Service
 * 
 * Provides staff liaison report functionality using modular architecture
 * while maintaining backward compatibility with existing API
 */

import { ReportFilters, StaffLiaisonReportData, ClientTaskDetail } from '@/types/reporting';
import { StaffLiaisonDataAccess } from './dataAccess';
import { StaffLiaisonDataProcessor } from './dataProcessor';

export class StaffLiaisonReportService {
  private dataAccess: StaffLiaisonDataAccess;
  private processor: StaffLiaisonDataProcessor;

  constructor() {
    this.dataAccess = new StaffLiaisonDataAccess();
    this.processor = new StaffLiaisonDataProcessor();
  }

  /**
   * Generate staff liaison report data
   */
  async getStaffLiaisonReportData(filters: ReportFilters): Promise<StaffLiaisonReportData> {
    try {
      console.log('Fetching staff liaison report data with filters:', filters);

      // Fetch all required data in parallel
      const [clientsData, staffData, recurringTasks, taskInstances] = await Promise.all([
        this.dataAccess.getClientsData(),
        this.dataAccess.getStaffData(),
        this.dataAccess.getRecurringTasks(),
        this.dataAccess.getTaskInstances()
      ]);

      // Process and return report data
      const result = this.processor.processStaffLiaisonData({
        clientsData,
        staffData,
        recurringTasks,
        taskInstances
      });

      console.log('Staff liaison report data generated successfully');
      return result;

    } catch (error) {
      console.error('Error generating staff liaison report:', error);
      throw error;
    }
  }

  /**
   * Get client tasks by liaison
   */
  async getClientTasksByLiaison(
    liaisonId: string | null, 
    filters: ReportFilters
  ): Promise<ClientTaskDetail[]> {
    try {
      console.log('Fetching client tasks for liaison:', liaisonId);

      // Get clients for this liaison
      const clients = await this.dataAccess.getClientsForLiaison(liaisonId);

      if (!clients || clients.length === 0) {
        return [];
      }

      const clientIds = clients.map(c => c.id);
      const clientMap = new Map(clients.map(c => [c.id, c]));

      // Get tasks for these clients in parallel
      const [recurringTasks, taskInstances] = await Promise.all([
        this.dataAccess.getRecurringTasksForClients(clientIds),
        this.dataAccess.getTaskInstancesForClients(clientIds)
      ]);

      // Process and return task details
      const details = this.processor.processClientTasksByLiaison(
        {
          liaisonId,
          filters,
          clients,
          clientMap
        },
        recurringTasks,
        taskInstances
      );

      console.log(`Found ${details.length} tasks for liaison`);
      return details;

    } catch (error) {
      console.error('Error fetching client tasks by liaison:', error);
      throw error;
    }
  }
}

// Create singleton instance for backward compatibility
const staffLiaisonReportService = new StaffLiaisonReportService();

// Export both class and instance for flexibility
export { staffLiaisonReportService };
export default staffLiaisonReportService;

// Export the functions for backward compatibility
export const getStaffLiaisonReportData = (filters: ReportFilters): Promise<StaffLiaisonReportData> => {
  return staffLiaisonReportService.getStaffLiaisonReportData(filters);
};

export const getClientTasksByLiaison = (
  liaisonId: string | null, 
  filters: ReportFilters
): Promise<ClientTaskDetail[]> => {
  return staffLiaisonReportService.getClientTasksByLiaison(liaisonId, filters);
};
