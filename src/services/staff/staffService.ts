
import { Staff } from "@/types/staff";
import { supabase } from "@/integrations/supabase/client";
import { mapStaffFromDbRecord, mapStaffToDbRecord } from "./staffMapper";

/**
 * Core Staff CRUD Operations
 * This module handles basic creation, reading, updating and deletion of staff members
 */

/**
 * Fetch all staff members from the database
 * @returns Promise resolving to an array of Staff objects
 */
export const getAllStaff = async (): Promise<Staff[]> => {
  try {
    console.log("Fetching all staff members");
    const { data, error } = await supabase
      .from('staff')
      .select('*');
    
    if (error) {
      console.error("Error fetching staff:", error);
      throw error;
    }
    
    if (!data) {
      console.warn("No staff data returned from database");
      return [];
    }
    
    console.log(`Debug - Raw staff data from database: ${data.length} staff members found`);
    
    // Map the database fields to our Staff model
    return data.map(mapStaffFromDbRecord);
  } catch (err) {
    console.error("Failed to fetch staff data:", err);
    throw new Error(`Database connection error: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
};

/**
 * Fetch a single staff member by ID
 * @param id The UUID of the staff member to fetch
 * @returns Promise resolving to a Staff object or undefined if not found
 */
export const getStaffById = async (id: string): Promise<Staff | undefined> => {
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') { // No rows returned
      return undefined;
    }
    console.error("Error fetching staff by ID:", error);
    throw error;
  }
  
  return mapStaffFromDbRecord(data);
};

/**
 * Create a new staff member in the database
 * @param staffData The staff data to create (without id/timestamps)
 * @returns Promise resolving to the newly created Staff object
 */
export const createStaff = async (staffData: Omit<Staff, "id" | "createdAt" | "updatedAt">): Promise<Staff> => {
  // Map the Staff model fields to database fields
  const dbData = mapStaffToDbRecord({...staffData});
  
  const { data, error } = await supabase
    .from('staff')
    .insert(dbData)
    .select()
    .single();
  
  if (error) {
    console.error("Error creating staff:", error);
    throw error;
  }
  
  return mapStaffFromDbRecord(data);
};

/**
 * Update an existing staff member
 * @param id The UUID of the staff member to update
 * @param staffData The partial staff data to update
 * @returns Promise resolving to the updated Staff object or undefined if not found
 */
export const updateStaff = async (id: string, staffData: Partial<Omit<Staff, "id" | "createdAt">>): Promise<Staff | undefined> => {
  // Map the Staff model fields to database fields
  const dbData = mapStaffToDbRecord(staffData);
  
  const { data, error } = await supabase
    .from('staff')
    .update(dbData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating staff:", error);
    throw error;
  }
  
  return mapStaffFromDbRecord(data);
};

/**
 * Delete a staff member from the database
 * @param id The UUID of the staff member to delete
 * @returns Promise resolving to boolean indicating success
 */
export const deleteStaff = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('staff')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error("Error deleting staff:", error);
    throw error;
  }
  
  return true;
};
