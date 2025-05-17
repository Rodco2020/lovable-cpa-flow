
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export interface FinancialProjectionsProps {
  data: any[];
  view: 'chart' | 'table';
}

const FinancialProjections: React.FC<FinancialProjectionsProps> = ({ data, view }) => {
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  return (
    <div>
      {view === 'chart' ? (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip 
                formatter={(value) => formatCurrency(Number(value))}
              />
              <Legend />
              <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#0EA5E9" strokeWidth={2} />
              <Line type="monotone" dataKey="cost" name="Cost" stroke="#F97316" strokeWidth={2} />
              <Line type="monotone" dataKey="profit" name="Profit" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Period</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              <TableHead className="text-right">Cost</TableHead>
              <TableHead className="text-right">Profit</TableHead>
              <TableHead className="text-right">Margin %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((projection) => {
              const margin = projection.revenue > 0 
                ? ((projection.profit / projection.revenue) * 100).toFixed(1) 
                : '0.0';
                
              return (
                <TableRow key={projection.period}>
                  <TableCell>{projection.period}</TableCell>
                  <TableCell className="text-right">{formatCurrency(projection.revenue)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(projection.cost)}</TableCell>
                  <TableCell className={`text-right ${projection.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(projection.profit)}
                  </TableCell>
                  <TableCell className={`text-right ${
                    parseFloat(margin) < 0 
                      ? 'text-red-600' 
                      : parseFloat(margin) < 20 
                        ? 'text-orange-500' 
                        : 'text-green-600'
                  }`}>
                    {margin}%
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default FinancialProjections;
