
import { ExportOptions, ClientDetailReportData, ReportCustomization } from '@/types/clientReporting';
import { formatCurrency, formatDate } from '@/lib/utils';

export class ExportService {
  static async exportToPDF(
    data: ClientDetailReportData,
    options: ExportOptions,
    customization: ReportCustomization
  ): Promise<void> {
    // This would integrate with a PDF library like jsPDF or react-pdf
    // For now, we'll create a print-friendly view and use browser print
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = this.generatePrintHTML(data, options, customization);
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  }

  static async exportToExcel(
    data: ClientDetailReportData,
    options: ExportOptions
  ): Promise<void> {
    // This would integrate with a library like xlsx or exceljs
    // For now, we'll create a CSV-like format
    const csvContent = this.generateCSVContent(data, options);
    this.downloadFile(csvContent, `client-report-${data.client.id}.csv`, 'text/csv');
  }

  static async exportToCSV(
    data: ClientDetailReportData,
    options: ExportOptions
  ): Promise<void> {
    const csvContent = this.generateCSVContent(data, options);
    this.downloadFile(csvContent, `client-report-${data.client.id}.csv`, 'text/csv');
  }

  private static generatePrintHTML(
    data: ClientDetailReportData,
    options: ExportOptions,
    customization: ReportCustomization
  ): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${customization.title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            .header { border-bottom: 2px solid #${customization.colorScheme === 'blue' ? '3b82f6' : customization.colorScheme === 'green' ? '10b981' : customization.colorScheme === 'purple' ? '8b5cf6' : '6b7280'}; padding-bottom: 10px; margin-bottom: 20px; }
            .client-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
            .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px; }
            .metric-card { border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; text-align: center; }
            .metric-value { font-size: 24px; font-weight: bold; color: #${customization.colorScheme === 'blue' ? '3b82f6' : customization.colorScheme === 'green' ? '10b981' : customization.colorScheme === 'purple' ? '8b5cf6' : '6b7280'}; }
            .metric-label { font-size: 12px; color: #6b7280; }
            .task-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .task-table th, .task-table td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
            .task-table th { background-color: #f9fafb; font-weight: bold; }
            .status-badge { padding: 2px 8px; border-radius: 12px; font-size: 12px; }
            .status-completed { background-color: #d1fae5; color: #065f46; }
            .status-inprogress { background-color: #fef3c7; color: #92400e; }
            .status-scheduled { background-color: #dbeafe; color: #1e40af; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${customization.title}</h1>
            <p>Generated on ${formatDate(new Date())}</p>
          </div>

          <div class="client-info">
            <div>
              <h2>Client Information</h2>
              <p><strong>Name:</strong> ${data.client.legalName}</p>
              <p><strong>Contact:</strong> ${data.client.primaryContact}</p>
              <p><strong>Email:</strong> ${data.client.email}</p>
              <p><strong>Phone:</strong> ${data.client.phone}</p>
            </div>
            <div>
              <p><strong>Industry:</strong> ${data.client.industry}</p>
              <p><strong>Status:</strong> ${data.client.status}</p>
              ${data.client.staffLiaisonName ? `<p><strong>Staff Liaison:</strong> ${data.client.staffLiaisonName}</p>` : ''}
              <p><strong>Expected Monthly Revenue:</strong> ${formatCurrency(data.revenueMetrics.expectedMonthlyRevenue)}</p>
            </div>
          </div>

          ${customization.showMetrics ? `
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-value">${data.taskMetrics.totalTasks}</div>
              <div class="metric-label">Total Tasks</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${data.taskMetrics.completedTasks}</div>
              <div class="metric-label">Completed</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${data.taskMetrics.activeTasks}</div>
              <div class="metric-label">Active</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${data.taskMetrics.completionRate.toFixed(1)}%</div>
              <div class="metric-label">Completion Rate</div>
            </div>
          </div>
          ` : ''}

          ${options.includeTaskDetails ? `
          <h2>Task Breakdown</h2>
          <h3>Recurring Tasks</h3>
          <table class="task-table">
            <thead>
              <tr>
                <th>Task Name</th>
                <th>Category</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Est. Hours</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              ${data.taskBreakdown.recurring.map(task => `
                <tr>
                  <td>${task.taskName}</td>
                  <td>${task.category}</td>
                  <td><span class="status-badge status-${task.status.toLowerCase().replace(' ', '')}">${task.status}</span></td>
                  <td>${task.priority}</td>
                  <td>${task.estimatedHours}</td>
                  <td>${task.dueDate ? formatDate(task.dueDate) : 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h3>Ad-hoc Tasks</h3>
          <table class="task-table">
            <thead>
              <tr>
                <th>Task Name</th>
                <th>Category</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Est. Hours</th>
                <th>Due Date</th>
                <th>Assigned Staff</th>
              </tr>
            </thead>
            <tbody>
              ${data.taskBreakdown.adhoc.map(task => `
                <tr>
                  <td>${task.taskName}</td>
                  <td>${task.category}</td>
                  <td><span class="status-badge status-${task.status.toLowerCase().replace(' ', '')}">${task.status}</span></td>
                  <td>${task.priority}</td>
                  <td>${task.estimatedHours}</td>
                  <td>${task.dueDate ? formatDate(task.dueDate) : 'N/A'}</td>
                  <td>${task.assignedStaffName || 'Unassigned'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          ` : ''}

          ${customization.includeFooter ? `
          <div class="footer">
            <p>${customization.customFooterText || 'Generated by CPA Practice Management Software'}</p>
          </div>
          ` : ''}
        </body>
      </html>
    `;
  }

  private static generateCSVContent(
    data: ClientDetailReportData,
    options: ExportOptions
  ): string {
    let csvContent = '';
    
    // Client info header
    csvContent += 'Client Information\n';
    csvContent += `Name,${data.client.legalName}\n`;
    csvContent += `Contact,${data.client.primaryContact}\n`;
    csvContent += `Email,${data.client.email}\n`;
    csvContent += `Phone,${data.client.phone}\n`;
    csvContent += `Industry,${data.client.industry}\n`;
    csvContent += `Status,${data.client.status}\n`;
    csvContent += `Expected Monthly Revenue,${data.revenueMetrics.expectedMonthlyRevenue}\n\n`;

    // Task metrics
    csvContent += 'Task Metrics\n';
    csvContent += `Total Tasks,${data.taskMetrics.totalTasks}\n`;
    csvContent += `Completed Tasks,${data.taskMetrics.completedTasks}\n`;
    csvContent += `Active Tasks,${data.taskMetrics.activeTasks}\n`;
    csvContent += `Overdue Tasks,${data.taskMetrics.overdueTasks}\n`;
    csvContent += `Completion Rate,${data.taskMetrics.completionRate.toFixed(1)}%\n\n`;

    if (options.includeTaskDetails) {
      // Recurring tasks
      csvContent += 'Recurring Tasks\n';
      csvContent += 'Task Name,Category,Status,Priority,Estimated Hours,Due Date\n';
      data.taskBreakdown.recurring.forEach(task => {
        csvContent += `"${task.taskName}",${task.category},${task.status},${task.priority},${task.estimatedHours},${task.dueDate ? formatDate(task.dueDate) : 'N/A'}\n`;
      });
      csvContent += '\n';

      // Ad-hoc tasks
      csvContent += 'Ad-hoc Tasks\n';
      csvContent += 'Task Name,Category,Status,Priority,Estimated Hours,Due Date,Assigned Staff\n';
      data.taskBreakdown.adhoc.forEach(task => {
        csvContent += `"${task.taskName}",${task.category},${task.status},${task.priority},${task.estimatedHours},${task.dueDate ? formatDate(task.dueDate) : 'N/A'},${task.assignedStaffName || 'Unassigned'}\n`;
      });
    }

    return csvContent;
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
