import { Plus, Eye, Pause, Play, Trash, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import { getCronJobs } from '@/actions';

function formatTimeAgo(date?: Date) {
  if (!date) return '-';
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'just now';
}

export default async function CronJobsPage() {
  const cronjobs = await getCronJobs();
  return (
    <div className="min-h-full bg-background">
      <div className="max-w-[1200px] mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-[22px] font-semibold text-foreground tracking-tight">CronJobs</h1>
            <p className="text-[13px] text-muted-foreground mt-1.5">Schedule and manage recurring Kubernetes Jobs.</p>
          </div>
          <Link
            href="/cronjobs/new"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-[13px] font-medium"
          >
            <Plus className="w-4 h-4" />
            New CronJob
          </Link>
        </div>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Name / Namespace
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Template
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Active Jobs
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Last Scheduled
                  </th>
                  <th className="px-6 py-3 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {cronjobs.map((cronjob) => (
                  <tr key={cronjob.name} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <span className="text-[13px] font-medium text-foreground font-mono">{cronjob.name}</span>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{cronjob.namespace}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[12px] text-muted-foreground">{cronjob.template || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[12px] text-foreground font-mono">{cronjob.schedule}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium ${
                          !cronjob.suspend
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {!cronjob.suspend && <div className="w-1.5 h-1.5 bg-primary rounded-full" />}
                        {cronjob.suspend ? 'Suspended' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[12px] text-muted-foreground font-mono">{cronjob.active}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="text-[12px] text-muted-foreground">
                          {formatTimeAgo(cronjob.lastScheduleTime)}
                        </span>
                        {cronjob.lastSuccessfulTime && (
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Last successful: {formatTimeAgo(cronjob.lastSuccessfulTime)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 hover:bg-muted rounded transition-colors">
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button className="p-1.5 hover:bg-muted rounded transition-colors">
                          <PlayCircle className="w-4 h-4 text-muted-foreground" />
                        </button>
                        {!cronjob.suspend ? (
                          <button className="p-1.5 hover:bg-muted rounded transition-colors">
                            <Pause className="w-4 h-4 text-muted-foreground" />
                          </button>
                        ) : (
                          <button className="p-1.5 hover:bg-muted rounded transition-colors">
                            <Play className="w-4 h-4 text-muted-foreground" />
                          </button>
                        )}
                        <button className="p-1.5 hover:bg-muted rounded transition-colors">
                          <Trash className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
