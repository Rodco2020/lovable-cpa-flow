
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export interface SkillsSelectionProps {
  selectedSkills: string[];
  toggleSkill: (skillId: string) => void;
  error: string | null;
}

interface Skill {
  id: string;
  name: string;
  category: string;
}

export const SkillsSelection: React.FC<SkillsSelectionProps> = ({
  selectedSkills,
  toggleSkill,
  error
}) => {
  const { data: skills = [], isLoading } = useQuery({
    queryKey: ['skills'],
    queryFn: async (): Promise<Skill[]> => {
      const { data, error } = await supabase
        .from('skills')
        .select('id, name, category')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">Required Skills *</label>
        <div className="flex items-center justify-center p-4 border rounded-md">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span>Loading skills...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Required Skills *</label>
      <div className="border rounded-md p-3 max-h-48 overflow-y-auto">
        <div className="grid grid-cols-1 gap-2">
          {skills.map((skill) => (
            <Button
              key={skill.id}
              type="button"
              variant={selectedSkills.includes(skill.id) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleSkill(skill.id)}
              className="justify-start"
            >
              {skill.name}
              {skill.category && (
                <Badge variant="secondary" className="ml-2">
                  {skill.category}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      <p className="text-xs text-muted-foreground">
        Select at least one skill required for this task
      </p>
    </div>
  );
};
