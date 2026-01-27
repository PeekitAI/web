'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getJobTemplate, createJobTemplate } from '@/actions/templates';
import type { JobTemplate } from '@/actions/templates';
import EnvironmentVariablesEditor, { type EnvVarEntry } from '@/components/environment-variables-editor';
import { getConfigMaps, getSecrets } from '@/actions';

interface ConfigMap {
  name: string;
  data: Record<string, string>;
}

interface Secret {
  name: string;
  data: Record<string, string>;
}

export default function NewTemplatePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const duplicateFrom = searchParams.get('duplicate');

  const [loading, setLoading] = useState(!!duplicateFrom);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [envVars, setEnvVars] = useState<EnvVarEntry[]>([{ key: '', type: 'value', defaultValue: '', description: '' }]);
  const [configmaps, setConfigmaps] = useState<ConfigMap[]>([]);
  const [secrets, setSecrets] = useState<Secret[]>([]);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');
  const [imagePullPolicy, setImagePullPolicy] = useState('Always');
  const [command, setCommand] = useState('');
  const [args, setArgs] = useState('');
  const [cpuRequest, setCpuRequest] = useState('');
  const [cpuLimit, setCpuLimit] = useState('');
  const [memoryRequest, setMemoryRequest] = useState('');
  const [memoryLimit, setMemoryLimit] = useState('');
  const [completions, setCompletions] = useState<number>(1);
  const [parallelism, setParallelism] = useState<number>(1);
  const [backoffLimit, setBackoffLimit] = useState<number>(3);
  const [ttlSecondsAfterFinished, setTtlSecondsAfterFinished] = useState<number | undefined>(undefined);

  // Fetch configmaps and secrets on mount
  useEffect(() => {
    Promise.all([getConfigMaps(), getSecrets()])
      .then(([cms, secs]) => {
        setConfigmaps(cms);
        setSecrets(secs);
      })
      .catch((error) => {
        console.error('Error loading configmaps/secrets:', error);
      });
  }, []);

  useEffect(() => {
    if (duplicateFrom) {
      getJobTemplate(duplicateFrom)
        .then((template) => {
          // Populate all form fields
          setName(duplicateFrom ? `${template.data.name}-copy` : template.data.name || '');
          setDescription(template.data.description || '');
          setCategory(template.data.category || '');
          setImage(template.data.image || '');
          setImagePullPolicy(template.data.imagePullPolicy || 'Always');
          setCommand(template.data.command ? JSON.stringify(template.data.command) : '');
          setArgs(template.data.args ? JSON.stringify(template.data.args) : '');
          setCpuRequest(template.data.resources?.cpuRequest || '');
          setCpuLimit(template.data.resources?.cpuLimit || '');
          setMemoryRequest(template.data.resources?.memoryRequest || '');
          setMemoryLimit(template.data.resources?.memoryLimit || '');
          setCompletions(template.data.jobSettings?.completions || 1);
          setParallelism(template.data.jobSettings?.parallelism || 1);
          setBackoffLimit(template.data.jobSettings?.backoffLimit || 3);
          setTtlSecondsAfterFinished(template.data.jobSettings?.ttlSecondsAfterFinished);

          const vars: EnvVarEntry[] = [];

          // Add regular variables
          if (template.data.variables && template.data.variables.length > 0) {
            template.data.variables.forEach(v => {
              vars.push({
                key: v.key,
                type: 'value',
                defaultValue: v.defaultValue || '',
                description: v.description || ''
              });
            });
          }

          // Add volume mounts as envVar entries
          if (template.data.volumeMounts && template.data.volumeMounts.length > 0) {
            template.data.volumeMounts.forEach(m => {
              vars.push({
                key: m.name,
                type: m.sourceType,
                mountAsFile: true,
                // Store in configMapName or secretName depending on type
                ...(m.sourceType === 'configMap' ? { configMapName: m.sourceName } : { secretName: m.sourceName }),
                // Store mountPath in value field
                value: m.mountPath,
                subPath: m.subPath || '',
                defaultValue: '',
                description: ''
              });
            });
          }

          if (vars.length > 0) {
            setEnvVars(vars);
          }

          setLoading(false);
        })
        .catch((error) => {
          console.error('Error loading template:', error);
          setLoading(false);
        });
    }
  }, [duplicateFrom]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Separate envVars into variables and volumeMounts
    const variables = envVars
      .filter(v => !v.mountAsFile && v.key)
      .map(v => ({
        key: v.key,
        defaultValue: v.defaultValue,
        description: v.description,
      }));

    const volumeMounts = envVars
      .filter(v => v.mountAsFile && v.key)
      .map(v => {
        // Get the source name from configMapName or secretName depending on type
        const sourceName = v.type === 'configMap' ? v.configMapName : v.secretName;
        // Get mount path from value field
        const mountPath = v.value;

        if (!sourceName || !mountPath) return null;

        return {
          name: v.key,
          mountPath: mountPath,
          sourceType: v.type as 'configMap' | 'secret',
          sourceName: sourceName,
          ...(v.subPath && { subPath: v.subPath }),
        };
      })
      .filter((v): v is NonNullable<typeof v> => v !== null);

    // Parse command and args from JSON strings
    let parsedCommand: string[] | undefined = undefined;
    let parsedArgs: string[] | undefined = undefined;

    if (command.trim()) {
      try {
        parsedCommand = JSON.parse(command);
      } catch {
        setError('Command must be a valid JSON array');
        return;
      }
    }

    if (args.trim()) {
      try {
        parsedArgs = JSON.parse(args);
      } catch {
        setError('Args must be a valid JSON array');
        return;
      }
    }

    const template: JobTemplate = {
      name,
      description,
      category,
      image,
      imagePullPolicy,
      ...(parsedCommand && { command: parsedCommand }),
      ...(parsedArgs && { args: parsedArgs }),
      variables,
      resources: {
        cpuRequest: cpuRequest || undefined,
        cpuLimit: cpuLimit || undefined,
        memoryRequest: memoryRequest || undefined,
        memoryLimit: memoryLimit || undefined,
      },
      jobSettings: {
        completions,
        parallelism,
        backoffLimit,
        ttlSecondsAfterFinished,
      },
      ...(volumeMounts.length > 0 && { volumeMounts }),
    };

    startTransition(async () => {
      const result = await createJobTemplate(template);
      if (result.success) {
        router.push('/templates');
      } else {
        setError(result.error || 'Failed to create template');
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-full bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground mt-2">Loading template...</p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-[22px] font-semibold text-foreground tracking-tight">
            {duplicateFrom ? `Duplicate Template: ${duplicateFrom}` : 'Create Job Template'}
          </h1>
          <p className="text-[13px] text-muted-foreground mt-1.5">Define a reusable template for creating Kubernetes Jobs.</p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-[13px] text-destructive">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Template Information */}
          <div className="bg-card border border-border p-6 rounded-lg">
            <h2 className="text-[14px] font-semibold text-foreground mb-4">Template Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[12px] text-muted-foreground mb-2 block">Template Name</label>
                <input
                  type="text"
                  placeholder="Website Full Crawl"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors"
                />
                <p className="text-[11px] text-muted-foreground mt-1">A descriptive name for this template</p>
              </div>
              <div>
                <label className="text-[12px] text-muted-foreground mb-2 block">Description</label>
                <textarea
                  placeholder="Crawls an entire website and extracts all content..."
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>
              <div>
                <label className="text-[12px] text-muted-foreground mb-2 block">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="">Select a category...</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Advertising">Advertising</option>
                  <option value="crawling">Web Crawling</option>
                  <option value="extraction">Content Extraction</option>
                  <option value="sync">Data Sync</option>
                  <option value="processing">Data Processing</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Container Configuration */}
          <div className="bg-card border border-border p-6 rounded-lg">
            <h2 className="text-[14px] font-semibold text-foreground mb-4">Container Configuration</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[12px] text-muted-foreground mb-2 block">Container Image</label>
                <input
                  type="text"
                  placeholder="ghcr.io/org/crawler:latest"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors font-mono"
                />
                <p className="text-[11px] text-muted-foreground mt-1">Use variables like {'{version}'} for dynamic values</p>
              </div>
              <div>
                <label className="text-[12px] text-muted-foreground mb-2 block">Image Pull Policy</label>
                <select
                  value={imagePullPolicy}
                  onChange={(e) => setImagePullPolicy(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="Always">Always</option>
                  <option value="IfNotPresent">IfNotPresent</option>
                  <option value="Never">Never</option>
                </select>
              </div>
              <div>
                <label className="text-[12px] text-muted-foreground mb-2 block">Command (Optional)</label>
                <input
                  type="text"
                  placeholder='["/bin/crawler"]'
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors font-mono"
                />
                <p className="text-[11px] text-muted-foreground mt-1">JSON array format</p>
              </div>
              <div>
                <label className="text-[12px] text-muted-foreground mb-2 block">Args (Optional)</label>
                <input
                  type="text"
                  placeholder='["--verbose", "--output=/data"]'
                  value={args}
                  onChange={(e) => setArgs(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors font-mono"
                />
                <p className="text-[11px] text-muted-foreground mt-1">JSON array format, supports variables like {'{url}'}</p>
              </div>
            </div>
          </div>

          {/* EnvVars and Configs */}
          <EnvironmentVariablesEditor
            envVars={envVars}
            setEnvVars={setEnvVars}
            configmaps={configmaps}
            secrets={secrets}
            isTemplateEditor={true}
          />

          {/* Default Resource Limits */}
          <div className="bg-card border border-border p-6 rounded-lg">
            <h2 className="text-[14px] font-semibold text-foreground mb-4">Default Resource Limits</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[12px] text-muted-foreground mb-2 block">CPU Request</label>
                <input
                  type="text"
                  placeholder="100m"
                  value={cpuRequest}
                  onChange={(e) => setCpuRequest(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors font-mono"
                />
              </div>
              <div>
                <label className="text-[12px] text-muted-foreground mb-2 block">CPU Limit</label>
                <input
                  type="text"
                  placeholder="1000m"
                  value={cpuLimit}
                  onChange={(e) => setCpuLimit(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors font-mono"
                />
              </div>
              <div>
                <label className="text-[12px] text-muted-foreground mb-2 block">Memory Request</label>
                <input
                  type="text"
                  placeholder="128Mi"
                  value={memoryRequest}
                  onChange={(e) => setMemoryRequest(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors font-mono"
                />
              </div>
              <div>
                <label className="text-[12px] text-muted-foreground mb-2 block">Memory Limit</label>
                <input
                  type="text"
                  placeholder="512Mi"
                  value={memoryLimit}
                  onChange={(e) => setMemoryLimit(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors font-mono"
                />
              </div>
            </div>
          </div>

          {/* Default Job Settings */}
          <div className="bg-card border border-border p-6 rounded-lg">
            <h2 className="text-[14px] font-semibold text-foreground mb-4">Default Job Settings</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[12px] text-muted-foreground mb-2 block">Completions</label>
                <input
                  type="number"
                  value={completions}
                  onChange={(e) => setCompletions(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="text-[12px] text-muted-foreground mb-2 block">Parallelism</label>
                <input
                  type="number"
                  value={parallelism}
                  onChange={(e) => setParallelism(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="text-[12px] text-muted-foreground mb-2 block">Backoff Limit</label>
                <input
                  type="number"
                  value={backoffLimit}
                  onChange={(e) => setBackoffLimit(parseInt(e.target.value) || 3)}
                  className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="text-[12px] text-muted-foreground mb-2 block">TTL After Finished (seconds)</label>
                <input
                  type="number"
                  placeholder="3600"
                  value={ttlSecondsAfterFinished || ''}
                  onChange={(e) => setTtlSecondsAfterFinished(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Link
              href="/templates"
              className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-[13px] font-medium"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-[13px] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Creating...' : 'Create Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
