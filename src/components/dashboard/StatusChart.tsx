import { LeadStatus, DealStage } from '@/types/crm';
import { cn } from '@/lib/utils';

interface StatusChartProps {
  title: string;
  data: Record<string, number>;
  type: 'leads' | 'deals';
}

const leadStatusLabels: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  won: 'Won',
  lost: 'Lost',
};

const dealStageLabels: Record<DealStage, string> = {
  lead: 'Lead',
  qualified: 'Qualified',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  closed_won: 'Won',
  closed_lost: 'Lost',
};

const leadStatusColors: Record<LeadStatus, string> = {
  new: 'bg-primary',
  contacted: 'bg-info',
  qualified: 'bg-warning',
  won: 'bg-success',
  lost: 'bg-destructive',
};

const dealStageColors: Record<DealStage, string> = {
  lead: 'bg-muted-foreground',
  qualified: 'bg-info',
  proposal: 'bg-primary',
  negotiation: 'bg-warning',
  closed_won: 'bg-success',
  closed_lost: 'bg-destructive',
};

export function StatusChart({ title, data, type }: StatusChartProps) {
  const labels = type === 'leads' ? leadStatusLabels : dealStageLabels;
  const colors = type === 'leads' ? leadStatusColors : dealStageColors;
  const total = Object.values(data).reduce((sum, count) => sum + count, 0);

  return (
    <div className="bg-card rounded-xl border shadow-sm p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      <div className="space-y-3">
        {Object.entries(data).map(([key, value]) => {
          const percentage = total > 0 ? (value / total) * 100 : 0;
          return (
            <div key={key}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">
                  {labels[key as keyof typeof labels]}
                </span>
                <span className="font-medium text-foreground">{value}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all duration-500', colors[key as keyof typeof colors])}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
