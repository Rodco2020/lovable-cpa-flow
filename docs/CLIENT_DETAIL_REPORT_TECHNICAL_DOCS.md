
# Client Detail Report - Technical Documentation

## Architecture Overview

The Client Detail Report system is built using a modular architecture that ensures maintainability, testability, and scalability.

### Core Components

```
ClientDetailReport/
├── components/           # React components
├── hooks/               # Custom React hooks
├── services/            # Business logic and data access
├── types/               # TypeScript definitions
└── tests/               # Test suites
```

## Data Flow Architecture

### 1. Data Access Layer
- **Location**: `src/services/reporting/clientDetail/dataAccess.ts`
- **Purpose**: Handles all database operations
- **Key Methods**:
  - `getClientWithLiaison()`
  - `getRecurringTasks()`
  - `getTaskInstances()`
  - `getStaffMap()`

### 2. Data Processing Layer
- **Location**: `src/services/reporting/clientDetail/dataProcessor.ts`
- **Purpose**: Transforms raw data into report format
- **Key Methods**:
  - `processClientReportData()`
  - `calculateTaskMetrics()`
  - `calculateRevenueMetrics()`

### 3. Service Layer
- **Location**: `src/services/reporting/clientDetail/clientDetailReportService.ts`
- **Purpose**: Orchestrates data access and processing
- **Key Methods**:
  - `getClientDetailReport()`
  - `getClientsList()`

### 4. Presentation Layer
- **Location**: `src/components/reporting/ClientDetailReport/`
- **Purpose**: React components for UI rendering
- **Key Components**:
  - `ClientDetailReport`
  - `ReportContent`
  - `ClientSelectionScreen`

## API Reference

### ClientDetailReportService

#### `getClientDetailReport(clientId, filters)`

Generates a comprehensive client detail report.

**Parameters:**
- `clientId` (string): Unique client identifier
- `filters` (ClientReportFilters): Report filtering options

**Returns:** `Promise<ClientDetailReportData>`

**Example:**
```typescript
const report = await service.getClientDetailReport('client-123', {
  dateRange: {
    from: new Date('2024-01-01'),
    to: new Date('2024-12-31')
  },
  includeCompleted: true,
  taskTypes: [],
  status: [],
  categories: []
});
```

#### `getClientsList()`

Retrieves list of active clients for report selection.

**Returns:** `Promise<Array<{id: string, legalName: string}>>`

### Hook: useClientDetailReport

Custom React hook that manages report state and operations.

**Returns:**
```typescript
{
  // State
  selectedClientId: string;
  filters: ClientReportFilters;
  customization: ReportCustomization;
  
  // Data
  clientsList: Array<{id: string, legalName: string}>;
  reportData: ClientDetailReportData | undefined;
  isLoading: boolean;
  error: Error | null;
  
  // Actions
  setSelectedClientId: (id: string) => void;
  handleFiltersChange: (filters: Partial<ClientReportFilters>) => void;
  handleExport: (options: ExportOptions) => Promise<void>;
  handlePrint: () => void;
}
```

## Database Schema

### Required Tables

#### clients
```sql
- id (uuid, primary key)
- legal_name (text)
- primary_contact (text)
- email (text)
- phone (text)
- industry (text)
- status (text)
- expected_monthly_revenue (numeric)
- staff_liaison_id (uuid, foreign key)
```

#### recurring_tasks
```sql
- id (uuid, primary key)
- client_id (uuid, foreign key)
- name (text)
- category (text)
- status (text)
- priority (text)
- estimated_hours (numeric)
- due_date (timestamp)
```

#### task_instances
```sql
- id (uuid, primary key)
- client_id (uuid, foreign key)
- name (text)
- category (text)
- status (text)
- priority (text)
- estimated_hours (numeric)
- due_date (timestamp)
- completed_at (timestamp)
- assigned_staff_id (uuid, foreign key)
```

#### staff
```sql
- id (uuid, primary key)
- full_name (text)
```

## Type Definitions

### ClientDetailReportData
```typescript
interface ClientDetailReportData {
  client: {
    id: string;
    legalName: string;
    primaryContact: string;
    email: string;
    phone: string;
    industry: string;
    status: string;
    staffLiaisonName?: string;
  };
  taskMetrics: ClientTaskMetrics;
  revenueMetrics: ClientRevenueMetrics;
  taskBreakdown: {
    recurring: ClientTaskDetail[];
    adhoc: ClientTaskDetail[];
  };
  timeline: Array<{
    month: string;
    tasksCompleted: number;
    revenue: number;
  }>;
}
```

### ClientReportFilters
```typescript
interface ClientReportFilters {
  dateRange: {
    from: Date;
    to: Date;
  };
  taskTypes: string[];
  status: string[];
  categories: string[];
  includeCompleted: boolean;
}
```

## Performance Considerations

### Optimization Strategies

1. **Data Caching**
   - Client lists cached for 10 minutes
   - Report data cached for 15 minutes
   - Cache invalidation on data changes

2. **Query Optimization**
   - Parallel data fetching
   - Selective field retrieval
   - Indexed database queries

3. **Progressive Loading**
   - Initial data loading
   - Secondary data on demand
   - Lazy component rendering

### Performance Monitoring

```typescript
// Performance metrics collection
const metrics = {
  queryTime: number,
  processingTime: number,
  totalTime: number,
  cacheHit: boolean,
  recordsProcessed: number
};
```

## Security Considerations

### Input Validation
- Client ID format validation
- Date range bounds checking
- Filter parameter sanitization

### Data Protection
- No sensitive data in client-side cache
- Secure API endpoints
- Row-level security policies

### Error Handling
- Generic error messages for security
- Detailed logging for debugging
- Graceful degradation

## Testing Strategy

### Unit Tests
- Service layer functions
- Data processing logic
- Utility functions

### Integration Tests
- Complete workflow testing
- Database interaction testing
- API endpoint testing

### Performance Tests
- Large dataset handling
- Concurrent user scenarios
- Memory usage monitoring

### Security Tests
- Input validation testing
- SQL injection prevention
- XSS protection

## Deployment

### Environment Variables
```bash
# Supabase configuration
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_key

# Performance monitoring
REACT_APP_ENABLE_PERFORMANCE_MONITORING=true
REACT_APP_CACHE_TIMEOUT=900000
```

### Build Configuration
```javascript
// Performance optimizations
optimization: {
  splitChunks: {
    chunks: 'all',
    cacheGroups: {
      reporting: {
        test: /[\\/]reporting[\\/]/,
        name: 'reporting',
        priority: 10
      }
    }
  }
}
```

## Monitoring and Maintenance

### Health Checks
- Database connectivity
- API response times
- Cache hit rates
- Error frequencies

### Maintenance Tasks
- Cache cleanup
- Performance metric analysis
- Database query optimization
- Security audit

### Logging
```typescript
// Structured logging
logger.info('Report generated', {
  clientId,
  duration: metrics.totalTime,
  cacheHit: metrics.cacheHit,
  userId: currentUser.id
});
```

## Future Enhancements

### Planned Features
- Real-time data updates
- Advanced analytics
- Custom report templates
- Automated report scheduling

### Scalability Improvements
- Database read replicas
- CDN for static assets
- Horizontal scaling
- Microservice architecture

---

*Last updated: [Current Date]*
*Technical Lead: Development Team*
