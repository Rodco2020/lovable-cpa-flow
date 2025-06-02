
import { SkillType } from '@/types/task';

export interface StaffSkillAnalysis {
  id: string;
  name: string;
  roleTitle: string;
  originalSkills: string[];
  mappedSkills: SkillType[];
  hasCPA: boolean;
  hasSenior: boolean;
  hasJunior: boolean;
  defaultedToJunior: boolean;
}

export interface SkillCounts {
  'Junior Staff': number;
  'Senior Staff': number;
  'CPA': number;
}

export interface SkillDebuggerState {
  staffSkills: StaffSkillAnalysis[];
  loading: boolean;
  error: string | null;
}
