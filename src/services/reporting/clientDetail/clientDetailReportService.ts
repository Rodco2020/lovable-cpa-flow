
/**
 * Refactored Client Detail Report Service
 * 
 * Provides client detail report functionality using modular architecture
 * while maintaining backward compatibility with existing API
 */

import { ClientReportFilters, ClientDetailReportData } from '@/types/clientReporting';
import { ClientDetailDataAccess } from './dataAccess';
import { ClientDetailDataProcessor } from './dataProcessor';

export class ClientDetailReportService {
  private dataAccess: ClientDetailDataAccess;
  private processor: ClientDetailDataProcessor;

  constructor() {
    this.dataAccess = new ClientDetailDataAccess();
    this.processor = new ClientDetailDataProcessor();
  }

  /**
   * Generate client detail report
   */
  async getClientDetailReport(
    clientId: string, 
    filters: ClientReportFilters
  ): Promise<ClientDetailReportData> {
    try {
      console.log('Generating client detail report for:', clientId);

      // Get client information
      const client = await this.dataAccess.getClientWithLiaison(clientId);

      // Get staff liaison name if exists
      const staffLiaisonName = await this.dataAccess.getStaffLiaisonName(client.staff_liaison_id);

      // Fetch task data in parallel
      const [recurringTasks, taskInstances] = await Promise.all([
        this.dataAccess.getRecurringTasks(clientId),
        this.dataAccess.getTaskInstances(clientId)
      ]);

      // Get staff mapping for assignments
      const staffMap = await this.dataAccess.getStaffMap(taskInstances);

      // Process and return report data
      return this.processor.processClientReportData({
        client,
        recurringTasks,
        taskInstances,
        staffMap
      }, staffLiaisonName);

    } catch (error) {
      console.error('Error generating client detail report:', error);
      throw error;
    }
  }

  /**
   * Get list of active clients
   */
  async getClientsList(): Promise<Array<{ id: string; legalName: string }>> {
    try {
      return await this.dataAccess.getActiveClientsList();
    } catch (error) {
      console.error('Error fetching clients list:', error);
      throw error;
    }
  }
}

// Create singleton instance for backward compatibility
const clientDetailReportService = new ClientDetailReportService();

// Export both class and instance for flexibility
export { clientDetailReportService };
export default clientDetailReportService;

// Export the functions for backward compatibility
export const getClientDetailReport = (
  clientId: string, 
  filters: ClientReportFilters
): Promise<ClientDetailReportData> => {
  return clientDetailReportService.getClientDetailReport(clientId, filters);
};

export const getClientsList = (): Promise<Array<{ id: string; legalName: string }>> => {
  return clientDetailReportService.getClientsList();
};
