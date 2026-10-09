import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card } from '../ui/Card.js';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  subtext?: string;
  color?: 'primary' | 'emerald' | 'amber' | 'slate';
}

export function StatCard({
  label,
  value,
  icon: Icon,
  subtext,
  color = 'primary',
}: StatCardProps) {
  const colorMap = {
    primary: 'bg-primary-light text-primary border-primary/20',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    slate: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  return (
    <Card className="p-5 flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
          {label}
        </p>
        <p className="text-2xl font-extrabold text-ink tracking-tight">{value}</p>
        {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
      </div>

      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${colorMap[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
    </Card>
  );
}
