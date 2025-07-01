
import { Client } from '@/types/client';

/**
 * Staff Liaison Service
 * 
 * Handles staff liaison information extraction and processing for tasks.
 * Provides a centralized way to get staff liaison data from client records.
 */
export class StaffLiaisonService {
  /**
   * Get staff liaison information from client data
   * @param client Client object containing potential staff liaison information
   * @returns Object with staff liaison ID and name if available
   */
  static getStaffLiaisonInfo(client: Client): { staffLiaisonId?: string; staffLiaisonName?: string } {
    // Note: This assumes the client object contains staff liaison information
    // If staff liaison data needs to be fetched separately, this method would need to be updated
    return {
      staffLiaisonId: client.staffLiaisonId || undefined,
      staffLiaisonName: client.staffLiaisonName || undefined
    };
  }
}
