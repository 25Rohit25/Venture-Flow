import { IndustryType, StageType, InterestStatus, StartupStatus } from './types.js';

export function formatINR(amount: number): string {
  if (amount === undefined || amount === null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatINRCompact(amount: number): string {
  if (amount >= 10000000) {
    const cr = amount / 10000000;
    return `₹${cr % 1 === 0 ? cr : cr.toFixed(1)} Cr`;
  }
  if (amount >= 100000) {
    const l = amount / 100000;
    return `₹${l % 1 === 0 ? l : l.toFixed(1)} Lakh`;
  }
  return formatINR(amount);
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '—';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export const INDUSTRY_LABELS: Record<IndustryType, string> = {
  FINTECH: 'Fintech',
  HEALTHTECH: 'Healthtech',
  EDTECH: 'Edtech',
  SAAS: 'B2B SaaS',
  ECOMMERCE: 'E-Commerce',
  OTHER: 'Other',
};

export const STAGE_LABELS: Record<StageType, string> = {
  IDEA: 'Idea / Concept',
  MVP: 'MVP / Prototype',
  EARLY_REVENUE: 'Early Revenue',
  GROWTH: 'Growth / Scaling',
};

export function getIndustryBadgeClasses(industry: IndustryType): string {
  switch (industry) {
    case 'FINTECH':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'HEALTHTECH':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'EDTECH':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'SAAS':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'ECOMMERCE':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}

export function getStageBadgeClasses(stage: StageType): string {
  switch (stage) {
    case 'IDEA':
      return 'bg-slate-100 text-slate-700 border-slate-300';
    case 'MVP':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'EARLY_REVENUE':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'GROWTH':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

export function getInterestStatusClasses(status: InterestStatus): string {
  switch (status) {
    case 'PENDING':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'ACCEPTED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'DECLINED':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'WITHDRAWN':
      return 'bg-slate-100 text-slate-600 border-slate-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

export function getStartupStatusClasses(status: StartupStatus): string {
  switch (status) {
    case 'PUBLISHED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'DRAFT':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'ARCHIVED':
      return 'bg-slate-100 text-slate-600 border-slate-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}
