import { ForecastData, ForecastParameters, FinancialProjection } from '@/types/forecasting';
import { getAllStaff } from '@/services/staffService';
import { getClientById } from '@/services/clientService';
import { getTaskInstances } from '@/services/taskService';
import { debugLog } from './logger';
import { getPeriodDateRange } from './utils';

export interface FinancialOptions {
  forecastData: ForecastData[];
  parameters: ForecastParameters;
}

export const generateFinancialProjections = async ({
  forecastData,
  parameters
}: FinancialOptions): Promise<FinancialProjection[]> => {
  const financials: FinancialProjection[] = [];
  const allStaff = await getAllStaff();

  const skillCostMap: Record<string, number> = {};
  allStaff.forEach(staff => {
    staff.skills.forEach(skillId => {
      if (!skillCostMap[skillId]) {
        skillCostMap[skillId] = staff.costPerHour;
      } else {
        skillCostMap[skillId] = (skillCostMap[skillId] + staff.costPerHour) / 2;
      }
    });
  });

  for (const periodData of forecastData) {
    let periodCost = 0;
    periodData.demand.forEach(skillHours => {
      periodCost += skillHours.hours * (skillCostMap[skillHours.skill] || 0);
    });

    const periodRange = getPeriodDateRange(periodData.period, parameters.granularity);
    const startDate = periodRange.startDate;
    const endDate = periodRange.endDate;
    const millisecondsInMonth = 30.44 * 24 * 60 * 60 * 1000;
    const monthsInPeriod = (endDate.getTime() - startDate.getTime()) / millisecondsInMonth;

    const tasksInPeriod = await getTaskInstances({
      dueAfter: periodRange.startDate,
      dueBefore: periodRange.endDate
    });

    const countedClients = new Set<string>();
    let periodRevenue = 0;

    debugLog(`Calculating revenue for period ${periodData.period}, months: ${monthsInPeriod.toFixed(2)}`);

    for (const task of tasksInPeriod) {
      if (!countedClients.has(task.clientId)) {
        try {
          const client = await getClientById(task.clientId);
          if (client) {
            const clientRevenue = client.expectedMonthlyRevenue * monthsInPeriod;
            periodRevenue += clientRevenue;
            debugLog(
              `Added client ${client.legalName} revenue: $${client.expectedMonthlyRevenue} × ${monthsInPeriod.toFixed(2)} months = $${clientRevenue.toFixed(2)}`
            );
            countedClients.add(task.clientId);
          }
        } catch (error) {
          console.error(`Error fetching client ${task.clientId}:`, error);
        }
      }
    }

    if (countedClients.size === 0) {
      try {
        const dummyClientId = tasksInPeriod.length > 0 ? tasksInPeriod[0].clientId : null;
        if (dummyClientId) {
          const client = await getClientById(dummyClientId);
          if (client && client.status === 'Active') {
            const clientRevenue = client.expectedMonthlyRevenue * monthsInPeriod;
            periodRevenue += clientRevenue;
            debugLog(
              `No tasks found, using active client ${client.legalName}: $${client.expectedMonthlyRevenue} × ${monthsInPeriod.toFixed(2)} months = $${clientRevenue.toFixed(2)}`
            );
          }
        }
      } catch (error) {
        console.error('Error fetching clients for revenue calculation:', error);
      }
    }

    financials.push({
      period: periodData.period,
      revenue: periodRevenue,
      cost: periodCost,
      profit: periodRevenue - periodCost
    });
  }

  return financials;
};

