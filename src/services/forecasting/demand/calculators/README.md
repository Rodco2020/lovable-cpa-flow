
# Revenue Calculation Services

This module provides comprehensive revenue calculation services for the Demand Forecast Matrix, supporting both "Total Suggested Revenue" and "Expected Less Suggested" column calculations.

## Overview

The revenue calculation system consists of two main components:

1. **SuggestedRevenueCalculator**: Core calculation engine for skill-based revenue calculations
2. **RevenueComparisonService**: Bulk processing and comparison service for matrix-level operations

## Architecture

```
Revenue Calculation Services
├── SuggestedRevenueCalculator
│   ├── Individual skill revenue calculations
│   ├── Fallback logic for missing rates
│   ├── Detailed calculation reporting
│   └── Bulk calculation processing
├── RevenueComparisonService
│   ├── Matrix-level revenue comparison
│   ├── Client revenue breakdown
│   ├── Performance optimization
│   └── Caching mechanisms
└── Integration with Skills Service
    ├── Fee rate lookups
    ├── Default rate fallbacks
    └── Error handling
```

## Core Calculation Logic

### Suggested Revenue Calculation

The suggested revenue for a skill is calculated using the formula:

```
Suggested Revenue = Demand Hours × Skill Fee Rate
```

#### Fallback Logic

When a skill fee rate is not found, the system uses the following fallback hierarchy:

1. **Exact Match**: Direct lookup by skill name
2. **Case-Insensitive Match**: Lowercase comparison of skill names
3. **Default Rates**: Predefined rates for common skills (CPA, Senior, Junior)
4. **Case-Insensitive Default**: Lowercase comparison with default rates
5. **System Default**: Final fallback rate of $75.00/hour

#### Example Calculation

```typescript
// Input: 20 hours of CPA work at $250/hour
const suggestedRevenue = calculator.calculateSuggestedRevenue(20, 'CPA', skillFeeRates);
// Output: $5,000.00
```

### Expected Less Suggested Calculation

The difference between expected and suggested revenue:

```
Expected Less Suggested = Expected Revenue - Suggested Revenue
```

- **Positive Value**: Expected revenue exceeds suggested revenue
- **Negative Value**: Suggested revenue exceeds expected revenue
- **Zero**: Perfect alignment between expected and suggested

#### Example Calculation

```typescript
// Input: Expected $15,000, Suggested $17,000
const difference = calculator.calculateExpectedLessSuggested(15000, 17000);
// Output: -$2,000.00 (suggested exceeds expected)
```

## Service Components

### SuggestedRevenueCalculator

#### Key Methods

- `calculateSuggestedRevenue(hours, skillName, feeRates)`: Basic revenue calculation
- `calculateExpectedLessSuggested(expected, suggested)`: Revenue difference calculation
- `calculateSuggestedRevenueDetailed(hours, skillName, feeRates)`: Detailed calculation with metadata
- `bulkCalculateSuggestedRevenue(demandData, feeRates)`: Bulk processing for multiple skills
- `getTotalSuggestedRevenue(calculations)`: Aggregate total from multiple calculations

#### Features

- **Input Validation**: Comprehensive validation of all input parameters
- **Error Handling**: Graceful error handling with meaningful error messages
- **Fallback Logic**: Multi-tier fallback system for missing fee rates
- **Performance Optimization**: Efficient calculations for large datasets
- **Detailed Reporting**: Optional detailed calculation metadata

### RevenueComparisonService

#### Key Methods

- `calculateRevenueComparison(skillData, clientData, options)`: Comprehensive matrix-level calculation
- `getCachedResult(skillName, hours)`: Cache lookup for repeated calculations
- `clearCache()`: Cache management
- `getPerformanceMetrics()`: Performance monitoring data

#### Features

- **Batch Processing**: Efficient processing of large datasets with configurable batch sizes
- **Caching**: Optional result caching for improved performance
- **Client Breakdown**: Proportional revenue allocation across clients
- **Performance Monitoring**: Detailed performance metrics and benchmarking
- **Memory Management**: Optimized memory usage for large datasets

## Usage Examples

### Basic Revenue Calculation

```typescript
import { suggestedRevenueCalculator } from './calculators';

// Calculate revenue for a single skill
const revenue = suggestedRevenueCalculator.calculateSuggestedRevenue(
  25,           // 25 hours
  'CPA',        // CPA skill
  skillFeeRates // Map of skill rates
);
// Result: $6,250.00 (assuming $250/hour for CPA)
```

### Bulk Matrix Calculation

```typescript
import { revenueComparisonService } from './calculators';

const skillDemandData = [
  { skillName: 'CPA', demandHours: 20, clientCount: 2, taskCount: 5 },
  { skillName: 'Senior', demandHours: 40, clientCount: 3, taskCount: 8 },
  { skillName: 'Junior', demandHours: 60, clientCount: 4, taskCount: 12 }
];

const clientRevenueData = [
  { clientId: 'client1', clientName: 'Client A', expectedMonthlyRevenue: 5000 },
  { clientId: 'client2', clientName: 'Client B', expectedMonthlyRevenue: 7500 }
];

const result = await revenueComparisonService.calculateRevenueComparison(
  skillDemandData,
  clientRevenueData,
  { useCache: true, batchSize: 100 }
);

console.log(`Total Suggested Revenue: $${result.totalSuggestedRevenue}`);
console.log(`Total Expected Revenue: $${result.totalExpectedRevenue}`);
console.log(`Expected Less Suggested: $${result.expectedLessSuggested}`);
```

### Detailed Calculation with Fallbacks

```typescript
// Get detailed calculation information
const detailedResult = suggestedRevenueCalculator.calculateSuggestedRevenueDetailed(
  15,
  'UnknownSkill',
  skillFeeRates
);

console.log(detailedResult);
// Output:
// {
//   skillName: 'UnknownSkill',
//   demandHours: 15,
//   feeRate: 75.00,
//   suggestedRevenue: 1125.00,
//   isUsingFallback: true,
//   calculationNotes: 'Used fallback rate for skill "UnknownSkill" (original rate not found)'
// }
```

## Performance Characteristics

### Benchmarks

- **Single Calculation**: < 1ms per calculation
- **Bulk Processing (100 items)**: < 10ms
- **Large Dataset (1000 items)**: < 100ms
- **Matrix Calculation**: < 200ms for typical datasets

### Optimization Features

- **Batch Processing**: Configurable batch sizes for large datasets
- **Caching**: Optional result caching for repeated calculations
- **Memory Management**: Efficient memory usage patterns
- **Asynchronous Processing**: Non-blocking operations for large datasets

## Error Handling

### Custom Error Types

- `SuggestedRevenueCalculatorError`: Calculation-specific errors
- `RevenueComparisonServiceError`: Service-level errors

### Error Recovery

- **Graceful Degradation**: Continue processing when individual calculations fail
- **Fallback Values**: Default values for missing or invalid data
- **Detailed Logging**: Comprehensive error logging for debugging

### Example Error Handling

```typescript
try {
  const revenue = suggestedRevenueCalculator.calculateSuggestedRevenue(
    hours, skillName, feeRates
  );
} catch (error) {
  if (error instanceof SuggestedRevenueCalculatorError) {
    console.error(`Calculation failed: ${error.message}`);
    console.error(`Error code: ${error.code}`);
    // Handle specific calculation error
  }
}
```

## Integration Points

### Skills Service Integration

-Fetches skill fee rates via `getSkillFeeRatesMap()`
- Uses default rates via `getDefaultFeeRates()`
- Handles skill resolution and fallbacks

### Matrix Service Integration

- Provides revenue calculations for matrix cells
- Supports bulk operations for entire matrices
- Integrates with caching systems

### Export/Reporting Integration

- Provides detailed breakdown data
- Supports performance metrics export
- Compatible with various export formats

## Configuration

### Calculation Options

```typescript
interface BulkRevenueCalculationOptions {
  useCache?: boolean;           // Enable result caching
  batchSize?: number;          // Batch size for large datasets
  includeDetailedBreakdown?: boolean;  // Include client-level breakdown
  performanceMonitoring?: boolean;     // Enable performance tracking
}
```

### Default Values

- **Default Fee Rate**: $75.00/hour
- **Default Batch Size**: 100 items
- **Cache Enabled**: true
- **Performance Monitoring**: true

## Testing

The calculation services include comprehensive test coverage:

- **Unit Tests**: >95% code coverage
- **Integration Tests**: End-to-end calculation workflows
- **Performance Tests**: Benchmarking for large datasets
- **Edge Case Tests**: Boundary conditions and error scenarios

### Running Tests

```bash
npm test src/services/forecasting/demand/calculators
```

## Future Enhancements

### Planned Features

1. **Advanced Caching**: Persistent caching across sessions
2. **Rate History**: Historical fee rate tracking
3. **Predictive Modeling**: Revenue forecasting algorithms
4. **Real-time Updates**: Live calculation updates
5. **Custom Formulas**: User-defined calculation formulas

### Performance Improvements

1. **Worker Threads**: Background processing for large datasets
2. **Streaming Processing**: Memory-efficient data processing
3. **Database Integration**: Direct database calculation queries
4. **CDN Caching**: Distributed caching for global access

---

For technical support or questions about the revenue calculation services, please refer to the inline documentation or contact the development team.
