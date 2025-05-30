
/**
 * Client Service Module
 * 
 * This module serves as the main entry point for all client-related functionality.
 * It re-exports functions from the various client service modules to maintain backward compatibility.
 */

// Re-export client CRUD operations
export {
  getClientById,
  getAllClients,
  getActiveClients,
  createClient,
  updateClient,
  deleteClient
} from './clientCrudService';

// Re-export staff liaison functionality
export {
  getStaffForLiaisonDropdown
} from './staffLiaisonService';

// Re-export client dashboard statistics (existing)
export {
  getClientDashboardStats,
  type ClientDashboardStats
} from './clientDashboardService';

// Re-export enhanced dashboard statistics (Phase 1 - new)
export {
  getFilteredClientStats,
  getEnhancedClientDashboardStats
} from './enhancedClientDashboardService';

// Re-export client-task functionality using new modular structure
export {
  getClientAdHocTasks,
  getClientRecurringTasks
} from '../clientTask';

// Re-export task copy functionality for backward compatibility
export {
  copyRecurringTask,
  copyAdHocTask,
  copyClientTasks
} from '../taskCopyService';
