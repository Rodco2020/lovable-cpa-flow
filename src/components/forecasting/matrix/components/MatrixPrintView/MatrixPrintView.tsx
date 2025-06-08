
import React from 'react';
import { MatrixPrintViewProps } from './types';
import { usePrintTrigger } from './hooks/usePrintTrigger';
import { useFilteredData } from './hooks/useFilteredData';
import { PrintStyles } from './components/PrintStyles';
import { ReportHeader } from './components/ReportHeader';
import { MatrixTable } from './components/MatrixTable';
import { SummaryStats } from './components/SummaryStats';
import { PrintLegend } from './components/PrintLegend';
import { PrintFooter } from './components/PrintFooter';

export const MatrixPrintView: React.FC<MatrixPrintViewProps> = ({
  matrixData,
  selectedSkills,
  selectedClientIds,
  clientNames,
  monthRange,
  printOptions,
  onPrint
}) => {
  const { filteredMonths, filteredSkills } = useFilteredData(
    matrixData,
    selectedSkills,
    monthRange
  );
  
  usePrintTrigger(onPrint);

  return (
    <div className={`print-view min-h-screen bg-white p-6 ${printOptions.orientation === 'landscape' ? 'landscape' : 'portrait'}`}>
      <PrintStyles orientation={printOptions.orientation} />
      
      <ReportHeader
        filteredMonths={filteredMonths}
        selectedSkills={selectedSkills}
        selectedClientIds={selectedClientIds}
        clientNames={clientNames}
        printOptions={printOptions}
      />

      <MatrixTable
        matrixData={matrixData}
        filteredSkills={filteredSkills}
        filteredMonths={filteredMonths}
      />

      <SummaryStats
        matrixData={matrixData}
        selectedSkills={selectedSkills}
      />

      <PrintLegend />

      <PrintFooter />
    </div>
  );
};
