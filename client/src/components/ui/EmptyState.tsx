import React, { ReactNode } from 'react';
import { LucideIcon, FolderSearch } from 'lucide-react';
import { Button } from './Button.js';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  actionNode?: ReactNode;
}

export function EmptyState({
  icon: Icon = FolderSearch,
  title,
  description,
  actionText,
  onAction,
  actionNode,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 md:p-12 bg-white rounded-2xl border border-dashed border-slate-300">
      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-ink mb-1">{title}</h3>
      <p className="text-sm text-ink-muted max-w-md mb-5 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} variant="primary" size="md">
          {actionText}
        </Button>
      )}
      {actionNode}
    </div>
  );
}
