'use client';

import { useState, useMemo } from 'react';
import { Terminal, StopCircle, RotateCcw, Filter } from 'lucide-react';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Job {
  name: string;
  namespace: string;
  status: string;
  startTime?: Date;
  completionTime?: Date;
  active: number;
  succeeded: number;
  failed: number;
  template: string;
  category: string;
}

interface JobsTableProps {
  jobs: Job[];
}

function formatDuration(startTime?: Date, completionTime?: Date, status?: string) {
  if (!startTime) return '-';

  // For completed or failed jobs without completion time, return '-'
  if (!completionTime && status !== 'Running') return '-';

  // Use completionTime if available, otherwise use current time (only for Running jobs)
  const end = completionTime || new Date();
  const diff = end.getTime() - new Date(startTime).getTime();
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

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

export function JobsTable({ jobs }: JobsTableProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(jobs.map(job => job.category).filter(Boolean)));
    return uniqueCategories.sort();
  }, [jobs]);

  // Filter jobs by category
  const filteredJobs = useMemo(() => {
    if (selectedCategory === 'all') {
      return jobs;
    }
    return jobs.filter(job => job.category === selectedCategory);
  }, [jobs, selectedCategory]);

  return (
    <div className="space-y-4">
      {/* Filter Section */}
      {categories.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-[13px] text-muted-foreground font-medium">Filter by category:</span>
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedCategory !== 'all' && (
            <span className="text-[12px] text-muted-foreground">
              Showing {filteredJobs.length} of {jobs.length} jobs
            </span>
          )}
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Job Name / Namespace
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Template
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Pods
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredJobs.map((job) => {
                const progress = job.status === 'Completed' ? 100 : job.status === 'Running' ? 50 : 0;
                const totalPods = (job.active || 0) + (job.succeeded || 0) + (job.failed || 0);
                const activePods = job.active || 0;

                return (
                  <tr key={job.name} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <Link href={`/jobs/${job.name}`} className="text-[13px] font-medium text-foreground hover:text-primary font-mono">
                          {job.name}
                        </Link>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {job.namespace} · Started {formatTimeAgo(job.startTime)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[12px] text-muted-foreground">{job.template || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      {job.category ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-[11px] font-medium">
                          {job.category}
                        </span>
                      ) : (
                        <span className="text-[12px] text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium ${
                          job.status === 'Running'
                            ? 'bg-primary/10 text-primary'
                            : job.status === 'Completed'
                            ? 'bg-muted text-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {job.status === 'Running' && <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />}
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[12px] text-muted-foreground font-mono">
                        {activePods}/{totalPods || 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden min-w-[60px]">
                          <div
                            className={`h-full ${
                              job.status === 'Completed' ? 'bg-primary' :
                              job.status === 'Running' ? 'bg-primary' :
                              'bg-muted-foreground'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-muted-foreground w-8">{progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[12px] text-muted-foreground">
                        {formatDuration(job.startTime, job.completionTime, job.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/jobs/${job.name}`} className="p-1.5 hover:bg-muted rounded transition-colors">
                          <Terminal className="w-4 h-4 text-muted-foreground" />
                        </Link>
                        {job.status === 'Running' && (
                          <button className="p-1.5 hover:bg-muted rounded transition-colors">
                            <StopCircle className="w-4 h-4 text-muted-foreground" />
                          </button>
                        )}
                        {job.status === 'Failed' && (
                          <button className="p-1.5 hover:bg-muted rounded transition-colors">
                            <RotateCcw className="w-4 h-4 text-muted-foreground" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
