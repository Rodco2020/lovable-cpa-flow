
/**
 * Client Service Module
 * 
 * This module maintains backward compatibility with the previous non-modular
 * client service implementation. It re-exports functions from the modular 
 * client service structure in services/client directory.
 * 
 * Core functionality for client management including:
 * - Retrieving client information (by ID or all)
 * - Creating, updating, and deleting clients
 * - Getting staff members for liaison dropdown
 * - Client task management
 */

// Re-export all client services from the modular structure
export {
  // CRUD operations
  getClientById,
  getAllClients,
  getActiveClients,
  createClient,
  updateClient,
  deleteClient,
  
  // Staff liaison functionality
  getStaffForLiaisonDropdown,
  
  // Client-task functionality
  getClientAdHocTasks,
  getClientRecurringTasks,
  
  // Task copy functionality
  copyRecurringTask,
  copyAdHocTask,
  copyClientTasks
} from './client';
