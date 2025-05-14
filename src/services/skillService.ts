
import { v4 as uuidv4 } from "uuid";
import { Skill, ProficiencyLevel, SkillCategory } from "@/types/skill";

// Mock data for development
const mockSkills: Skill[] = [
  {
    id: "skill-1",
    name: "Tax Preparation",
    description: "Preparation of various tax returns including individual and business filings",
    proficiencyLevel: "Expert",
    category: "Tax",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "skill-2",
    name: "Bookkeeping",
    description: "Monthly and quarterly bookkeeping services",
    proficiencyLevel: "Intermediate",
    category: "Bookkeeping",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "skill-3",
    name: "Audit",
    description: "Financial statement audit services",
    proficiencyLevel: "Expert",
    category: "Audit",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "skill-4",
    name: "Payroll Tax",
    description: "Preparation and filing of payroll tax returns",
    proficiencyLevel: "Intermediate",
    category: "Tax",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// CRUD operations
export const getAllSkills = async (): Promise<Skill[]> => {
  return Promise.resolve([...mockSkills]);
};

export const getSkillById = async (id: string): Promise<Skill | undefined> => {
  return Promise.resolve(mockSkills.find(skill => skill.id === id));
};

export const createSkill = async (skillData: Omit<Skill, "id" | "createdAt" | "updatedAt">): Promise<Skill> => {
  const newSkill: Skill = {
    id: uuidv4(),
    ...skillData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  mockSkills.push(newSkill);
  return Promise.resolve(newSkill);
};

export const updateSkill = async (id: string, skillData: Partial<Omit<Skill, "id" | "createdAt">>): Promise<Skill | undefined> => {
  const index = mockSkills.findIndex(skill => skill.id === id);
  
  if (index === -1) {
    return Promise.resolve(undefined);
  }
  
  mockSkills[index] = {
    ...mockSkills[index],
    ...skillData,
    updatedAt: new Date().toISOString(),
  };
  
  return Promise.resolve(mockSkills[index]);
};

export const deleteSkill = async (id: string): Promise<boolean> => {
  const index = mockSkills.findIndex(skill => skill.id === id);
  
  if (index === -1) {
    return Promise.resolve(false);
  }
  
  mockSkills.splice(index, 1);
  return Promise.resolve(true);
};

// Advanced operations
export const getSkillsByCategory = async (category: SkillCategory): Promise<Skill[]> => {
  return Promise.resolve(mockSkills.filter(skill => skill.category === category));
};

export const getSkillsByProficiencyLevel = async (level: ProficiencyLevel): Promise<Skill[]> => {
  return Promise.resolve(mockSkills.filter(skill => skill.proficiencyLevel === level));
};

export const searchSkills = async (query: string): Promise<Skill[]> => {
  const lowercaseQuery = query.toLowerCase();
  return Promise.resolve(
    mockSkills.filter(
      skill => 
        skill.name.toLowerCase().includes(lowercaseQuery) || 
        (skill.description && skill.description.toLowerCase().includes(lowercaseQuery))
    )
  );
};
