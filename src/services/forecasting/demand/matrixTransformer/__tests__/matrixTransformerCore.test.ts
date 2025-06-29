
import { describe, it, expect } from 'vitest';
import { MatrixTransformerCore } from '../matrixTransformerCore';

describe('MatrixTransformerCore', () => {
  it('should transform skill hours data correctly', () => {
    const skillHours = [
      { skillType: 'Tax Preparation', hours: 40 },
      { skillType: 'Bookkeeping', hours: 20 }
    ];
    
    const result = MatrixTransformerCore.transformSkillHours(skillHours);
    
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
    
    // Check if the transformation maintains the skill data
    const taxPrep = result.find(item => item.skillType === 'Tax Preparation');
    expect(taxPrep).toBeDefined();
    expect(taxPrep?.hours).toBe(40);
    
    const bookkeeping = result.find(item => item.skillType === 'Bookkeeping');
    expect(bookkeeping).toBeDefined();
    expect(bookkeeping?.hours).toBe(20);
  });
  
  it('should handle empty skill hours array', () => {
    const result = MatrixTransformerCore.transformSkillHours([]);
    
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });
});
