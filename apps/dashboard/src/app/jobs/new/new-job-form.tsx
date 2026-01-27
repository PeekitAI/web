'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createJob, type EnvVarValue } from '@/actions/jobs';
import { useRouter } from 'next/navigation';
import EnvironmentVariablesEditor, { type EnvVarEntry } from '@/components/environment-variables-editor';

interface JobTemplate {
  name: string;
  data: {
    name: string;
    description: string;
    category: string;
    variables?: Array<{
      key: string;
      defaultValue?: string;
      description?: string;
    }>;
    volumeMounts?: Array<{
      name: string;
      mountPath: string;
      sourceType: 'configMap' | 'secret';
      sourceName: string;
      subPath?: string;
    }>;
  };
}

interface ConfigMap {
  name: string;
  data: Record<string, string>;
}

interface Secret {
  name: string;
  data: Record<string, string>;
}

interface NewJobFormProps {
  templates: JobTemplate[];
  configmaps: ConfigMap[];
  secrets: Secret[];
  preselectedTemplate?: string;
}

export default function NewJobForm({ templates, configmaps, secrets, preselectedTemplate }: NewJobFormProps) {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [envVars, setEnvVars] = useState<EnvVarEntry[]>([{ key: '', type: 'value', value: '' }]);
  const [jobName, setJobName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle preselected template on mount
  useEffect(() => {
    if (preselectedTemplate && templates.find((t) => t.name === preselectedTemplate)) {
      setSelectedTemplate(preselectedTemplate);

      // Auto-generate job name from template
      const timestamp = new Date().getTime().toString().slice(-6);
      setJobName(`${preselectedTemplate}-${timestamp}`);

      // Find the template and populate environment variables with defaults
      const template = templates.find((t) => t.name === preselectedTemplate);
      const vars: EnvVarEntry[] = [];

      // Add regular variables
      if (template?.data.variables && template.data.variables.length > 0) {
        template.data.variables.forEach((v) => {
          vars.push({
            key: v.key,
            type: 'value' as const,
            value: v.defaultValue || '',
          });
        });
      }

      // Add volume mounts as envVar entries
      if (template?.data.volumeMounts && template.data.volumeMounts.length > 0) {
        template.data.volumeMounts.forEach((m) => {
          vars.push({
            key: m.name,
            type: m.sourceType,
            mountAsFile: true,
            // Store in configMapName or secretName depending on type
            ...(m.sourceType === 'configMap' ? { configMapName: m.sourceName } : { secretName: m.sourceName }),
            // Store mountPath in value field
            value: m.mountPath,
          });
        });
      }

      if (vars.length > 0) {
        setEnvVars(vars);
      }
    }
  }, [preselectedTemplate, templates]);

  const handleTemplateChange = (templateName: string) => {
    setSelectedTemplate(templateName);

    // Auto-generate job name from template
    const timestamp = new Date().getTime().toString().slice(-6);
    setJobName(`${templateName}-${timestamp}`);

    // Find the template and populate environment variables with defaults
    const template = templates.find((t) => t.name === templateName);
    const vars: EnvVarEntry[] = [];

    // Add regular variables
    if (template?.data.variables && template.data.variables.length > 0) {
      template.data.variables.forEach((v) => {
        vars.push({
          key: v.key,
          type: 'value' as const,
          value: v.defaultValue || '',
        });
      });
    }

    // Add volume mounts as envVar entries
    if (template?.data.volumeMounts && template.data.volumeMounts.length > 0) {
      template.data.volumeMounts.forEach((m) => {
        vars.push({
          key: m.name,
          type: m.sourceType,
          mountAsFile: true,
          // Store in configMapName or secretName depending on type
          ...(m.sourceType === 'configMap' ? { configMapName: m.sourceName } : { secretName: m.sourceName }),
          // Store mountPath in value field
          value: m.mountPath,
        });
      });
    }

    if (vars.length > 0) {
      setEnvVars(vars);
    } else {
      setEnvVars([{ key: '', type: 'value', value: '' }]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Convert envVars array to Record<string, EnvVarValue>
      const envVarsRecord: Record<string, EnvVarValue> = {};
      envVars.forEach((envVar) => {
        if (envVar.key) {
          envVarsRecord[envVar.key] = {
            type: envVar.type,
            value: envVar.value,
            configMapName: envVar.configMapName,
            secretName: envVar.secretName,
            key: envVar.refKey,
            mountAsFile: envVar.mountAsFile,
          };
        }
      });

      const result = await createJob({
        name: jobName,
        templateName: selectedTemplate,
        envVars: envVarsRecord,
      });

      if (result.success) {
        router.push('/jobs');
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error creating job:', error);
      alert('Failed to create job');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTemplateData = templates.find((t) => t.name === selectedTemplate);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Job Template Selection */}
      <div className="bg-card border border-border p-6 rounded-lg">
        <h2 className="text-[14px] font-semibold text-foreground mb-4">Job Template</h2>
        <div>
          <label className="text-[12px] text-muted-foreground mb-2 block">Select Template</label>
          <select
            value={selectedTemplate}
            onChange={(e) => handleTemplateChange(e.target.value)}
            required
            className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors"
          >
            <option value="">Choose a template...</option>
            {templates.map((template) => (
              <option key={template.name} value={template.name}>
                {template.name}
              </option>
            ))}
          </select>
          {selectedTemplateData && (
            <div className="mt-3 p-3 bg-muted/30 rounded-md">
              <div className="flex items-start gap-2">
                <span className="inline-flex items-center px-2 py-0.5 bg-muted rounded text-[11px] font-medium text-foreground mt-0.5">
                  {selectedTemplateData.data.category}
                </span>
                <p className="text-[12px] text-muted-foreground leading-relaxed flex-1">
                  {selectedTemplateData.data.description}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Job Name */}
      <div className="bg-card border border-border p-6 rounded-lg">
        <h2 className="text-[14px] font-semibold text-foreground mb-4">Job Name</h2>
        <div>
          <label className="text-[12px] text-muted-foreground mb-2 block">Name</label>
          <input
            type="text"
            placeholder="my-crawl-job"
            value={jobName}
            onChange={(e) => setJobName(e.target.value)}
            required
            pattern="[a-z0-9]([-a-z0-9]*[a-z0-9])?"
            className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors font-mono"
          />
          <p className="text-[11px] text-muted-foreground mt-1">Must be lowercase alphanumeric with hyphens</p>
        </div>
      </div>

      {/* Environment Variables */}
      <EnvironmentVariablesEditor
        envVars={envVars}
        setEnvVars={setEnvVars}
        configmaps={configmaps}
        secrets={secrets}
        templateVariables={selectedTemplateData?.data.variables || []}
        showTemplateInfo={!!selectedTemplate && !!selectedTemplateData?.data.variables && selectedTemplateData.data.variables.length > 0}
      />

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <Link
          href="/jobs"
          className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-[13px] font-medium"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={!selectedTemplate || !jobName || isSubmitting}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-[13px] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creating...' : 'Create Job'}
        </button>
      </div>
    </form>
  );
}
