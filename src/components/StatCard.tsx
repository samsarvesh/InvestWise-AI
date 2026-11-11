import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  description?: string;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, description, color = "text-emerald-600" }) => {
  return (
    <div className="glass-card p-4 flex flex-col gap-1 hover:scale-[1.02] transition-transform cursor-default">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-500">{label}</span>
        <Icon className={`w-3.5 h-3.5 ${color}`} />
      </div>
      <div className="text-sm font-bold tracking-tight text-slate-950 dark:text-white truncate">{value}</div>
      {description && <p className="text-[9px] text-gray-600 dark:text-gray-500 leading-tight">{description}</p>}
    </div>
  );
};
