-- Phase 1: Add performance indexes for client tasks optimization
-- These indexes will significantly improve query performance for the optimized fetching

-- Index for recurring tasks filtered by client and active status
CREATE INDEX IF NOT EXISTS idx_recurring_tasks_client_active 
ON recurring_tasks(client_id, is_active);

-- Index for recurring tasks preferred staff lookups
CREATE INDEX IF NOT EXISTS idx_recurring_tasks_staff 
ON recurring_tasks(preferred_staff_id);

-- Index for task instances filtered by client and status
CREATE INDEX IF NOT EXISTS idx_task_instances_client_status 
ON task_instances(client_id, status);

-- Additional indexes to optimize the joins used in the optimized query
CREATE INDEX IF NOT EXISTS idx_clients_staff_liaison 
ON clients(staff_liaison_id);

-- Index for task templates lookups (frequently joined)
CREATE INDEX IF NOT EXISTS idx_recurring_tasks_template 
ON recurring_tasks(template_id);