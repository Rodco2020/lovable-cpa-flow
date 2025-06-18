
# Staff Services API Documentation

## Overview

The Staff Services module provides data access and validation utilities for staff-related operations in the CPA Practice Management Software. This module is optimized for dropdown components and form validation scenarios.

## Services

### 1. Staff Dropdown Service

**Location**: `src/services/staff/staffDropdownService.ts`

#### `getActiveStaffForDropdown(): Promise<StaffOption[]>`

Fetches active staff members optimized for dropdown component usage.

**Returns**:
```typescript
interface StaffOption {
  id: string;        // UUID of staff member
  full_name: string; // Display name for dropdown
}
```

**Features**:
- Returns only active staff members
- Minimal data payload for performance
- Comprehensive error handling
- Supabase integration

**Usage**:
```typescript
import { getActiveStaffForDropdown } from '@/services/staff/staffDropdownService';

const staffOptions = await getActiveStaffForDropdown();
```

**Error Handling**:
- Network failures: Throws descriptive error messages
- Database errors: Logs and re-throws with context
- Empty results: Returns empty array (not an error)

### 2. Staff Validation Service

**Location**: `src/services/clientTask/staffValidationService.ts`

#### `validateStaffExists(staffId: string): Promise<StaffValidationResult>`

Validates that a specific staff member exists and is active.

**Parameters**:
- `staffId` (string): UUID of staff member to validate

**Returns**:
```typescript
interface StaffValidationResult {
  isValid: boolean;    // Whether staff member exists and is active
  exists: boolean;     // Whether staff member exists (regardless of status)
  isActive?: boolean;  // Whether staff member is active (if exists)
  staffName?: string;  // Display name (if exists)
}
```

**Usage**:
```typescript
import { validateStaffExists } from '@/services/clientTask/staffValidationService';

const result = await validateStaffExists('staff-uuid');
if (result.isValid) {
  // Staff member is valid and active
}
```

#### `validateMultipleStaff(staffIds: string[]): Promise<StaffValidationResult[]>`

Validates multiple staff members in a single operation.

**Parameters**:
- `staffIds` (string[]): Array of staff UUIDs to validate

**Returns**:
- Array of `StaffValidationResult` objects in same order as input

**Usage**:
```typescript
import { validateMultipleStaff } from '@/services/clientTask/staffValidationService';

const results = await validateMultipleStaff(['staff-1', 'staff-2']);
const validStaff = results.filter(r => r.isValid);
```

**Performance**:
- Single database query for all validations
- Optimized for bulk operations
- Maintains input order in results

## Integration with React Query

### Recommended Usage Pattern

```typescript
import { useQuery } from '@tanstack/react-query';
import { getActiveStaffForDropdown } from '@/services/staff/staffDropdownService';

const StaffDropdown = () => {
  const { data: staffOptions = [], isLoading, error } = useQuery({
    queryKey: ['staff-dropdown-options'],
    queryFn: getActiveStaffForDropdown,
    staleTime: 5 * 60 * 1000,  // 5 minutes
    gcTime: 10 * 60 * 1000,    // 10 minutes
  });

  // Component implementation
};
```

### Query Keys

**Recommended query keys for consistency**:
- `['staff-dropdown-options']` - For dropdown data
- `['staff-validation', staffId]` - For single staff validation
- `['staff-validation-bulk', staffIds]` - For bulk validation

## Error Handling Patterns

### 1. Network Errors
```typescript
try {
  const staff = await getActiveStaffForDropdown();
} catch (error) {
  if (error.message.includes('Failed to fetch')) {
    // Handle network connectivity issues
  }
}
```

### 2. Database Errors
```typescript
try {
  const validation = await validateStaffExists(staffId);
} catch (error) {
  // All database errors are logged automatically
  // Handle gracefully in UI
}
```

### 3. Validation Errors
```typescript
const result = await validateStaffExists(staffId);
if (!result.isValid) {
  if (!result.exists) {
    // Staff member doesn't exist
  } else if (!result.isActive) {
    // Staff member exists but is inactive
  }
}
```

## Type Definitions

### StaffOption
```typescript
interface StaffOption {
  id: string;        // UUID string
  full_name: string; // Full display name
}
```

### StaffValidationResult
```typescript
interface StaffValidationResult {
  isValid: boolean;    // Overall validity (exists + active)
  exists: boolean;     // Whether record exists
  isActive?: boolean;  // Activity status (if exists)
  staffName?: string;  // Display name (if exists)
}
```

## Database Dependencies

### Required Tables
- `staff` table with columns:
  - `id` (UUID, primary key)
  - `full_name` (text)
  - `status` (text, 'active' | 'inactive')

### Database Queries

#### Staff Dropdown Query
```sql
SELECT id, full_name 
FROM staff 
WHERE status = 'active'
ORDER BY full_name ASC
```

#### Staff Validation Query
```sql
SELECT id, full_name, status 
FROM staff 
WHERE id = $1
```

#### Bulk Validation Query
```sql
SELECT id, full_name, status 
FROM staff 
WHERE id = ANY($1)
```

## Performance Considerations

### 1. Caching Strategy
- Use React Query caching for dropdown data
- Cache validation results for recently checked staff
- Implement stale-while-revalidate pattern

### 2. Data Optimization
- Minimal field selection in queries
- Indexed database queries on staff.id and staff.status
- Batch operations for multiple validations

### 3. Network Optimization
- Single API call per operation
- Compressed response payloads
- Efficient error handling to prevent retry storms

## Security Considerations

### 1. Data Access
- Only returns active staff members to external callers
- No sensitive staff information exposed
- Proper authentication required

### 2. Input Validation
- UUID format validation for staff IDs
- Array length limits for bulk operations
- SQL injection prevention

### 3. Error Information
- Generic error messages to prevent information leakage
- Detailed logging for debugging (server-side only)
- No database schema information in client errors

## Testing Guidelines

### 1. Unit Tests
```typescript
describe('getActiveStaffForDropdown', () => {
  test('returns active staff only', async () => {
    const staff = await getActiveStaffForDropdown();
    expect(staff).toEqual([
      { id: 'uuid1', full_name: 'John Doe' },
      { id: 'uuid2', full_name: 'Jane Smith' }
    ]);
  });
});
```

### 2. Integration Tests
```typescript
describe('validateStaffExists', () => {
  test('validates existing active staff', async () => {
    const result = await validateStaffExists('valid-uuid');
    expect(result.isValid).toBe(true);
    expect(result.exists).toBe(true);
    expect(result.isActive).toBe(true);
  });
});
```

### 3. Error Scenarios
- Network connectivity failures
- Database connection issues
- Invalid UUID formats
- Non-existent staff IDs
- Inactive staff members

## Migration Guide

### From Direct Database Access
```typescript
// Before
const { data } = await supabase
  .from('staff')
  .select('id, full_name')
  .eq('status', 'active');

// After
const staffOptions = await getActiveStaffForDropdown();
```

### From Manual Validation
```typescript
// Before
const { data } = await supabase
  .from('staff')
  .select('*')
  .eq('id', staffId)
  .single();
const isValid = data && data.status === 'active';

// After
const result = await validateStaffExists(staffId);
const isValid = result.isValid;
```
