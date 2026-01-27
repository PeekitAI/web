import { ArrowLeft, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { getJobTemplates, getConfigMaps, getSecrets } from '@/actions';
import NewJobForm from './new-job-form';

interface NewJobPageProps {
  searchParams: Promise<{
    template?: string;
  }>;
}

export default async function NewJobPage({ searchParams }: NewJobPageProps) {
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
            href="/jobs"
            className="inline-flex items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Jobs
          </Link>
          <h1 className="text-[22px] font-semibold text-foreground tracking-tight">Run New Job</h1>
          <p className="text-[13px] text-muted-foreground mt-1.5">Create a new Kubernetes Job from a template.</p>
        </div>

        <NewJobForm
          templates={templates}
          configmaps={configmaps}
          secrets={secrets}
          preselectedTemplate={preselectedTemplate}
        />
      </div>
    </div>
  );
}
