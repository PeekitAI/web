'use client';

import Link from 'next/link';
import { useState, useTransition, useEffect } from 'react';
import { updateJobTemplate, type JobTemplate } from '@/actions/templates';
import { useRouter } from 'next/navigation';
import EnvironmentVariablesEditor, { type EnvVarEntry } from '@/components/environment-variables-editor';

interface Template {
  name: string;
  data: JobTemplate;
  created?: string;
}

interface ConfigMap {
  name: string;
  data: Record<string, string>;
}

interface Secret {
  name: string;
  data: Record<string, string>;
}

interface EditTemplateFormProps {
  template: Template;
  configmaps: ConfigMap[];
  secrets: Secret[];
}

export default function EditTemplateForm({ template, configmaps, secrets }: EditTemplateFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<JobTemplate>(template.data);
  const [envVars, setEnvVars] = useState<EnvVarEntry[]>([]);

  // Initialize envVars from template data on mount
  useEffect(() => {
    const vars: EnvVarEntry[] = [];

    // Add regular variables
    if (template.data.variables) {
      template.data.variables.forEach(v => {
        vars.push({
          key: v.key,
          defaultValue: v.defaultValue,
          description: v.description,
          type: 'value',
        });
      });
    }

    // Add volume mounts as envVar entries
    if (template.data.volumeMounts) {
      template.data.volumeMounts.forEach(m => {
        vars.push({
          key: m.name,
          defaultValue: '',
          description: '',
          type: m.sourceType,
          mountAsFile: true,
          // Store in configMapName or secretName depending on type
          ...(m.sourceType === 'configMap' ? { configMapName: m.sourceName } : { secretName: m.sourceName }),
          // Store mountPath in value field
          value: m.mountPath,
          subPath: m.subPath,
        });
      });
    }

    if (vars.length === 0) {
      vars.push({ key: '', type: 'value', defaultValue: '', description: '' });
    }

    setEnvVars(vars);
  }, [template]);

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

    const updatedTemplate: JobTemplate = {
      ...formData,
      variables,
      ...(volumeMounts.length > 0 && { volumeMounts }),
    };

    startTransition(async () => {
      const result = await updateJobTemplate(template.name, updatedTemplate);
      if (result.success) {
        router.push('/templates');
      } else {
        setError(result.error || 'Failed to update template');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-[13px] text-destructive">{error}</p>
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-card border border-border p-6 rounded-lg space-y-4">
        <h2 className="text-[14px] font-semibold text-foreground">Basic Information</h2>

        <div>
          <label className="text-[12px] text-muted-foreground mb-2 block">Template Name</label>
          <input
            type="text"
            value={formData.name}
            disabled
            className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-muted/30 cursor-not-allowed font-mono"
          />
          <p className="text-[11px] text-muted-foreground mt-1">Template name cannot be changed</p>
        </div>

        <div>
          <label className="text-[12px] text-muted-foreground mb-2 block">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors resize-none"
          />
        </div>

        <div>
          <label className="text-[12px] text-muted-foreground mb-2 block">Category</label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Container Configuration */}
      <div className="bg-card border border-border p-6 rounded-lg space-y-4">
        <h2 className="text-[14px] font-semibold text-foreground">Container Configuration</h2>

        <div>
          <label className="text-[12px] text-muted-foreground mb-2 block">Image</label>
          <input
            type="text"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors font-mono"
          />
        </div>

        <div>
          <label className="text-[12px] text-muted-foreground mb-2 block">Image Pull Policy</label>
          <select
            value={formData.imagePullPolicy}
            onChange={(e) => setFormData({ ...formData, imagePullPolicy: e.target.value })}
            className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors"
          >
            <option value="Always">Always</option>
            <option value="IfNotPresent">IfNotPresent</option>
            <option value="Never">Never</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[12px] text-muted-foreground mb-2 block">Command</label>
            <input
              type="text"
              value={formData.command?.join(' ') || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  command: e.target.value ? e.target.value.split(' ') : undefined,
                })
              }
              placeholder="python"
              className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors font-mono"
            />
          </div>

          <div>
            <label className="text-[12px] text-muted-foreground mb-2 block">Args</label>
            <input
              type="text"
              value={formData.args?.join(' ') || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  args: e.target.value ? e.target.value.split(' ') : undefined,
                })
              }
              placeholder="main_scraper.py"
              className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors font-mono"
            />
          </div>
        </div>
      </div>

      {/* Environment Variables and Configs */}
      <EnvironmentVariablesEditor
        envVars={envVars}
        setEnvVars={setEnvVars}
        configmaps={configmaps}
        secrets={secrets}
        isTemplateEditor={true}
      />

      {/* Resource Limits */}
      <div className="bg-card border border-border p-6 rounded-lg space-y-4">
        <h2 className="text-[14px] font-semibold text-foreground">Resource Limits</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[12px] text-muted-foreground mb-2 block">CPU Request</label>
            <input
              type="text"
              value={formData.resources.cpuRequest || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  resources: { ...formData.resources, cpuRequest: e.target.value },
                })
              }
              placeholder="250m"
              className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors font-mono"
            />
          </div>

          <div>
            <label className="text-[12px] text-muted-foreground mb-2 block">CPU Limit</label>
            <input
              type="text"
              value={formData.resources.cpuLimit || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  resources: { ...formData.resources, cpuLimit: e.target.value },
                })
              }
              placeholder="1"
              className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors font-mono"
            />
          </div>

          <div>
            <label className="text-[12px] text-muted-foreground mb-2 block">Memory Request</label>
            <input
              type="text"
              value={formData.resources.memoryRequest || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  resources: { ...formData.resources, memoryRequest: e.target.value },
                })
              }
              placeholder="512Mi"
              className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors font-mono"
            />
          </div>

          <div>
            <label className="text-[12px] text-muted-foreground mb-2 block">Memory Limit</label>
            <input
              type="text"
              value={formData.resources.memoryLimit || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  resources: { ...formData.resources, memoryLimit: e.target.value },
                })
              }
              placeholder="2Gi"
              className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors font-mono"
            />
          </div>
        </div>
      </div>

      {/* Job Settings */}
      <div className="bg-card border border-border p-6 rounded-lg space-y-4">
        <h2 className="text-[14px] font-semibold text-foreground">Job Settings</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[12px] text-muted-foreground mb-2 block">Completions</label>
            <input
              type="number"
              value={formData.jobSettings.completions || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  jobSettings: {
                    ...formData.jobSettings,
                    completions: e.target.value ? parseInt(e.target.value) : undefined,
                  },
                })
              }
              placeholder="1"
              className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors font-mono"
            />
          </div>

          <div>
            <label className="text-[12px] text-muted-foreground mb-2 block">Parallelism</label>
            <input
              type="number"
              value={formData.jobSettings.parallelism || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  jobSettings: {
                    ...formData.jobSettings,
                    parallelism: e.target.value ? parseInt(e.target.value) : undefined,
                  },
                })
              }
              placeholder="1"
              className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors font-mono"
            />
          </div>

          <div>
            <label className="text-[12px] text-muted-foreground mb-2 block">Backoff Limit</label>
            <input
              type="number"
              value={formData.jobSettings.backoffLimit || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  jobSettings: {
                    ...formData.jobSettings,
                    backoffLimit: e.target.value ? parseInt(e.target.value) : undefined,
                  },
                })
              }
              placeholder="2"
              className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors font-mono"
            />
          </div>

          <div>
            <label className="text-[12px] text-muted-foreground mb-2 block">
              TTL After Finished (seconds)
            </label>
            <input
              type="number"
              value={formData.jobSettings.ttlSecondsAfterFinished || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  jobSettings: {
                    ...formData.jobSettings,
                    ttlSecondsAfterFinished: e.target.value ? parseInt(e.target.value) : undefined,
                  },
                })
              }
              placeholder="3600"
              className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors font-mono"
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
          {isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
