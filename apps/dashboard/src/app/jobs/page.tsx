import { Plus, Terminal, StopCircle, RotateCcw } from 'lucide-react';
import { IconPlaylistAdd } from '@tabler/icons-react';
import Link from 'next/link';
import { getJobs } from '@/actions';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { JobsTable } from './jobs-table';

export default async function JobsPage() {
  const jobs = await getJobs();

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-[1200px] mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-[22px] font-semibold text-foreground tracking-tight">Jobs</h1>
            <p className="text-[13px] text-muted-foreground mt-1.5">View and manage running and completed jobs.</p>
          </div>
          <Link
            href="/jobs/new"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-[13px] font-medium"
          >
            <Plus className="w-4 h-4" />
            Run New Job
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <IconPlaylistAdd />
                </EmptyMedia>
                <EmptyTitle>No Jobs Yet</EmptyTitle>
                <EmptyDescription>
                  You haven't run any jobs yet. Get started by running your first job from a template.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent className="flex-row justify-center gap-2">
                <Button asChild>
                  <Link href="/jobs/new">Run New Job</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/templates">View Templates</Link>
                </Button>
              </EmptyContent>
            </Empty>
          </div>
        ) : (
          <JobsTable jobs={jobs} />
        )}
      </div>
    </div>
  );
}
