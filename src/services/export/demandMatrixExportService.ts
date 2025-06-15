
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { DemandMatrixData } from '@/types/demand';
import { formatCurrency, formatHours, formatNumber } from '@/lib/numberUtils';

export interface DemandMatrixExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  groupingMode: 'skill' | 'client';
  includeRevenueColumns?: boolean;
  includeTaskBreakdown?: boolean;
  includeClientSummary?: boolean;
  customTitle?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export class DemandMatrixExportService {
  static async exportMatrix(
    data: DemandMatrixData,
    selectedSkills: string[],
    selectedClients: string[],
    monthRange: { start: number; end: number },
    options: DemandMatrixExportOptions
  ): Promise<void> {
    const title = options.customTitle || `Demand Matrix Export - ${options.groupingMode === 'skill' ? 'Skills' : 'Clients'}`;
    const filteredMonths = data.months.slice(monthRange.start, monthRange.end + 1);
    
    switch (options.format) {
      case 'pdf':
        return this.exportToPDF(data, filteredMonths, selectedSkills, selectedClients, title, options);
      case 'excel':
        return this.exportToExcel(data, filteredMonths, selectedSkills, selectedClients, title, options);
      case 'csv':
        return this.exportToCSV(data, filteredMonths, selectedSkills, selectedClients, title, options);
      default:
        throw new Error('Unsupported export format');
    }
  }

  private static exportToPDF(
    data: DemandMatrixData,
    filteredMonths: any[],
    selectedSkills: string[],
    selectedClients: string[],
    title: string,
    options: DemandMatrixExportOptions
  ): void {
    const doc = new jsPDF('landscape'); // Use landscape for matrix data
    let yPosition = 20;
    
    // Title and metadata
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 20, yPosition);
    yPosition += 12;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Period: ${filteredMonths[0]?.label} - ${filteredMonths[filteredMonths.length - 1]?.label}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Mode: ${options.groupingMode === 'skill' ? 'Skill Grouping' : 'Client Grouping'}`, 20, yPosition);
    yPosition += 15;

    // Summary section
    this.addPDFSummarySection(doc, data, yPosition, options);
    yPosition += 50;

    // Matrix data table
    if (options.groupingMode === 'client' && options.includeRevenueColumns) {
      this.addPDFMatrixWithRevenue(doc, data, filteredMonths, selectedClients, yPosition, options);
    } else {
      this.addPDFMatrixBasic(doc, data, filteredMonths, selectedSkills, yPosition, options);
    }

    // Save the PDF
    const timestamp = new Date().toISOString().split('T')[0];
    doc.save(`demand-matrix-${options.groupingMode}-${timestamp}.pdf`);
  }

  private static addPDFSummarySection(
    doc: jsPDF,
    data: DemandMatrixData,
    startY: number,
    options: DemandMatrixExportOptions
  ): void {
    let yPos = startY;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Basic metrics
    doc.text(`Total Demand: ${formatHours(data.totalDemand, 1)}`, 20, yPos);
    doc.text(`Total Tasks: ${data.totalTasks}`, 120, yPos);
    yPos += 8;
    doc.text(`Total Clients: ${data.totalClients}`, 20, yPos);
    
    // Revenue metrics for client mode
    if (options.groupingMode === 'client' && options.includeRevenueColumns && data.revenueTotals) {
      doc.text(`Expected Revenue: ${formatCurrency(data.revenueTotals.totalExpectedRevenue)}`, 120, yPos);
      yPos += 8;
      doc.text(`Suggested Revenue: ${formatCurrency(data.revenueTotals.totalSuggestedRevenue)}`, 20, yPos);
      doc.text(`Revenue Difference: ${formatCurrency(data.revenueTotals.totalExpectedLessSuggested)}`, 120, yPos);
    }
  }

  private static addPDFMatrixWithRevenue(
    doc: jsPDF,
    data: DemandMatrixData,
    filteredMonths: any[],
    selectedClients: string[],
    startY: number,
    options: DemandMatrixExportOptions
  ): void {
    // This would contain the detailed matrix table with revenue columns
    // Due to space constraints in PDF, we'll focus on key client summaries
    let yPos = startY;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Client Revenue Summary', 20, yPos);
    yPos += 12;
    
    // Table headers
    doc.setFontSize(9);
    const headers = ['Client', 'Hours', 'Expected Rev.', 'Suggested Rev.', 'Difference', 'Rate'];
    const colWidths = [60, 30, 40, 40, 40, 30];
    let xPos = 20;
    
    headers.forEach((header, index) => {
      doc.text(header, xPos, yPos);
      xPos += colWidths[index];
    });
    yPos += 8;
    
    // Client data rows
    if (data.clientTotals && data.clientRevenue) {
      Array.from(data.clientTotals.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 15) // Limit to top 15 clients for PDF space
        .forEach(([client, hours]) => {
          if (yPos > 180) {
            doc.addPage();
            yPos = 20;
          }
          
          xPos = 20;
          const values = [
            client.length > 15 ? client.substring(0, 12) + '...' : client,
            formatHours(hours, 1),
            formatCurrency(data.clientRevenue?.get(client) || 0),
            formatCurrency(data.clientSuggestedRevenue?.get(client) || 0),
            formatCurrency(data.clientExpectedLessSuggested?.get(client) || 0),
            `$${formatNumber(data.clientHourlyRates?.get(client) || 0, 0)}/h`
          ];
          
          values.forEach((value, index) => {
            doc.text(value, xPos, yPos);
            xPos += colWidths[index];
          });
          yPos += 7;
        });
    }
  }

  private static addPDFMatrixBasic(
    doc: jsPDF,
    data: DemandMatrixData,
    filteredMonths: any[],
    selectedSkills: string[],
    startY: number,
    options: DemandMatrixExportOptions
  ): void {
    // Basic skill-based matrix for PDF
    let yPos = startY;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Skills Summary', 20, yPos);
    yPos += 12;
    
    // Skills breakdown
    Object.entries(data.skillSummary).forEach(([skill, summary]) => {
      if (yPos > 180) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(skill, 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(`${formatHours(summary.totalHours, 1)} | ${summary.taskCount} tasks | ${summary.clientCount} clients`, 80, yPos);
      yPos += 8;
    });
  }

  private static exportToExcel(
    data: DemandMatrixData,
    filteredMonths: any[],
    selectedSkills: string[],
    selectedClients: string[],
    title: string,
    options: DemandMatrixExportOptions
  ): void {
    const workbook = XLSX.utils.book_new();
    
    // Main matrix sheet
    const matrixData = this.prepareMatrixDataForExcel(data, filteredMonths, selectedSkills, selectedClients, options);
    const matrixSheet = XLSX.utils.json_to_sheet(matrixData);
    XLSX.utils.book_append_sheet(workbook, matrixSheet, 'Matrix Data');
    
    // Summary sheet
    const summaryData = this.prepareSummaryDataForExcel(data, options);
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    
    // Revenue analysis sheet (for client mode)
    if (options.groupingMode === 'client' && options.includeRevenueColumns) {
      const revenueData = this.prepareRevenueDataForExcel(data);
      const revenueSheet = XLSX.utils.json_to_sheet(revenueData);
      XLSX.utils.book_append_sheet(workbook, revenueSheet, 'Revenue Analysis');
    }
    
    // Save workbook
    const timestamp = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `demand-matrix-${options.groupingMode}-${timestamp}.xlsx`);
  }

  private static prepareMatrixDataForExcel(
    data: DemandMatrixData,
    filteredMonths: any[],
    selectedSkills: string[],
    selectedClients: string[],
    options: DemandMatrixExportOptions
  ): any[] {
    const filteredData = data.dataPoints.filter(point => {
      const skillMatch = selectedSkills.includes(point.skillType);
      const monthMatch = filteredMonths.some(month => month.key === point.month);
      return skillMatch && monthMatch;
    });

    return filteredData.map(point => {
      const baseData = {
        [options.groupingMode === 'skill' ? 'Skill' : 'Client']: point.skillType,
        'Month': point.monthLabel || point.month,
        'Demand Hours': point.demandHours,
        'Task Count': point.taskCount,
        'Client Count': point.clientCount
      };

      // Add revenue columns for client mode
      if (options.groupingMode === 'client' && options.includeRevenueColumns) {
        return {
          ...baseData,
          'Suggested Revenue': point.suggestedRevenue || 0,
          'Expected Less Suggested': point.expectedLessSuggested || 0
        };
      }

      return baseData;
    });
  }

  private static prepareSummaryDataForExcel(data: DemandMatrixData, options: DemandMatrixExportOptions): any[] {
    const summary = [
      { Metric: 'Total Demand Hours', Value: formatHours(data.totalDemand, 1) },
      { Metric: 'Total Tasks', Value: data.totalTasks },
      { Metric: 'Total Clients', Value: data.totalClients }
    ];

    if (options.groupingMode === 'client' && data.revenueTotals) {
      summary.push(
        { Metric: 'Total Expected Revenue', Value: formatCurrency(data.revenueTotals.totalExpectedRevenue) },
        { Metric: 'Total Suggested Revenue', Value: formatCurrency(data.revenueTotals.totalSuggestedRevenue) },
        { Metric: 'Revenue Difference', Value: formatCurrency(data.revenueTotals.totalExpectedLessSuggested) }
      );
    }

    return summary;
  }

  private static prepareRevenueDataForExcel(data: DemandMatrixData): any[] {
    if (!data.clientRevenue || !data.clientSuggestedRevenue) return [];

    return Array.from(data.clientRevenue.entries()).map(([client, expectedRevenue]) => ({
      'Client Name': client,
      'Total Hours': formatHours(data.clientTotals?.get(client) || 0, 1),
      'Expected Revenue': expectedRevenue,
      'Suggested Revenue': data.clientSuggestedRevenue?.get(client) || 0,
      'Revenue Difference': data.clientExpectedLessSuggested?.get(client) || 0,
      'Hourly Rate': data.clientHourlyRates?.get(client) || 0
    })).sort((a, b) => b['Expected Revenue'] - a['Expected Revenue']);
  }

  private static exportToCSV(
    data: DemandMatrixData,
    filteredMonths: any[],
    selectedSkills: string[],
    selectedClients: string[],
    title: string,
    options: DemandMatrixExportOptions
  ): void {
    const headers = [
      options.groupingMode === 'skill' ? 'Skill' : 'Client',
      'Month',
      'Demand Hours',
      'Task Count',
      'Client Count'
    ];

    if (options.groupingMode === 'client' && options.includeRevenueColumns) {
      headers.push('Suggested Revenue', 'Expected Less Suggested');
    }

    const filteredData = data.dataPoints.filter(point => {
      const skillMatch = selectedSkills.includes(point.skillType);
      const monthMatch = filteredMonths.some(month => month.key === point.month);
      return skillMatch && monthMatch;
    });

    const csvContent = [
      headers.join(','),
      ...filteredData.map(point => {
        const baseRow = [
          `"${point.skillType}"`,
          `"${point.monthLabel || point.month}"`,
          point.demandHours,
          point.taskCount,
          point.clientCount
        ];

        if (options.groupingMode === 'client' && options.includeRevenueColumns) {
          baseRow.push(
            point.suggestedRevenue || 0,
            point.expectedLessSuggested || 0
          );
        }

        return baseRow.join(',');
      })
    ].join('\n');

    this.downloadFile(csvContent, `demand-matrix-${options.groupingMode}-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
  }

  private static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
