import { supabase } from '@/integrations/supabase/client';

/**
 * Client Data Validator
 * 
 * Provides comprehensive client data validation and fallback lookup mechanisms
 * to handle client name mismatches, missing revenue data, and data quality issues
 */
export class ClientDataValidator {
  /**
   * Validate and enrich client revenue data for staff forecasting
   */
  static async validateAndEnrichClientData(
    taskClientIds: string[],
    taskClientNames: string[]
  ): Promise<{
    clientRevenueMap: Map<string, { id: string; legal_name: string; expected_monthly_revenue: number }>;
    validationReport: {
      totalClientsRequested: number;
      clientsFoundById: number;
      clientsFoundByName: number;
      clientsWithZeroRevenue: number;
      clientsWithMissingRevenue: number;
      unmatchedClientIds: string[];
      unmatchedClientNames: string[];
      dataQualityIssues: string[];
    };
  }> {
    console.log('🔍 [CLIENT VALIDATOR] Starting client data validation and enrichment');
    
    const clientRevenueMap = new Map<string, { id: string; legal_name: string; expected_monthly_revenue: number }>();
    const validationReport = {
      totalClientsRequested: Math.max(taskClientIds.length, taskClientNames.length),
      clientsFoundById: 0,
      clientsFoundByName: 0,
      clientsWithZeroRevenue: 0,
      clientsWithMissingRevenue: 0,
      unmatchedClientIds: [] as string[],
      unmatchedClientNames: [] as string[],
      dataQualityIssues: [] as string[]
    };

    try {
      // Step 1: Fetch all active clients with revenue data
      const { data: allClients, error } = await supabase
        .from('clients')
        .select('id, legal_name, expected_monthly_revenue')
        .eq('status', 'Active');

      if (error) {
        console.error('❌ [CLIENT VALIDATOR] Database error:', error);
        throw new Error(`Failed to fetch client data: ${error.message}`);
      }

      if (!allClients || allClients.length === 0) {
        validationReport.dataQualityIssues.push('No active clients found in database');
        return { clientRevenueMap, validationReport };
      }

      console.log(`📊 [CLIENT VALIDATOR] Found ${allClients.length} active clients in database`);

      // Step 2: Lookup by client IDs first (most reliable)
      const uniqueClientIds = [...new Set(taskClientIds.filter(Boolean))];
      for (const clientId of uniqueClientIds) {
        const client = allClients.find(c => c.id === clientId);
        if (client) {
          clientRevenueMap.set(client.legal_name, client);
          validationReport.clientsFoundById++;
          
          if (client.expected_monthly_revenue <= 0) {
            validationReport.clientsWithZeroRevenue++;
            validationReport.dataQualityIssues.push(`Client "${client.legal_name}" has zero or negative revenue: $${client.expected_monthly_revenue}`);
          }
        } else {
          validationReport.unmatchedClientIds.push(clientId);
          validationReport.dataQualityIssues.push(`Client ID "${clientId}" not found in active clients`);
        }
      }

      // Step 3: Fallback lookup by client names (for any remaining unmatched)
      const uniqueClientNames = [...new Set(taskClientNames.filter(Boolean))];
      const unmatchedNames = uniqueClientNames.filter(name => 
        !Array.from(clientRevenueMap.keys()).includes(name)
      );

      for (const clientName of unmatchedNames) {
        // Exact name match first
        let client = allClients.find(c => c.legal_name === clientName);
        
        if (!client) {
          // Fuzzy name match (case insensitive, trim whitespace)
          client = allClients.find(c => 
            c.legal_name.toLowerCase().trim() === clientName.toLowerCase().trim()
          );
        }

        if (client && !clientRevenueMap.has(client.legal_name)) {
          clientRevenueMap.set(client.legal_name, client);
          validationReport.clientsFoundByName++;
          
          if (client.expected_monthly_revenue <= 0) {
            validationReport.clientsWithZeroRevenue++;
            validationReport.dataQualityIssues.push(`Client "${client.legal_name}" has zero or negative revenue: $${client.expected_monthly_revenue}`);
          }
        } else if (!client) {
          validationReport.unmatchedClientNames.push(clientName);
          validationReport.dataQualityIssues.push(`Client name "${clientName}" not found in active clients`);
        }
      }

      // Step 4: Generate data quality summary
      const totalRevenueAvailable = Array.from(clientRevenueMap.values())
        .reduce((sum, client) => sum + client.expected_monthly_revenue, 0);

      console.log('📋 [CLIENT VALIDATOR] Validation complete:', {
        ...validationReport,
        totalClientsMatched: clientRevenueMap.size,
        totalRevenueAvailable: `$${totalRevenueAvailable}`,
        averageRevenue: clientRevenueMap.size > 0 ? `$${(totalRevenueAvailable / clientRevenueMap.size).toFixed(2)}` : '$0'
      });

      return { clientRevenueMap, validationReport };

    } catch (error) {
      console.error('❌ [CLIENT VALIDATOR] Critical error during validation:', error);
      validationReport.dataQualityIssues.push(`Critical validation error: ${error.message}`);
      return { clientRevenueMap, validationReport };
    }
  }

  /**
   * Create fallback client entries for unmatched clients with default revenue
   */
  static createFallbackClientEntries(
    unmatchedClientIds: string[],
    unmatchedClientNames: string[],
    defaultRevenue: number = 100
  ): Map<string, { id: string; legal_name: string; expected_monthly_revenue: number }> {
    const fallbackMap = new Map();
    
    console.log(`🔧 [CLIENT VALIDATOR] Creating fallback entries with $${defaultRevenue} default revenue`);

    // Create fallback entries for unmatched client names
    unmatchedClientNames.forEach(clientName => {
      if (clientName && clientName.trim()) {
        fallbackMap.set(clientName, {
          id: 'fallback-' + clientName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase(),
          legal_name: clientName,
          expected_monthly_revenue: defaultRevenue
        });
      }
    });

    // Create fallback entries for unmatched client IDs (use ID as name)
    unmatchedClientIds.forEach(clientId => {
      if (clientId && clientId.trim()) {
        const fallbackName = `Unknown Client (${clientId.slice(0, 8)})`;
        fallbackMap.set(fallbackName, {
          id: clientId,
          legal_name: fallbackName,
          expected_monthly_revenue: defaultRevenue
        });
      }
    });

    console.log(`🔧 [CLIENT VALIDATOR] Created ${fallbackMap.size} fallback client entries`);
    return fallbackMap;
  }

  /**
   * Comprehensive client data quality check
   */
  static async performDataQualityAudit(): Promise<{
    totalActiveClients: number;
    clientsWithRevenue: number;
    clientsWithZeroRevenue: number;
    averageRevenue: number;
    topRevenueClients: Array<{ name: string; revenue: number }>;
    dataQualityScore: number;
    recommendations: string[];
  }> {
    console.log('🔍 [CLIENT VALIDATOR] Performing comprehensive data quality audit...');

    try {
      const { data: clients, error } = await supabase
        .from('clients')
        .select('legal_name, expected_monthly_revenue')
        .eq('status', 'Active');

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      const totalActiveClients = clients?.length || 0;
      const clientsWithRevenue = clients?.filter(c => c.expected_monthly_revenue > 0).length || 0;
      const clientsWithZeroRevenue = totalActiveClients - clientsWithRevenue;
      
      const totalRevenue = clients?.reduce((sum, c) => sum + (c.expected_monthly_revenue || 0), 0) || 0;
      const averageRevenue = clientsWithRevenue > 0 ? totalRevenue / clientsWithRevenue : 0;

      const topRevenueClients = clients
        ?.filter(c => c.expected_monthly_revenue > 0)
        ?.sort((a, b) => b.expected_monthly_revenue - a.expected_monthly_revenue)
        ?.slice(0, 5)
        ?.map(c => ({ name: c.legal_name, revenue: c.expected_monthly_revenue })) || [];

      // Calculate data quality score (0-100)
      const revenueCompleteness = totalActiveClients > 0 ? (clientsWithRevenue / totalActiveClients) * 100 : 0;
      const dataQualityScore = Math.round(revenueCompleteness);

      // Generate recommendations
      const recommendations = [];
      if (clientsWithZeroRevenue > 0) {
        recommendations.push(`${clientsWithZeroRevenue} clients have zero or missing revenue data - consider updating these records`);
      }
      if (averageRevenue < 50) {
        recommendations.push('Average client revenue seems low - verify revenue data accuracy');
      }
      if (dataQualityScore < 80) {
        recommendations.push('Revenue data completeness is below 80% - focus on data entry improvement');
      }

      const auditResult = {
        totalActiveClients,
        clientsWithRevenue,
        clientsWithZeroRevenue,
        averageRevenue,
        topRevenueClients,
        dataQualityScore,
        recommendations
      };

      console.log('📊 [CLIENT VALIDATOR] Data quality audit complete:', auditResult);
      return auditResult;

    } catch (error) {
      console.error('❌ [CLIENT VALIDATOR] Error during data quality audit:', error);
      throw error;
    }
  }
}