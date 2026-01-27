import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getJobTemplates, getConfigMaps, getSecrets } from '@/actions';
import NewCronJobForm from './new-cronjob-form';

interface NewCronJobPageProps {
  searchParams: Promise<{
    template?: string;
  }>;
}

export default async function NewCronJobPage({ searchParams }: NewCronJobPageProps) {
  const [templates, configmaps, secrets] = await Promise.all([
    getJobTemplates(),
    getConfigMaps(),
    getSecrets(),
  ]);
  const { template: preselectedTemplate } = await searchParams;

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-[900px] mx-auto px-8 py-12">
        <div className="mb-8">
          <Link
            href="/cronjobs"
            className="inline-flex items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to CronJobs
          </Link>
          <h1 className="text-[22px] font-semibold text-foreground tracking-tight">Create New CronJob</h1>
          <p className="text-[13px] text-muted-foreground mt-1.5">Schedule a recurring Kubernetes Job from a template.</p>
        </div>

        <NewCronJobForm
          templates={templates}
          configmaps={configmaps}
          secrets={secrets}
          preselectedTemplate={preselectedTemplate}
        />
      </div>
    </div>
  );
}
