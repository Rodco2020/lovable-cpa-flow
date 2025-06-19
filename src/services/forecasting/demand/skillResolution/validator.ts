
/**
 * Skill Validation Utilities
 * Handles UUID validation and skill reference validation
 */

import { supabase } from '@/integrations/supabase/client';
import { SkillCacheManager, SkillValidationResult } from './types';

export class SkillValidator {
  constructor(private cacheManager: SkillCacheManager) {}

  /**
   * Validate if a string is a UUID
   */
  isUUID(str: string): boolean {
    if (!str || typeof str !== 'string') return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  /**
   * Validate skill references with comprehensive diagnostics
   */
  async validateSkillReferences(skillRefs: string[]): Promise<SkillValidationResult> {
    console.log('🔍 [SKILL VALIDATION] Starting validation:', skillRefs);

    const diagnostics = {
      inputCount: skillRefs?.length || 0,
      validUuids: 0,
      invalidUuids: 0,
      resolvedNames: 0,
      cacheHits: 0,
      errors: [] as string[]
    };

    if (!Array.isArray(skillRefs)) {
      diagnostics.errors.push('Input is not an array');
      return { valid: [], invalid: skillRefs || [], resolved: [], diagnostics };
    }

    await this.cacheManager.initialize();

    const valid: string[] = [];
    const invalid: string[] = [];
    const resolved: string[] = [];

    for (const skillRef of skillRefs) {
      try {
        if (!skillRef || typeof skillRef !== 'string') {
          invalid.push(skillRef);
          diagnostics.invalidUuids++;
          continue;
        }

        const trimmed = skillRef.trim();
        
        if (this.isUUID(trimmed)) {
          diagnostics.validUuids++;
          const name = this.cacheManager.getNameById(trimmed);
          
          if (name) {
            valid.push(trimmed);
            resolved.push(name);
            diagnostics.resolvedNames++;
            diagnostics.cacheHits++;
          } else {
            // Try database lookup for missing cache entries
            try {
              const { data } = await supabase
                .from('skills')
                .select('name')
                .eq('id', trimmed)
                .single();
                
              if (data?.name) {
                valid.push(trimmed);
                resolved.push(data.name);
                diagnostics.resolvedNames++;
                this.cacheManager.updateCache(trimmed, data.name);
              } else {
                invalid.push(trimmed);
                resolved.push(`Unknown: ${trimmed.slice(0, 8)}`);
              }
            } catch {
              invalid.push(trimmed);
              resolved.push(`Error: ${trimmed.slice(0, 8)}`);
            }
          }
        } else {
          // It's a name - check if valid
          const id = this.cacheManager.getIdByName(trimmed);
          if (id) {
            valid.push(trimmed);
            resolved.push(trimmed);
            diagnostics.resolvedNames++;
            diagnostics.cacheHits++;
          } else {
            invalid.push(trimmed);
            resolved.push(trimmed);
          }
        }
      } catch (error) {
        console.error(`❌ [SKILL VALIDATION] Error validating skill reference ${skillRef}:`, error);
        invalid.push(skillRef);
        resolved.push(`Error: ${skillRef}`);
        diagnostics.errors.push(`Validation error for ${skillRef}: ${error}`);
      }
    }

    console.log('📊 [SKILL VALIDATION] Validation complete:', { valid, invalid, resolved, diagnostics });
    return { valid, invalid, resolved, diagnostics };
  }
}
