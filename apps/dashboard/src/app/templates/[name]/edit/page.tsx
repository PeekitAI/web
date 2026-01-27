import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getJobTemplate, getConfigMaps, getSecrets } from '@/actions';
import { notFound } from 'next/navigation';
import EditTemplateForm from './edit-template-form';

interface EditTemplatePageProps {
  params: Promise<{
    name: string;
  }>;
}

export default async function EditTemplatePage({ params }: EditTemplatePageProps) {
  const { name } = await params;

  let template;
  try {
    template = await getJobTemplate(name);
  } catch (error) {
    notFound();
  }

  const [configmaps, secrets] = await Promise.all([
    getConfigMaps(),
    getSecrets(),
  ]);

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-[900px] mx-auto px-8 py-12">
        <div className="mb-8">
          <Link
            href="/templates"
            className="inline-flex items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Templates
          </Link>
          <h1 className="text-[22px] font-semibold text-foreground tracking-tight">Edit Template</h1>
          <p className="text-[13px] text-muted-foreground mt-1.5">
            Update the job template configuration.
          </p>
        </div>

        <EditTemplateForm template={template} configmaps={configmaps} secrets={secrets} />
      </div>
    </div>
  );
}
