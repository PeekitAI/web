import { FileCode, Play, Clock, CheckCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const stats = [
  {
    label: 'Job Templates',
    value: '12',
    change: '+2',
    trend: 'up',
    icon: FileCode,
  },
  {
    label: 'Running Jobs',
    value: '5',
    change: '+3',
    trend: 'up',
    icon: Play,
  },
  {
    label: 'Active CronJobs',
    value: '8',
    change: '+1',
    trend: 'up',
    icon: Clock,
  },
  {
    label: 'Completed Today',
    value: '47',
    change: '+12',
    trend: 'up',
    icon: CheckCircle,
  },
];

export default function DashboardPage() {
  return (
    <div className="min-h-full bg-background">
      <div className="max-w-[1200px] mx-auto px-8 py-12">
        <div className="mb-12">
          <h1 className="text-[22px] font-semibold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-[13px] text-muted-foreground mt-1.5">Monitor and manage your crawling jobs and templates.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const TrendIcon = stat.trend === 'up' ? ArrowUpRight : ArrowDownRight;
            return (
              <div
                key={stat.label}
                className="bg-card border border-border p-5 rounded-lg hover:border-primary/20 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <Icon className="w-5 h-5 text-primary" />
                  <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                    <TrendIcon className="w-3 h-3" />
                    {stat.change}
                  </div>
                </div>
                <h3 className="text-[28px] font-semibold text-foreground mb-1.5 tracking-tight">{stat.value}</h3>
                <p className="text-[12px] text-muted-foreground font-medium">{stat.label}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-card border border-border p-6 rounded-lg">
            <h2 className="text-[14px] font-semibold text-foreground mb-6">Recent Jobs</h2>
            <div className="space-y-4">
              {[
                { name: 'Website Crawl - example.com', status: 'Completed', time: '5 min ago' },
                { name: 'Content Extraction - blog.site', status: 'Running', time: '12 min ago' },
                { name: 'Data Sync - api.service', status: 'Completed', time: '1 hour ago' },
                { name: 'Full Site Crawl - docs.app', status: 'Failed', time: '2 hours ago' },
              ].map((job, i) => (
                <div key={i} className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
                  <div className={`w-1.5 h-1.5 rounded-full mt-2 ${
                    job.status === 'Completed' ? 'bg-primary' :
                    job.status === 'Running' ? 'bg-primary animate-pulse' :
                    'bg-muted-foreground'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-foreground truncate">{job.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[11px] font-medium ${
                        job.status === 'Completed' ? 'text-primary' :
                        job.status === 'Running' ? 'text-primary' :
                        'text-muted-foreground'
                      }`}>{job.status}</span>
                      <span className="text-[11px] text-muted-foreground">· {job.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border p-6 rounded-lg">
            <h2 className="text-[14px] font-semibold text-foreground mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'New Template', href: '/templates/new' },
                { label: 'Run Job', href: '/jobs/new' },
                { label: 'Schedule CronJob', href: '/cronjobs/new' },
                { label: 'View Logs', href: '/jobs' },
              ].map((action) => (
                <button
                  key={action.label}
                  className="p-4 border border-border rounded-lg hover:border-primary/30 hover:text-primary transition-colors text-[12px] font-medium text-foreground text-left"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
