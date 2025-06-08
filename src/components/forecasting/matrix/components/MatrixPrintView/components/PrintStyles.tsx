
import React from 'react';
import { PrintStyleProps } from '../types';

export const PrintStyles: React.FC<PrintStyleProps> = ({ orientation }) => {
  return (
    <style>{`
      @media print {
        .print-view {
          font-size: 11px;
          line-height: 1.3;
          -webkit-print-color-adjust: exact;
          color-adjust: exact;
        }
        .no-print {
          display: none !important;
        }
        .landscape {
          size: landscape;
        }
        .portrait {
          size: portrait;
        }
        table {
          border-collapse: collapse;
          width: 100%;
          font-size: 10px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 4px;
          text-align: center;
        }
        th {
          background-color: #f5f5f5 !important;
          font-weight: bold;
        }
        .capacity-cell {
          background-color: #e3f2fd !important;
        }
        .demand-cell {
          background-color: #fff3e0 !important;
        }
        .gap-positive {
          background-color: #e8f5e8 !important;
        }
        .gap-negative {
          background-color: #ffebee !important;
        }
      }
    `}</style>
  );
};
