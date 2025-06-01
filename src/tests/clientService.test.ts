
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getAllClients, getClientById, createClient, updateClient, deleteClient, getClientRecurringTasks, getClientAdHocTasks } from '@/services/clientService';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client', () => {
  const supabaseMock = {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          single: vi.fn(() => ({
            data: {},
            error: null,
          })),
          data: [],
          error: null,
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: {},
            error: null,
          })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: {},
              error: null,
            })),
          })),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: {},
            error: null,
          })),
        })),
      })),
    })),
  };
  return { supabase: supabaseMock };
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Client Service', () => {
  describe('getAllClients', () => {
    it('should fetch all clients', async () => {
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });

      await getAllClients();
      expect(supabase.from).toHaveBeenCalledWith('clients');
      expect(supabase.from().select).toHaveBeenCalledWith('*');
      expect(supabase.from().select().order).toHaveBeenCalledWith('legal_name');
    });
  });

  describe('getClientById', () => {
    it('should fetch a client by ID', async () => {
      const clientId = 'client-1';
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: {}, error: null }),
          }),
        }),
      });

      await getClientById(clientId);
      expect(supabase.from).toHaveBeenCalledWith('clients');
      expect(supabase.from().select).toHaveBeenCalledWith('*');
      expect(supabase.from().select().eq).toHaveBeenCalledWith('id', clientId);
    });
  });

  describe('createClient', () => {
    it('should create a new client', async () => {
      const newClient = {
        legalName: 'New Client',
        phone: '123-456-7890',
        email: 'test@example.com',
        address: '123 Main St',
      };
      (supabase.from as any).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: {}, error: null }),
          }),
        }),
      });

      await createClient(newClient);
      expect(supabase.from).toHaveBeenCalledWith('clients');
      expect(supabase.from().insert).toHaveBeenCalledWith({
        legal_name: newClient.legalName,
        phone: newClient.phone,
        email: newClient.email,
        address: newClient.address,
      });
    });
  });

  describe('updateClient', () => {
    it('should update an existing client', async () => {
      const clientId = 'client-1';
      const updates = { legalName: 'Updated Client' };
      (supabase.from as any).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: {}, error: null }),
            })),
          }),
        }),
      });

      await updateClient(clientId, updates);
      expect(supabase.from).toHaveBeenCalledWith('clients');
      expect(supabase.from().update).toHaveBeenCalledWith({ legal_name: updates.legalName });
      expect(supabase.from().update().eq).toHaveBeenCalledWith('id', clientId);
    });
  });

  describe('deleteClient', () => {
    it('should delete a client', async () => {
      const clientId = 'client-1';
      (supabase.from as any).mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: {}, error: null }),
          }),
        }),
      });

      await deleteClient(clientId);
      expect(supabase.from).toHaveBeenCalledWith('clients');
      expect(supabase.from().delete().eq).toHaveBeenCalledWith('id', clientId);
    });
  });

  describe('getClientRecurringTasks', () => {
    it('should fetch recurring tasks for a client', async () => {
      const clientId = 'client-1';
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      });

      await getClientRecurringTasks(clientId);
      expect(supabase.from).toHaveBeenCalledWith('recurring_tasks');
      expect(supabase.from().select).toHaveBeenCalledWith('*');
      expect(supabase.from().select().eq).toHaveBeenCalledWith('client_id', clientId);
    });
  });

  describe('getClientAdHocTasks', () => {
    it('should fetch ad-hoc tasks for a client', async () => {
      const clientId = 'client-1';
      const mockTask = {
        id: 'task-1',
        template_id: 'template-1',
        client_id: clientId,
        name: 'Test Task',
        description: 'Test Description',
        estimated_hours: 5,
        required_skills: ['Skill1'],
        priority: 'Medium',
        category: 'Tax',
        status: 'Unscheduled',
        due_date: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        notes: null,
        recurring_task_id: null,
        completed_at: null,
        assigned_staff_id: null,
        scheduled_start_time: null,
        scheduled_end_time: null,
        clients: { legal_name: 'Test Client' },
        task_templates: { name: 'Test Template' }
      };

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [mockTask],
                error: null
              })
            })
          })
        })
      });

      const tasks = await getClientAdHocTasks(clientId);
      
      expect(tasks).toHaveLength(1);
      expect(tasks[0].taskInstance.id).toBeDefined();
      expect(tasks[0].taskInstance.id).toBe(mockTask.id);
    });
  });
});
