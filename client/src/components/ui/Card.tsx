import React, { HTMLAttributes, forwardRef } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', hoverEffect = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-surface rounded-xl border border-border shadow-subtle ${
          hoverEffect
            ? 'transition-all duration-200 hover:shadow-elevated hover:border-slate-300 hover:-translate-y-0.5'
            : ''
        } ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
