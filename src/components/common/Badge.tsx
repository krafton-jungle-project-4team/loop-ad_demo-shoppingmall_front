import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

type BadgeTone = 'blue' | 'green' | 'amber' | 'rose' | 'slate';

const toneClassName: Record<BadgeTone, string> = {
  blue: 'bg-loop-50 text-loop-700 ring-loop-100',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  amber: 'bg-amber-50 text-amber-700 ring-amber-100',
  rose: 'bg-rose-50 text-rose-700 ring-rose-100',
  slate: 'bg-slate-100 text-slate-700 ring-slate-200',
};

type BadgeProps = {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
};

export function Badge({ children, tone = 'blue', className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ring-1', toneClassName[tone], className)}>
      {children}
    </span>
  );
}
