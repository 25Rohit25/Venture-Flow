import React from 'react';
import {
  IndustryType,
  StageType,
  InterestStatus,
  StartupStatus,
  UserRole,
} from '../../lib/types.js';
import {
  INDUSTRY_LABELS,
  STAGE_LABELS,
  getIndustryBadgeClasses,
  getStageBadgeClasses,
  getInterestStatusClasses,
  getStartupStatusClasses,
} from '../../lib/formatters.js';

export function IndustryBadge({ industry }: { industry: IndustryType }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getIndustryBadgeClasses(
        industry
      )}`}
    >
      {INDUSTRY_LABELS[industry] || industry}
    </span>
  );
}

export function StageBadge({ stage }: { stage: StageType }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStageBadgeClasses(
        stage
      )}`}
    >
      {STAGE_LABELS[stage] || stage}
    </span>
  );
}

export function InterestStatusBadge({ status }: { status: InterestStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getInterestStatusClasses(
        status
      )}`}
    >
      {status}
    </span>
  );
}

export function StartupStatusBadge({ status }: { status: StartupStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStartupStatusClasses(
        status
      )}`}
    >
      {status}
    </span>
  );
}

export function RoleBadge({ role }: { role: UserRole }) {
  const isFounder = role === 'FOUNDER';
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wider uppercase border ${
        isFounder
          ? 'bg-purple-50 text-purple-700 border-purple-200'
          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
      }`}
    >
      {role}
    </span>
  );
}
