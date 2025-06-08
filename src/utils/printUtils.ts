
/**
 * Print Utilities
 * Helper functions for enhanced print formatting and optimization
 */

export interface PrintOptions {
  title?: string;
  orientation?: 'portrait' | 'landscape';
  pageSize?: 'A4' | 'Letter' | 'Legal';
  margins?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  fontSize?: string;
  includePageNumbers?: boolean;
  includeDateTime?: boolean;
}

/**
 * Generate optimized print styles
 */
export const generatePrintStyles = (options: PrintOptions = {}): string => {
  const {
    orientation = 'portrait',
    pageSize = 'A4',
    margins = { top: '2cm', right: '1.5cm', bottom: '2cm', left: '1.5cm' },
    fontSize = '12px',
    includePageNumbers = true,
    includeDateTime = true
  } = options;

  return `
    @media print {
      @page {
        size: ${pageSize} ${orientation};
        margin: ${margins.top} ${margins.right} ${margins.bottom} ${margins.left};
        ${includePageNumbers ? `
          @bottom-right {
            content: "Page " counter(page) " of " counter(pages);
            font-size: 10px;
            color: #666;
          }
        ` : ''}
        ${includeDateTime ? `
          @bottom-left {
            content: "${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}";
            font-size: 10px;
            color: #666;
          }
        ` : ''}
      }
      
      * {
        color: black !important;
        background: white !important;
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      
      body {
        font-size: ${fontSize};
        line-height: 1.4;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .no-print {
        display: none !important;
      }
      
      .print-only {
        display: block !important;
      }
      
      .page-break {
        page-break-before: always;
      }
      
      .page-break-after {
        page-break-after: always;
      }
      
      .avoid-page-break {
        page-break-inside: avoid;
      }
      
      .print-landscape {
        size: ${pageSize} landscape;
      }
      
      h1, h2, h3, h4, h5, h6 {
        page-break-after: avoid;
        margin-top: 0;
      }
      
      table {
        border-collapse: collapse;
        width: 100%;
        font-size: 11px;
      }
      
      table, th, td {
        border: 1px solid #333 !important;
      }
      
      th, td {
        padding: 6px 8px;
        text-align: left;
        vertical-align: top;
      }
      
      th {
        background-color: #f5f5f5 !important;
        font-weight: bold;
      }
      
      tr {
        page-break-inside: avoid;
      }
      
      img {
        max-width: 100% !important;
        height: auto !important;
      }
      
      .print-header {
        border-bottom: 2px solid #333;
        margin-bottom: 20px;
        padding-bottom: 10px;
      }
      
      .print-footer {
        border-top: 1px solid #333;
        margin-top: 20px;
        padding-top: 10px;
        font-size: 10px;
        color: #666;
      }
      
      .text-center { text-align: center; }
      .text-right { text-align: right; }
      .text-left { text-align: left; }
      
      .font-bold { font-weight: bold; }
      .font-medium { font-weight: 500; }
      
      .mb-2 { margin-bottom: 8px; }
      .mb-4 { margin-bottom: 16px; }
      .mt-4 { margin-top: 16px; }
      
      .grid {
        display: grid;
      }
      
      .grid-cols-2 {
        grid-template-columns: 1fr 1fr;
      }
      
      .grid-cols-3 {
        grid-template-columns: 1fr 1fr 1fr;
      }
      
      .grid-cols-4 {
        grid-template-columns: 1fr 1fr 1fr 1fr;
      }
      
      .gap-4 {
        gap: 16px;
      }
      
      .border {
        border: 1px solid #333 !important;
      }
      
      .p-4 {
        padding: 16px;
      }
    }
  `;
};

/**
 * Trigger print with custom options
 */
export const triggerPrint = (options: PrintOptions = {}): void => {
  // Inject custom print styles
  const styleElement = document.createElement('style');
  styleElement.textContent = generatePrintStyles(options);
  document.head.appendChild(styleElement);

  // Trigger print
  window.print();

  // Clean up styles after printing
  setTimeout(() => {
    document.head.removeChild(styleElement);
  }, 1000);
};

/**
 * Prepare data for print-optimized display
 */
export const prepareDataForPrint = <T>(
  data: T[],
  options: {
    maxItemsPerPage?: number;
    sortBy?: keyof T;
    groupBy?: keyof T;
  } = {}
): T[][] => {
  const { maxItemsPerPage = 50, sortBy, groupBy } = options;
  
  let processedData = [...data];
  
  // Sort if specified
  if (sortBy) {
    processedData.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      if (aValue < bValue) return -1;
      if (aValue > bValue) return 1;
      return 0;
    });
  }
  
  // Group if specified
  if (groupBy) {
    const grouped = processedData.reduce((acc, item) => {
      const key = String(item[groupBy]);
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {} as Record<string, T[]>);
    
    processedData = Object.values(grouped).flat();
  }
  
  // Split into pages
  const pages: T[][] = [];
  for (let i = 0; i < processedData.length; i += maxItemsPerPage) {
    pages.push(processedData.slice(i, i + maxItemsPerPage));
  }
  
  return pages;
};

/**
 * Format data for CSV export with print-friendly headers
 */
export const formatForCSVExport = (
  data: Record<string, any>[],
  columnMapping?: Record<string, string>
): string => {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const mappedHeaders = headers.map(header => 
    columnMapping?.[header] || header.replace(/_/g, ' ').toUpperCase()
  );
  
  const csvHeaders = mappedHeaders.join(',');
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = row[header];
      // Handle special characters and wrap in quotes if necessary
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value || '';
    }).join(',')
  );
  
  return [csvHeaders, ...csvRows].join('\n');
};

/**
 * Download file utility
 */
export const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
