import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  accent?: 'brand' | 'success' | 'warning' | 'danger';
  isLoading?: boolean;
}

const ACCENT_STYLES: Record<NonNullable<StatCardProps['accent']>, string> = {
  brand: 'bg-brand-100 text-brand-600',
  success: 'bg-success-bg text-success-text',
  warning: 'bg-warning-bg text-warning-text',
  danger: 'bg-danger-bg text-danger-text',
};

export function StatCard({ icon: Icon, label, value, hint, accent = 'brand', isLoading }: StatCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', ACCENT_STYLES[accent])}>
          <Icon className="h-5 w-5" />
        </div>
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </div>
      <p className="mt-4 text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-900">
        {isLoading ? <span className="inline-block h-7 w-12 animate-pulse rounded bg-slate-200" /> : value}
      </p>
    </Card>
  );
}
