
import { Staff } from "@/types/staff";

/**
 * Maps a database record to a Staff model object
 * @param data The raw database record
 * @returns A properly formatted Staff object
 */
export const mapStaffFromDbRecord = (data: any): Staff => {
  // Handle status mapping - ensure we properly handle the corrected status values
  const status = data.status === 'active' ? 'active' : 'inactive';
  
  console.log(`Mapping staff ${data.full_name}: database status "${data.status}" -> mapped status "${status}"`);
  
  return {
    id: data.id,
    fullName: data.full_name,
    roleTitle: data.role_title || "",
    skills: data.assigned_skills || [],
    assignedSkills: data.assigned_skills || [], // Added to match Staff interface
    costPerHour: data.cost_per_hour,
    email: data.email,
    phone: data.phone || "",
    status: status,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  };
};

/**
 * Maps a Staff model (or partial) to database fields
 * @param staffData The Staff model data
 * @returns An object with database field names
 */
export const mapStaffToDbRecord = (staffData: Partial<Staff>): Record<string, any> => {
  const dbData: Record<string, any> = {};
  
  if (staffData.fullName !== undefined) dbData.full_name = staffData.fullName;
  if (staffData.roleTitle !== undefined) dbData.role_title = staffData.roleTitle;
  if (staffData.skills !== undefined) dbData.assigned_skills = staffData.skills;
  if (staffData.assignedSkills !== undefined) dbData.assigned_skills = staffData.assignedSkills;
  if (staffData.costPerHour !== undefined) dbData.cost_per_hour = staffData.costPerHour;
  if (staffData.email !== undefined) dbData.email = staffData.email;
  if (staffData.phone !== undefined) dbData.phone = staffData.phone;
  if (staffData.status !== undefined) {
    // Ensure we're using the correct lowercase status values
    dbData.status = staffData.status === 'active' ? 'active' : 'inactive';
  }
  
  return dbData;
};
