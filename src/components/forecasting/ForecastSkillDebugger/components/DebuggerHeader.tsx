
import React from 'react';
import { Button } from "@/components/ui/button";

interface DebuggerHeaderProps {
  onRefresh: () => void;
  loading: boolean;
}

const DebuggerHeader: React.FC<DebuggerHeaderProps> = ({ onRefresh, loading }) => {
  return (
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-medium">Staff Skill Mapping Analysis</h3>
      <Button 
        onClick={onRefresh} 
        size="sm" 
        disabled={loading}
      >
        {loading ? "Loading..." : "Refresh Skills"}
      </Button>
    </div>
  );
};

export default DebuggerHeader;
