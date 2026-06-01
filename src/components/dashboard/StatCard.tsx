import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: number;
  trendText?: string;
  className?: string;
}

export function StatCard({ title, value, icon, trend, trendText, className }: StatCardProps) {
  const isPositive = trend && trend > 0;
  const isNegative = trend && trend < 0;

  return (
    <div className={cn("p-6 bg-card border border-border rounded-xl shadow-sm transition-all hover:shadow-md", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          {icon}
        </div>
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold text-foreground">{value}</p>
        {trend !== undefined && (
          <div className="flex items-center mt-1">
            <span className={cn(
              "text-sm font-medium",
              isPositive ? "text-emerald-500" : isNegative ? "text-red-500" : "text-muted-foreground"
            )}>
              {isPositive ? '↑' : isNegative ? '↓' : ''} {Math.abs(trend)}%
            </span>
            <span className="text-xs text-muted-foreground ml-2">{trendText || 'vs last month'}</span>
          </div>
        )}
      </div>
    </div>
  );
}
