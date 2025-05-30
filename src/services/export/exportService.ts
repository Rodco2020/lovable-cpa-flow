
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { formatCurrency, formatDate } from '@/lib/utils';

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  includeFilters?: boolean;
  customTitle?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export interface ClientExportData {
  id: string;
  legalName: string;
  primaryContact: string;
  email: string;
  phone: string;
  industry: string;
  status: string;
  expectedMonthlyRevenue: number;
  staffLiaisonName?: string;
}

export interface TaskExportData {
  id: string;
  clientName: string;
  taskName: string;
  taskType: 'Recurring' | 'Ad-hoc';
  status: string;
  priority: string;
  estimatedHours: number;
  requiredSkills: string[];
  nextDueDate?: string;
  recurrencePattern?: string;
}

export class ExportService {
  static async exportClients(
    clients: ClientExportData[],
    options: ExportOptions,
    appliedFilters?: Record<string, any>
  ): Promise<void> {
    const title = options.customTitle || 'Client Directory Export';
    
    switch (options.format) {
      case 'pdf':
        return this.exportClientsToPDF(clients, title, appliedFilters);
      case 'excel':
        return this.exportClientsToExcel(clients, title, appliedFilters);
      case 'csv':
        return this.exportClientsToCSV(clients, title);
      default:
        throw new Error('Unsupported export format');
    }
  }

  static async exportTasks(
    tasks: TaskExportData[],
    options: ExportOptions,
    appliedFilters?: Record<string, any>
  ): Promise<void> {
    const title = options.customTitle || 'Client-Assigned Tasks Export';
    
    switch (options.format) {
      case 'pdf':
        return this.exportTasksToPDF(tasks, title, appliedFilters);
      case 'excel':
        return this.exportTasksToExcel(tasks, title, appliedFilters);
      case 'csv':
        return this.exportTasksToCSV(tasks, title);
      default:
        throw new Error('Unsupported export format');
    }
  }

  private static exportClientsToPDF(
    clients: ClientExportData[],
    title: string,
    appliedFilters?: Record<string, any>
  ): void {
    const doc = new jsPDF();
    let yPosition = 20;
    
    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 20, yPosition);
    yPosition += 15;
    
    // Generation date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${formatDate(new Date())}`, 20, yPosition);
    yPosition += 10;
    
    // Applied filters (if any)
    if (appliedFilters && Object.keys(appliedFilters).length > 0) {
      doc.text('Applied Filters:', 20, yPosition);
      yPosition += 7;
      Object.entries(appliedFilters).forEach(([key, value]) => {
        if (value) {
          doc.text(`• ${key}: ${value}`, 25, yPosition);
          yPosition += 5;
        }
      });
      yPosition += 5;
    }
    
    // Table headers
    const headers = ['Client Name', 'Contact', 'Industry', 'Status', 'Monthly Revenue'];
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    
    let xPosition = 20;
    const columnWidths = [45, 35, 30, 25, 35];
    
    headers.forEach((header, index) => {
      doc.text(header, xPosition, yPosition);
      xPosition += columnWidths[index];
    });
    yPosition += 10;
    
    // Table data
    doc.setFont('helvetica', 'normal');
    clients.forEach((client) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      
      xPosition = 20;
      const rowData = [
        client.legalName,
        client.primaryContact,
        client.industry,
        client.status,
        formatCurrency(client.expectedMonthlyRevenue)
      ];
      
      rowData.forEach((data, index) => {
        const text = data.length > 15 ? data.substring(0, 12) + '...' : data;
        doc.text(text, xPosition, yPosition);
        xPosition += columnWidths[index];
      });
      yPosition += 7;
    });
    
    doc.save(`${title.replace(/\s+/g, '_').toLowerCase()}_${new Date().getTime()}.pdf`);
  }

  private static exportTasksToPDF(
    tasks: TaskExportData[],
    title: string,
    appliedFilters?: Record<string, any>
  ): void {
    const doc = new jsPDF();
    let yPosition = 20;
    
    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 20, yPosition);
    yPosition += 15;
    
    // Generation date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${formatDate(new Date())}`, 20, yPosition);
    yPosition += 10;
    
    // Applied filters
    if (appliedFilters && Object.keys(appliedFilters).length > 0) {
      doc.text('Applied Filters:', 20, yPosition);
      yPosition += 7;
      Object.entries(appliedFilters).forEach(([key, value]) => {
        if (value) {
          doc.text(`• ${key}: ${value}`, 25, yPosition);
          yPosition += 5;
        }
      });
      yPosition += 5;
    }
    
    // Table headers
    const headers = ['Client', 'Task', 'Type', 'Priority', 'Hours', 'Skills'];
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    
    let xPosition = 20;
    const columnWidths = [30, 35, 20, 20, 15, 50];
    
    headers.forEach((header, index) => {
      doc.text(header, xPosition, yPosition);
      xPosition += columnWidths[index];
    });
    yPosition += 10;
    
    // Table data
    doc.setFont('helvetica', 'normal');
    tasks.forEach((task) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      
      xPosition = 20;
      const rowData = [
        task.clientName,
        task.taskName,
        task.taskType,
        task.priority,
        task.estimatedHours.toString(),
        task.requiredSkills.join(', ')
      ];
      
      rowData.forEach((data, index) => {
        const maxLength = index === 5 ? 20 : 12; // Skills column can be longer
        const text = data.length > maxLength ? data.substring(0, maxLength - 3) + '...' : data;
        doc.text(text, xPosition, yPosition);
        xPosition += columnWidths[index];
      });
      yPosition += 7;
    });
    
    doc.save(`${title.replace(/\s+/g, '_').toLowerCase()}_${new Date().getTime()}.pdf`);
  }

  private static exportClientsToExcel(
    clients: ClientExportData[],
    title: string,
    appliedFilters?: Record<string, any>
  ): void {
    const workbook = XLSX.utils.book_new();
    
    // Prepare data
    const data = clients.map(client => ({
      'Client Name': client.legalName,
      'Primary Contact': client.primaryContact,
      'Email': client.email,
      'Phone': client.phone,
      'Industry': client.industry,
      'Status': client.status,
      'Monthly Revenue': client.expectedMonthlyRevenue,
      'Staff Liaison': client.staffLiaisonName || 'N/A'
    }));
    
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Add title and metadata
    XLSX.utils.sheet_add_aoa(worksheet, [
      [title],
      [`Generated on: ${formatDate(new Date())}`],
      [''],
      ...(appliedFilters && Object.keys(appliedFilters).length > 0 
        ? [['Applied Filters:'], ...Object.entries(appliedFilters).map(([key, value]) => [`${key}: ${value}`]), ['']]
        : [])
    ], { origin: 'A1' });
    
    // Adjust the data starting row
    const dataStartRow = appliedFilters && Object.keys(appliedFilters).length > 0 
      ? 4 + Object.keys(appliedFilters).length 
      : 4;
    
    XLSX.utils.sheet_add_json(worksheet, data, { origin: `A${dataStartRow}` });
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Clients');
    
    // Save file
    XLSX.writeFile(workbook, `${title.replace(/\s+/g, '_').toLowerCase()}_${new Date().getTime()}.xlsx`);
  }

  private static exportTasksToExcel(
    tasks: TaskExportData[],
    title: string,
    appliedFilters?: Record<string, any>
  ): void {
    const workbook = XLSX.utils.book_new();
    
    // Prepare data
    const data = tasks.map(task => ({
      'Client Name': task.clientName,
      'Task Name': task.taskName,
      'Task Type': task.taskType,
      'Status': task.status,
      'Priority': task.priority,
      'Estimated Hours': task.estimatedHours,
      'Required Skills': task.requiredSkills.join(', '),
      'Next Due Date': task.nextDueDate || 'N/A',
      'Recurrence Pattern': task.recurrencePattern || 'N/A'
    }));
    
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Add title and metadata
    XLSX.utils.sheet_add_aoa(worksheet, [
      [title],
      [`Generated on: ${formatDate(new Date())}`],
      [''],
      ...(appliedFilters && Object.keys(appliedFilters).length > 0 
        ? [['Applied Filters:'], ...Object.entries(appliedFilters).map(([key, value]) => [`${key}: ${value}`]), ['']]
        : [])
    ], { origin: 'A1' });
    
    // Adjust the data starting row
    const dataStartRow = appliedFilters && Object.keys(appliedFilters).length > 0 
      ? 4 + Object.keys(appliedFilters).length 
      : 4;
    
    XLSX.utils.sheet_add_json(worksheet, data, { origin: `A${dataStartRow}` });
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tasks');
    
    // Save file
    XLSX.writeFile(workbook, `${title.replace(/\s+/g, '_').toLowerCase()}_${new Date().getTime()}.xlsx`);
  }

  private static exportClientsToCSV(clients: ClientExportData[], title: string): void {
    const headers = ['Client Name', 'Primary Contact', 'Email', 'Phone', 'Industry', 'Status', 'Monthly Revenue', 'Staff Liaison'];
    const csvContent = [
      headers.join(','),
      ...clients.map(client => [
        `"${client.legalName}"`,
        `"${client.primaryContact}"`,
        `"${client.email}"`,
        `"${client.phone}"`,
        `"${client.industry}"`,
        `"${client.status}"`,
        client.expectedMonthlyRevenue,
        `"${client.staffLiaisonName || 'N/A'}"`
      ].join(','))
    ].join('\n');
    
    this.downloadFile(csvContent, `${title.replace(/\s+/g, '_').toLowerCase()}_${new Date().getTime()}.csv`, 'text/csv');
  }

  private static exportTasksToCSV(tasks: TaskExportData[], title: string): void {
    const headers = ['Client Name', 'Task Name', 'Task Type', 'Status', 'Priority', 'Estimated Hours', 'Required Skills', 'Next Due Date', 'Recurrence Pattern'];
    const csvContent = [
      headers.join(','),
      ...tasks.map(task => [
        `"${task.clientName}"`,
        `"${task.taskName}"`,
        `"${task.taskType}"`,
        `"${task.status}"`,
        `"${task.priority}"`,
        task.estimatedHours,
        `"${task.requiredSkills.join(', ')}"`,
        `"${task.nextDueDate || 'N/A'}"`,
        `"${task.recurrencePattern || 'N/A'}"`
      ].join(','))
    ].join('\n');
    
    this.downloadFile(csvContent, `${title.replace(/\s+/g, '_').toLowerCase()}_${new Date().getTime()}.csv`, 'text/csv');
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
