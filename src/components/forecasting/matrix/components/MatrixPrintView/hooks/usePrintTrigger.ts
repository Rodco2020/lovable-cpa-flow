
import { useEffect } from 'react';

export const usePrintTrigger = (onPrint: () => void) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onPrint();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [onPrint]);
};
