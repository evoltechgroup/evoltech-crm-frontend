import { MainLayout } from '@/components/layout/MainLayout';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { StatusChart } from '@/components/dashboard/StatusChart';
import { mockDashboardStats, mockTasks } from '@/data/mockData';
import { 
  Users, 
  Building2, 
  Handshake, 
  DollarSign, 
  CheckSquare,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';

const Dashboard = () => {
  const stats = mockDashboardStats;
  const todayTasks = mockTasks.filter(
    t => !t.completed && new Date(t.dueDate).toDateString() === new Date().toDateString()
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <MainLayout 
      title="Dashboard" 
      subtitle={`Welcome back! Here's what's happening today, ${format(new Date(), 'EEEE, MMMM d')}`}
    >
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Total Contacts"
          value={stats.totalContacts}
          change="+12% from last month"
          changeType="positive"
          icon={Users}
        />
        <MetricCard
          title="Companies"
          value={stats.totalCompanies}
          change="+3 new this week"
          changeType="positive"
          icon={Building2}
          iconColor="text-accent"
        />
        <MetricCard
          title="Open Deals"
          value={stats.totalDeals}
          icon={Handshake}
          iconColor="text-warning"
        />
        <MetricCard
          title="Pipeline Value"
          value={formatCurrency(stats.totalDealValue)}
          change="+25% from last month"
          changeType="positive"
          icon={DollarSign}
          iconColor="text-success"
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <StatusChart
          title="Leads by Status"
          data={stats.leadsByStatus}
          type="leads"
        />
        <StatusChart
          title="Deals by Stage"
          data={stats.dealsByStage}
          type="deals"
        />
        <ActivityFeed activities={stats.recentActivities} />
      </div>

      {/* Tasks Due Today */}
      <div className="bg-card rounded-xl border shadow-sm">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Tasks Due Today</h3>
          </div>
          <span className="text-sm text-muted-foreground">{todayTasks.length} tasks</span>
        </div>
        <div className="divide-y">
          {todayTasks.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No tasks due today. Great job staying on top of things!</p>
            </div>
          ) : (
            todayTasks.map((task) => (
              <div key={task.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${
                    task.type === 'call' ? 'bg-info' :
                    task.type === 'email' ? 'bg-accent' :
                    'bg-warning'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{task.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">{task.type}</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                  Due Today
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
