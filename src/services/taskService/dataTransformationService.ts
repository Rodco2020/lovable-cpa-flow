
import { RecurringTask } from '@/types/task';

/**
 * Data Transformation Service - Enhanced for Phase 2
 * 
 * Provides robust data transformation between application and database formats
 * with comprehensive logging, validation, and error handling.
 */

export class DataTransformationError extends Error {
  constructor(message: string, public field?: string, public value?: any) {
    super(`DataTransformation: ${message}`);
    this.name = 'DataTransformationError';
  }
}

interface TransformationTrace {
  operation: string;
  field: string;
  inputValue: any;
  outputValue: any;
  inputType: string;
  outputType: string;
  timestamp: string;
  success: boolean;
  notes?: string;
}

interface TransformationResult {
  data: any;
  traces: TransformationTrace[];
  warnings: string[];
  errors: string[];
}

/**
 * Enhanced transformation with comprehensive logging
 */
export const transformApplicationToDatabase = (
  appData: Partial<RecurringTask>
): any => {
  const startTime = performance.now();
  const traces: TransformationTrace[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];
  
  console.log(`[DataTransformation] ================= APPLICATION TO DATABASE TRANSFORMATION =================`);
  console.log(`[DataTransformation] Input data:`, JSON.stringify(appData, null, 2));
  
  const dbData: any = {};
  
  // Define field mappings with validation rules
  const fieldMappings = {
    preferredStaffId: {
      dbField: 'preferred_staff_id',
      validate: (value: any) => {
        if (value === null || value === undefined || value === '') return null;
        if (typeof value !== 'string') return String(value);
        return value.trim();
      },
      required: false
    },
    name: {
      dbField: 'name',
      validate: (value: any) => {
        if (typeof value !== 'string') throw new DataTransformationError('Name must be a string', 'name', value);
        return value.trim();
      },
      required: false
    },
    estimatedHours: {
      dbField: 'estimated_hours',
      validate: (value: any) => {
        if (value === null || value === undefined) return value;
        const num = Number(value);
        if (isNaN(num) || num < 0) throw new DataTransformationError('Estimated hours must be a non-negative number', 'estimatedHours', value);
        return num;
      },
      required: false
    },
    requiredSkills: {
      dbField: 'required_skills',
      validate: (value: any) => {
        if (!Array.isArray(value)) throw new DataTransformationError('Required skills must be an array', 'requiredSkills', value);
        return value;
      },
      required: false
    },
    priority: { dbField: 'priority', validate: (v: any) => v, required: false },
    category: { dbField: 'category', validate: (v: any) => v, required: false },
    description: { dbField: 'description', validate: (v: any) => v, required: false },
    notes: { dbField: 'notes', validate: (v: any) => v, required: false },
    status: { dbField: 'status', validate: (v: any) => v, required: false },
    dueDate: { 
      dbField: 'due_date', 
      validate: (value: any) => {
        if (value === null || value === undefined) return value;
        if (value instanceof Date) return value.toISOString();
        if (typeof value === 'string') return value;
        return value;
      }, 
      required: false 
    }
  };
  
  // Process each field
  Object.entries(appData).forEach(([appField, inputValue]) => {
    const timestamp = new Date().toISOString();
    
    if (appField in fieldMappings) {
      const mapping = fieldMappings[appField as keyof typeof fieldMappings];
      
      try {
        const outputValue = mapping.validate(inputValue);
        dbData[mapping.dbField] = outputValue;
        
        // Special logging for preferredStaffId
        if (appField === 'preferredStaffId') {
          console.log(`[DataTransformation] 🔥 PREFERRED STAFF TRANSFORMATION:`);
          console.log(`[DataTransformation] - Input field: ${appField}`);
          console.log(`[DataTransformation] - Output field: ${mapping.dbField}`);
          console.log(`[DataTransformation] - Input value: ${inputValue}`);
          console.log(`[DataTransformation] - Input type: ${typeof inputValue}`);
          console.log(`[DataTransformation] - Output value: ${outputValue}`);
          console.log(`[DataTransformation] - Output type: ${typeof outputValue}`);
          console.log(`[DataTransformation] - Transformation: ${appField} → ${mapping.dbField}`);
        }
        
        traces.push({
          operation: 'field_mapping',
          field: appField,
          inputValue,
          outputValue,
          inputType: typeof inputValue,
          outputType: typeof outputValue,
          timestamp,
          success: true,
          notes: appField === 'preferredStaffId' ? 'Critical field for preferred staff feature' : undefined
        });
        
        console.log(`[DataTransformation] ✅ ${appField} → ${mapping.dbField}: ${inputValue} → ${outputValue}`);
        
      } catch (error) {
        errors.push(`Field ${appField}: ${error.message}`);
        traces.push({
          operation: 'field_mapping',
          field: appField,
          inputValue,
          outputValue: null,
          inputType: typeof inputValue,
          outputType: 'null',
          timestamp,
          success: false,
          notes: error.message
        });
        
        console.error(`[DataTransformation] ❌ ${appField} transformation failed:`, error);
      }
    } else {
      warnings.push(`Unknown field ${appField} ignored`);
      console.warn(`[DataTransformation] ⚠️ Unknown field ignored: ${appField}`);
    }
  });
  
  // Add updated_at timestamp for database tracking
  dbData.updated_at = new Date().toISOString();
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  console.log(`[DataTransformation] Transformation completed in ${duration.toFixed(2)}ms`);
  console.log(`[DataTransformation] Output data:`, JSON.stringify(dbData, null, 2));
  console.log(`[DataTransformation] Warnings: ${warnings.length}, Errors: ${errors.length}`);
  console.log(`[DataTransformation] ================= TRANSFORMATION COMPLETE =================`);
  
  if (errors.length > 0) {
    throw new DataTransformationError(`Transformation failed: ${errors.join(', ')}`);
  }
  
  return dbData;
};

/**
 * Enhanced reverse transformation with logging
 */
export const transformDatabaseToApplication = (dbData: any): RecurringTask => {
  console.log(`[DataTransformation] ================= DATABASE TO APPLICATION TRANSFORMATION =================`);
  console.log(`[DataTransformation] Input database data:`, JSON.stringify(dbData, null, 2));
  
  const appData: any = {
    id: dbData.id,
    templateId: dbData.template_id,
    clientId: dbData.client_id,
    name: dbData.name,
    description: dbData.description,
    estimatedHours: dbData.estimated_hours,
    requiredSkills: dbData.required_skills || [],
    priority: dbData.priority,
    category: dbData.category,
    status: dbData.status,
    dueDate: dbData.due_date,
    recurrenceType: dbData.recurrence_type,
    recurrenceInterval: dbData.recurrence_interval,
    weekdays: dbData.weekdays,
    dayOfMonth: dbData.day_of_month,
    monthOfYear: dbData.month_of_year,
    endDate: dbData.end_date,
    lastGeneratedDate: dbData.last_generated_date,
    isActive: dbData.is_active,
    notes: dbData.notes,
    createdAt: dbData.created_at,
    updatedAt: dbData.updated_at,
    // CRITICAL: Map preferred_staff_id back to preferredStaffId
    preferredStaffId: dbData.preferred_staff_id
  };
  
  // Special logging for preferredStaffId
  console.log(`[DataTransformation] 🔥 PREFERRED STAFF REVERSE TRANSFORMATION:`);
  console.log(`[DataTransformation] - Database field: preferred_staff_id`);
  console.log(`[DataTransformation] - Database value: ${dbData.preferred_staff_id}`);
  console.log(`[DataTransformation] - Application field: preferredStaffId`);
  console.log(`[DataTransformation] - Application value: ${appData.preferredStaffId}`);
  
  console.log(`[DataTransformation] Reverse transformation output:`, JSON.stringify(appData, null, 2));
  console.log(`[DataTransformation] ================= REVERSE TRANSFORMATION COMPLETE =================`);
  
  return appData as RecurringTask;
};

/**
 * Validate task data before transformation
 */
export const validateTaskData = (data: Partial<RecurringTask>): string[] => {
  const errors: string[] = [];
  
  // Add validation rules as needed
  if (data.estimatedHours !== undefined && (data.estimatedHours < 0 || isNaN(data.estimatedHours))) {
    errors.push('Estimated hours must be a non-negative number');
  }
  
  if (data.requiredSkills && !Array.isArray(data.requiredSkills)) {
    errors.push('Required skills must be an array');
  }
  
  if (data.preferredStaffId === '') {
    errors.push('Preferred staff ID cannot be empty string (use null instead)');
  }
  
  return errors;
};

/**
 * Sanitize task data by removing invalid values
 */
export const sanitizeTaskData = (data: Partial<RecurringTask>): Partial<RecurringTask> => {
  const sanitized = { ...data };
  
  // Convert empty strings to null for preferredStaffId
  if (sanitized.preferredStaffId === '') {
    sanitized.preferredStaffId = null;
  }
  
  // Ensure requiredSkills is an array
  if (sanitized.requiredSkills && !Array.isArray(sanitized.requiredSkills)) {
    sanitized.requiredSkills = [];
  }
  
  return sanitized;
};
