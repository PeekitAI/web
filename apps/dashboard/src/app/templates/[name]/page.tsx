import { ArrowLeft, Play, Clock, Edit, Trash, Copy } from 'lucide-react';
import Link from 'next/link';
import { getJobTemplate } from '@/actions';
import { notFound } from 'next/navigation';

interface TemplateDetailPageProps {
  params: Promise<{
    name: string;
  }>;
}

export default async function TemplateDetailPage({ params }: TemplateDetailPageProps) {
  const { name } = await params;

  let template;
  try {
    template = await getJobTemplate(name);
  } catch (error) {
    notFound();
  }

  const categoryColors = {
    'Social Media': 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200/50 dark:border-blue-500/30',
    'Advertising': 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200/50 dark:border-purple-500/30',
  } as const;

  const categoryColor = categoryColors[template.data.category as keyof typeof categoryColors] ||
    'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-200/50 dark:border-gray-500/30';

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-[1000px] mx-auto px-8 py-12">
        <div className="mb-8">
          <Link
            href="/templates"
            className="inline-flex items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Templates
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-[24px] font-bold text-foreground font-mono tracking-tight">{template.name}</h1>
              <p className="text-[14px] text-muted-foreground mt-2">{template.data.description}</p>
              <div className="flex items-center gap-3 mt-4">
                <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-[12px] font-medium border ${categoryColor}`}>
                  {template.data.category}
                </span>
                <span className="text-[13px] text-muted-foreground">
                  Created {template.created ? new Date(template.created).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  }) : 'N/A'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/jobs/new?template=${template.name}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-[13px] font-medium"
              >
                <Play className="w-4 h-4" />
                Run Job
              </Link>
              <Link
                href={`/cronjobs/new?template=${template.name}`}
                className="inline-flex items-center gap-2 px-4 py-2 border border-border bg-background rounded-lg hover:bg-muted transition-colors text-[13px] font-medium"
              >
                <Clock className="w-4 h-4" />
                Schedule
              </Link>
              <Link
                href={`/templates/${template.name}/edit`}
                className="inline-flex items-center gap-2 px-4 py-2 border border-border bg-background rounded-lg hover:bg-muted transition-colors text-[13px] font-medium"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Container Configuration */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-[16px] font-semibold text-foreground mb-4">Container Configuration</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[12px] text-muted-foreground font-medium block mb-1">Image</label>
                <code className="text-[13px] text-foreground bg-muted/30 px-3 py-2 rounded-lg block font-mono break-all">
                  {template.data.image}
                </code>
              </div>
              <div>
                <label className="text-[12px] text-muted-foreground font-medium block mb-1">Image Pull Policy</label>
                <code className="text-[13px] text-foreground bg-muted/30 px-3 py-2 rounded-lg block font-mono">
                  {template.data.imagePullPolicy}
                </code>
              </div>
              {template.data.command && template.data.command.length > 0 && (
                <div>
                  <label className="text-[12px] text-muted-foreground font-medium block mb-1">Command</label>
                  <code className="text-[13px] text-foreground bg-muted/30 px-3 py-2 rounded-lg block font-mono">
                    {template.data.command.join(' ')}
                  </code>
                </div>
              )}
              {template.data.args && template.data.args.length > 0 && (
                <div>
                  <label className="text-[12px] text-muted-foreground font-medium block mb-1">Arguments</label>
                  <code className="text-[13px] text-foreground bg-muted/30 px-3 py-2 rounded-lg block font-mono">
                    {template.data.args.join(' ')}
                  </code>
                </div>
              )}
            </div>
          </div>

          {/* Template Variables */}
          {template.data.variables && template.data.variables.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h2 className="text-[16px] font-semibold text-foreground mb-4">
                Template Variables
                <span className="ml-2 text-[13px] text-muted-foreground font-normal">
                  ({template.data.variables.length})
                </span>
              </h2>
              <div className="space-y-3">
                {template.data.variables.map((variable, index) => (
                  <div key={index} className="border border-border rounded-lg p-4 bg-muted/20">
                    <div className="flex items-start justify-between mb-2">
                      <code className="text-[14px] font-semibold text-foreground font-mono">
                        {variable.key}
                      </code>
                      {variable.defaultValue && (
                        <span className="text-[12px] text-muted-foreground bg-muted px-2 py-1 rounded">
                          Default: <code className="font-mono">{variable.defaultValue}</code>
                        </span>
                      )}
                    </div>
                    {variable.description && (
                      <p className="text-[13px] text-muted-foreground mt-1">
                        {variable.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Configs and Secrets */}
          {template.data.volumeMounts && template.data.volumeMounts.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h2 className="text-[16px] font-semibold text-foreground mb-4">
                Configs and Secrets
                <span className="ml-2 text-[13px] text-muted-foreground font-normal">
                  ({template.data.volumeMounts.length})
                </span>
              </h2>
              <div className="space-y-4">
                {template.data.volumeMounts.map((mount, index) => (
                  <div key={index} className="space-y-2 p-3 border border-border rounded-lg">
                    <div className="flex gap-2 items-start">
                      <div className="flex-1">
                        <label className="text-[11px] text-muted-foreground mb-1 block">Mount Name</label>
                        <code className="text-[13px] text-foreground font-mono bg-muted/30 px-3 py-2 rounded-lg block">
                          {mount.name}
                        </code>
                      </div>
                      <div className="w-48">
                        <label className="text-[11px] text-muted-foreground mb-1 block">Type</label>
                        <span className="text-[13px] text-foreground bg-muted/30 px-3 py-2 rounded-lg block capitalize">
                          {mount.sourceType}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] text-muted-foreground mb-1 block">
                        {mount.sourceType === 'secret' ? 'Secret Name' : 'ConfigMap Name'}
                      </label>
                      <code className="text-[13px] text-foreground font-mono bg-muted/30 px-3 py-2 rounded-lg block">
                        {mount.sourceName}
                      </code>
                    </div>
                    <div>
                      <label className="text-[11px] text-muted-foreground mb-1 block">Mount Path</label>
                      <code className="text-[13px] text-foreground font-mono bg-muted/30 px-3 py-2 rounded-lg block">
                        {mount.mountPath}
                      </code>
                    </div>
                    {mount.subPath && (
                      <div>
                        <label className="text-[11px] text-muted-foreground mb-1 block">Subpath</label>
                        <code className="text-[13px] text-foreground font-mono bg-muted/30 px-3 py-2 rounded-lg block">
                          {mount.subPath}
                        </code>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resource Limits */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-[16px] font-semibold text-foreground mb-4">Resource Limits</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-[13px] font-medium text-foreground mb-3">CPU</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] text-muted-foreground">Request</span>
                    <code className="text-[13px] text-foreground bg-muted/30 px-2 py-1 rounded font-mono">
                      {template.data.resources.cpuRequest || 'Not set'}
                    </code>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] text-muted-foreground">Limit</span>
                    <code className="text-[13px] text-foreground bg-muted/30 px-2 py-1 rounded font-mono">
                      {template.data.resources.cpuLimit || 'Not set'}
                    </code>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-[13px] font-medium text-foreground mb-3">Memory</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] text-muted-foreground">Request</span>
                    <code className="text-[13px] text-foreground bg-muted/30 px-2 py-1 rounded font-mono">
                      {template.data.resources.memoryRequest || 'Not set'}
                    </code>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] text-muted-foreground">Limit</span>
                    <code className="text-[13px] text-foreground bg-muted/30 px-2 py-1 rounded font-mono">
                      {template.data.resources.memoryLimit || 'Not set'}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Job Settings */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-[16px] font-semibold text-foreground mb-4">Job Settings</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-muted-foreground">Completions</span>
                <code className="text-[13px] text-foreground bg-muted/30 px-2 py-1 rounded font-mono">
                  {template.data.jobSettings.completions || 'Not set'}
                </code>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-muted-foreground">Parallelism</span>
                <code className="text-[13px] text-foreground bg-muted/30 px-2 py-1 rounded font-mono">
                  {template.data.jobSettings.parallelism || 'Not set'}
                </code>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-muted-foreground">Backoff Limit</span>
                <code className="text-[13px] text-foreground bg-muted/30 px-2 py-1 rounded font-mono">
                  {template.data.jobSettings.backoffLimit || 'Not set'}
                </code>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-muted-foreground">TTL After Finished</span>
                <code className="text-[13px] text-foreground bg-muted/30 px-2 py-1 rounded font-mono">
                  {template.data.jobSettings.ttlSecondsAfterFinished ?
                    `${template.data.jobSettings.ttlSecondsAfterFinished}s` : 'Not set'}
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
