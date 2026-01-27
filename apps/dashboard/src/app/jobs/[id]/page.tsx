'use client';

import { ArrowLeft, Play, Terminal, RefreshCw, Download, Copy } from 'lucide-react';
import Link from 'next/link';

// Mock job detail data
const jobDetail = {
  id: '1',
  name: 'website-crawl-example-com-20240127',
  template: 'Website Full Crawl',
  namespace: 'crawling-jobs',
  status: 'Running',
  startTime: '2024-01-27T10:30:00Z',
  completionTime: null,
  duration: '12m 34s',
  pods: [
    {
      name: 'website-crawl-example-com-20240127-abc123',
      status: 'Running',
      restarts: 0,
      age: '12m',
    },
  ],
  parameters: {
    url: 'https://example.com',
    depth: '3',
    rate_limit: '100',
  },
  labels: {
    'app': 'crawler',
    'template': 'website-full-crawl',
    'environment': 'production',
  },
};

const logs = `[2024-01-27 10:30:15] Starting crawler job...
[2024-01-27 10:30:16] Initializing connection to https://example.com
[2024-01-27 10:30:17] Rate limit set to 100 requests/second
[2024-01-27 10:30:18] Starting crawl with depth=3
[2024-01-27 10:30:20] Discovered 24 URLs on page 1
[2024-01-27 10:30:25] Processing URL: https://example.com/about
[2024-01-27 10:30:28] Processing URL: https://example.com/contact
[2024-01-27 10:30:32] Discovered 15 URLs on page 2
[2024-01-27 10:30:35] Processing URL: https://example.com/blog
[2024-01-27 10:30:40] Extracted 145 content items
[2024-01-27 10:30:45] Progress: 45% complete (123/275 URLs)
[2024-01-27 10:30:50] Processing URL: https://example.com/docs
[2024-01-27 10:30:55] Discovered 32 URLs on page 3
[2024-01-27 10:31:00] Processing URL: https://example.com/api
[2024-01-27 10:31:05] Rate limit: 98 requests in last second
[2024-01-27 10:31:10] Progress: 67% complete (185/275 URLs)
[2024-01-27 10:31:15] Processing remaining URLs...`;

export default function JobDetailPage() {
  return (
    <div className="min-h-full bg-background">
      <div className="max-w-[1400px] mx-auto px-8 py-8">
        <div className="mb-8">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Jobs
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-[22px] font-semibold text-foreground tracking-tight">{jobDetail.name}</h1>
              <p className="text-[13px] text-muted-foreground mt-1.5">
                Template: {jobDetail.template} · Namespace: {jobDetail.namespace}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-[13px] font-medium">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-[13px] font-medium">
                <Play className="w-4 h-4" />
                Restart Job
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          <div className="bg-card border border-border p-5 rounded-lg">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-[14px] font-semibold text-foreground">{jobDetail.status}</span>
            </div>
          </div>
          <div className="bg-card border border-border p-5 rounded-lg">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">Duration</p>
            <span className="text-[14px] font-semibold text-foreground">{jobDetail.duration}</span>
          </div>
          <div className="bg-card border border-border p-5 rounded-lg">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">Pods</p>
            <span className="text-[14px] font-semibold text-foreground">{jobDetail.pods.length} Running</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <div className="bg-card border border-border p-6 rounded-lg">
            <h2 className="text-[14px] font-semibold text-foreground mb-4">Parameters</h2>
            <div className="space-y-3">
              {Object.entries(jobDetail.parameters).map(([key, value]) => (
                <div key={key} className="flex items-start justify-between">
                  <span className="text-[13px] text-muted-foreground font-medium">{key}</span>
                  <span className="text-[13px] text-foreground font-mono">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border p-6 rounded-lg">
            <h2 className="text-[14px] font-semibold text-foreground mb-4">Labels</h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(jobDetail.labels).map(([key, value]) => (
                <span
                  key={key}
                  className="px-2 py-1 bg-muted rounded text-[11px] font-medium text-foreground"
                >
                  {key}={value}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-lg mb-5">
          <h2 className="text-[14px] font-semibold text-foreground mb-4">Pods</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Pod Name
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Restarts
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Age
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {jobDetail.pods.map((pod) => (
                  <tr key={pod.name} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-[12px] font-mono text-foreground">{pod.name}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-primary">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                        {pod.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-muted-foreground">{pod.restarts}</td>
                    <td className="px-4 py-3 text-[12px] text-muted-foreground">{pod.age}</td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-[12px] text-primary hover:text-primary/80 font-medium">
                        View Logs
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-primary" />
              <h2 className="text-[14px] font-semibold text-foreground">Container Logs</h2>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-1.5 hover:bg-muted rounded transition-colors">
                <RefreshCw className="w-4 h-4 text-muted-foreground" />
              </button>
              <button className="p-1.5 hover:bg-muted rounded transition-colors">
                <Copy className="w-4 h-4 text-muted-foreground" />
              </button>
              <button className="p-1.5 hover:bg-muted rounded transition-colors">
                <Download className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
          <div className="p-6 bg-[#0D1117] overflow-x-auto">
            <pre className="text-[12px] font-mono text-[#C9D1D9] leading-relaxed whitespace-pre-wrap">
              {logs}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
