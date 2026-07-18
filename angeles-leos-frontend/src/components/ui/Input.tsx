import { forwardRef } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  error?: string;
  rightElement?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, error, rightElement, ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            className={cn(
              'h-11 w-full rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400',
              'focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition-shadow',
              icon ? 'pl-10' : 'pl-3',
              rightElement ? 'pr-10' : 'pr-3',
              error && 'border-red-400 focus:border-red-500 focus:ring-red-100',
              className,
            )}
            {...props}
          />
          {rightElement && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</span>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';
