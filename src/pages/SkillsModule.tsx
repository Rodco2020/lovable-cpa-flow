
import React from "react";
import { Routes, Route } from "react-router-dom";
import SkillList from "@/components/skills/SkillList";
import SkillDetail from "@/components/skills/SkillDetail";
import SkillForm from "@/components/skills/SkillForm";

const SkillsModule: React.FC = () => {
  return (
    <Routes>
      <Route index element={<SkillList />} />
      <Route path="new" element={<SkillForm />} />
      <Route path=":id" element={<SkillDetail />} />
      <Route path=":id/edit" element={<SkillForm />} />
    </Routes>
  );
};

export default SkillsModule;
