# Preferred Staff Feature Documentation

## Overview

The Preferred Staff feature allows clients to request specific staff members for their recurring tasks while maintaining the flexibility to choose automatic assignment. This optional feature enhances client satisfaction by providing more control over task assignments while preserving the system's ability to optimize resource allocation.

## Technical Implementation

### Architecture

The feature is implemented as a new field in the `EditRecurringTaskDialog` component with the following architecture:

```
EditRecurringTaskDialog
├── PreferredStaffField (New Component)
├── Form validation and submission
└── Database persistence
```

### Database Schema

The preferred staff functionality utilizes the existing `recurring_tasks.preferred_staff_id` field:

```sql
-- Field in recurring_tasks table
preferred_staff_id UUID NULLABLE REFERENCES staff(id)
```

### Key Components

#### 1. PreferredStaffField Component

**Location**: `src/components/clients/EditRecurringTaskDialog/components/PreferredStaffField.tsx`

**Purpose**: Provides a dropdown selector for staff assignment with comprehensive error handling and validation.

**Key Features**:
- Fetches active staff members from database
- Handles loading, error, and retry states
- Validates staff selections
- Supports "No preference" option
- Auto-recovery for invalid selections
- Accessibility compliant

#### 2. Staff Dropdown Service

**Location**: `src/services/staff/staffDropdownService.ts`

**Purpose**: Provides optimized staff data retrieval for dropdown components.

**Key Features**:
- Fetches only active staff members
- Returns minimal required data (id, full_name)
- Handles database errors gracefully
- Optimized for dropdown usage

#### 3. Staff Validation Service

**Location**: `src/services/clientTask/staffValidationService.ts`

**Purpose**: Validates staff existence and provides validation utilities.

**Key Features**:
- Single staff validation
- Bulk staff validation
- Error handling and logging
- Type-safe validation results

### Value Handling Logic

The component implements a sophisticated value handling system to ensure compatibility between form state and UI components:

#### Normalization Process

1. **Form Storage**: 
   - `null` = No preference (automatic assignment)
   - `string` = Specific staff member UUID

2. **Select Component**:
   - `"none"` = No preference option
   - `string` = Staff member UUID

3. **Conversion Functions**:
   ```typescript
   // Form value → Select value
   normalizeValue(null) → "none"
   normalizeValue("staff-uuid") → "staff-uuid"
   
   // Select value → Form value
   denormalizeValue("none") → null
   denormalizeValue("staff-uuid") → "staff-uuid"
   ```

#### Validation Logic

```typescript
validateStaffId(staffId: string | null): ValidationResult {
  // null is always valid (no preference)
  if (staffId === null) return { isValid: true };
  
  // Check if staff exists in current list
  const staffExists = staffOptions.some(staff => staff.id === staffId);
  return { 
    isValid: staffExists, 
    errorMessage: staffExists ? undefined : "Staff member no longer available" 
  };
}
```

### Error Handling Strategy

#### 1. Network Errors
- **Retry Mechanism**: Exponential backoff with max 3 attempts
- **User Feedback**: Clear error messages with retry button
- **Graceful Degradation**: Form remains functional without staff data

#### 2. Invalid Staff IDs
- **Auto-Recovery**: Automatically reset to last valid selection or null
- **User Notification**: Alert with option to restore previous selection
- **Data Integrity**: Prevents submission of invalid staff references

#### 3. Loading States
- **Progressive Enhancement**: Form loads immediately, staff dropdown enhances when data available
- **Loading Indicators**: Spinner in label and disabled state for dropdown
- **Timeout Handling**: Automatic retry after network timeouts

### Performance Optimizations

#### 1. Caching Strategy
```typescript
{
  staleTime: 5 * 60 * 1000,     // 5 minutes fresh
  gcTime: 10 * 60 * 1000,       // 10 minutes cache
}
```

#### 2. Minimal Data Fetching
- Only fetches active staff members
- Returns only required fields (id, full_name)
- Reuses cached data across components

#### 3. Efficient Re-renders
- Memoized validation functions
- Controlled re-rendering with React.useEffect
- Optimized state management

### Accessibility Features

#### 1. WCAG Compliance
- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader compatible
- High contrast indicators

#### 2. User Experience
- Clear visual feedback for selections
- Descriptive help text
- Progress indicators for loading states
- Error recovery options

### Integration Points

#### 1. Form Integration
```typescript
// Integrates seamlessly with react-hook-form
<FormField
  control={form.control}
  name="preferredStaffId"
  render={({ field }) => (
    // Field implementation
  )}
/>
```

#### 2. Database Integration
```typescript
// Automatic persistence with existing form submission
const formData = {
  // ... other fields
  preferredStaffId: field.value // null or staff UUID
};
```

#### 3. Validation Integration
```typescript
// Integrates with existing form validation
const validationSchema = z.object({
  // ... other validations
  preferredStaffId: z.string().uuid().nullable()
});
```

## Usage Guidelines

### For Developers

#### 1. Adding to New Forms
```typescript
import { PreferredStaffField } from './components/PreferredStaffField';

// In form JSX
<PreferredStaffField form={form} />
```

#### 2. Handling Form Submission
```typescript
const onSubmit = (data: FormData) => {
  // data.preferredStaffId will be null or staff UUID
  await saveTask({
    ...data,
    preferredStaffId: data.preferredStaffId
  });
};
```

#### 3. Testing Considerations
- Test with null values (no preference)
- Test with valid staff IDs
- Test with invalid/deleted staff IDs
- Test network error scenarios
- Test loading states

### For Users

#### 1. Setting Preferred Staff
1. Open task editing dialog
2. Locate "Preferred Staff Member (Optional)" field
3. Select from dropdown or choose "No preference"
4. Save task

#### 2. Understanding Options
- **No preference**: System will automatically assign available staff
- **Specific staff**: Requests specific staff member (subject to availability)
- **Invalid selections**: Automatically reset with notification

## Troubleshooting

### Common Issues

#### 1. Staff Not Loading
**Symptoms**: Dropdown shows "Failed to load staff data"
**Solution**: Click retry button or refresh page
**Cause**: Network connectivity or server issues

#### 2. Selected Staff Disappeared
**Symptoms**: Alert showing "Staff member no longer available"
**Solution**: Select new staff member or choose "No preference"
**Cause**: Staff member was deactivated or deleted

#### 3. Form Not Submitting
**Symptoms**: Submit button disabled or validation errors
**Solution**: Ensure all required fields are filled
**Cause**: Form validation preventing submission

### Debug Information

#### 1. Enable Debug Mode
```typescript
// In development environment
console.log('Staff options:', staffOptions);
console.log('Current value:', field.value);
console.log('Validation result:', validation);
```

#### 2. Network Debugging
- Check browser developer tools Network tab
- Verify API endpoints are responding
- Check for CORS or authentication issues

## Security Considerations

### 1. Data Validation
- Server-side validation of staff IDs
- Verification of staff existence before assignment
- Protection against SQL injection

### 2. Access Control
- Users can only assign staff within their organization
- Staff data filtered to active members only
- Proper authentication required for staff endpoint

### 3. Data Privacy
- Minimal staff data exposure (only id and name)
- No sensitive staff information in dropdown
- Secure transmission of staff assignments

## Future Enhancements

### 1. Potential Features
- Staff availability checking
- Workload balancing notifications
- Preferred staff history tracking
- Team-based assignments

### 2. Performance Improvements
- Staff data pre-loading
- Advanced caching strategies
- Pagination for large staff lists
- Search/filter capabilities

### 3. User Experience
- Staff photos in dropdown
- Skill-based staff filtering
- Assignment conflict warnings
- Bulk staff assignment tools

## Conclusion

The Preferred Staff feature provides a robust, user-friendly solution for staff assignment preferences while maintaining system flexibility and reliability. The implementation follows best practices for error handling, accessibility, and performance while integrating seamlessly with existing functionality.
