import { supabase } from '@/integrations/supabase/client';
import { debugLog } from '../logger';

/**
 * Client Resolution Service
 * Handles consistent resolution of client UUIDs to names across the demand matrix system
 */
export class ClientResolutionService {
  private static clientCache = new Map<string, string>(); // UUID -> name
  private static cacheInitialized = false;
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private static cacheTimestamp = 0;

  /**
   * Initialize client cache from database
   */
  static async initializeClientCache(): Promise<void> {
    const now = Date.now();
    
    // Check if cache is still valid
    if (this.cacheInitialized && (now - this.cacheTimestamp) < this.CACHE_TTL) {
      return;
    }

    try {
      debugLog('Initializing client cache...');
      
      const { data: clients, error } = await supabase
        .from('clients')
        .select('id, legal_name')
        .eq('status', 'Active');

      if (error) {
        console.error('Error loading clients for cache:', error);
        return;
      }

      if (Array.isArray(clients)) {
        this.clientCache.clear();
        
        clients.forEach(client => {
          if (client.id && client.legal_name) {
            this.clientCache.set(client.id, client.legal_name);
          }
        });

        this.cacheInitialized = true;
        this.cacheTimestamp = now;
        debugLog(`Initialized client cache with ${clients.length} clients`);
      }
    } catch (error) {
      console.error('Failed to initialize client cache:', error);
    }
  }

  /**
   * Resolve client UUIDs to names with fallback handling
   */
  static async resolveClientIds(clientIds: string[]): Promise<Map<string, string>> {
    await this.initializeClientCache();

    const resolvedClients = new Map<string, string>();
    const unresolvedIds: string[] = [];

    console.log('🔍 [CLIENT RESOLUTION] Resolving client IDs:', clientIds);

    // First pass: try to resolve from cache
    for (const clientId of clientIds) {
      if (!clientId || typeof clientId !== 'string') {
        continue;
      }

      const trimmedId = clientId.trim();
      
      if (this.isValidUUID(trimmedId)) {
        const clientName = this.clientCache.get(trimmedId);
        if (clientName) {
          resolvedClients.set(trimmedId, clientName);
          console.log(`✅ [CLIENT RESOLUTION] Resolved ${trimmedId} -> ${clientName}`);
        } else {
          unresolvedIds.push(trimmedId);
        }
      } else {
        // Already a name - keep as is
        resolvedClients.set(trimmedId, trimmedId);
        console.log(`📝 [CLIENT RESOLUTION] Keeping name as-is: ${trimmedId}`);
      }
    }

    // Second pass: fetch unresolved clients from database
    if (unresolvedIds.length > 0) {
      console.log('🔄 [CLIENT RESOLUTION] Fetching unresolved clients:', unresolvedIds);
      
      try {
        const { data: clients, error } = await supabase
          .from('clients')
          .select('id, legal_name')
          .in('id', unresolvedIds);

        if (!error && Array.isArray(clients)) {
          clients.forEach(client => {
            if (client.id && client.legal_name) {
              resolvedClients.set(client.id, client.legal_name);
              this.clientCache.set(client.id, client.legal_name); // Update cache
              console.log(`✅ [CLIENT RESOLUTION] Fetched ${client.id} -> ${client.legal_name}`);
            }
          });
        }
      } catch (error) {
        console.warn('Error fetching unresolved clients:', error);
      }
    }

    // Third pass: add fallback names for still unresolved UUIDs
    for (const clientId of unresolvedIds) {
      if (!resolvedClients.has(clientId)) {
        const fallbackName = `Client ${clientId.substring(0, 8)}...`;
        resolvedClients.set(clientId, fallbackName);
        console.log(`⚠️ [CLIENT RESOLUTION] Using fallback for ${clientId} -> ${fallbackName}`);
      }
    }

    console.log(`📊 [CLIENT RESOLUTION] Final resolution map:`, Array.from(resolvedClients.entries()));
    return resolvedClients;
  }

  /**
   * Get resolved client name for a single ID
   */
  static async getClientName(clientId: string): Promise<string> {
    const resolved = await this.resolveClientIds([clientId]);
    return resolved.get(clientId) || `Client ${clientId.substring(0, 8)}...`;
  }

  /**
   * Check if a string is a valid UUID
   */
  private static isValidUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  /**
   * Clear the client cache
   */
  static clearCache(): void {
    this.clientCache.clear();
    this.cacheInitialized = false;
    this.cacheTimestamp = 0;
    debugLog('Client cache cleared');
  }

  /**
   * Get cache statistics for debugging
   */
  static getCacheStats(): { clientsCount: number; lastUpdate: number; age: number } {
    return {
      clientsCount: this.clientCache.size,
      lastUpdate: this.cacheTimestamp,
      age: Date.now() - this.cacheTimestamp
    };
  }
}
