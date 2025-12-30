import { Activity } from '@/types/crm';
import { mockContacts } from '@/data/mockData';
import { 
  FileText, 
  CheckCircle, 
  TrendingUp, 
  Phone, 
  Mail,
  RefreshCw 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const activityIcons = {
  note: FileText,
  task: CheckCircle,
  deal_update: TrendingUp,
  status_change: RefreshCw,
  email: Mail,
  call: Phone,
};

const activityColors = {
  note: 'bg-info/10 text-info',
  task: 'bg-success/10 text-success',
  deal_update: 'bg-primary/10 text-primary',
  status_change: 'bg-warning/10 text-warning',
  email: 'bg-accent/10 text-accent',
  call: 'bg-muted text-muted-foreground',
};

interface ActivityFeedProps {
  activities: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="bg-card rounded-xl border shadow-sm">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
      </div>
      <div className="divide-y">
        {activities.map((activity) => {
          const Icon = activityIcons[activity.type];
          const contact = mockContacts.find(c => c.id === activity.entityId);
          
          return (
            <div key={activity.id} className="p-4 hover:bg-muted/30 transition-colors">
              <div className="flex gap-3">
                <div className={cn('rounded-lg p-2 h-fit', activityColors[activity.type])}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{activity.description}</p>
                  {contact && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {contact.name}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(activity.createdAt, { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
