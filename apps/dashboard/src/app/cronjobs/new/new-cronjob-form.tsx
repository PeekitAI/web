'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
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

interface NewCronJobFormProps {
  templates: JobTemplate[];
  configmaps: ConfigMap[];
  secrets: Secret[];
  preselectedTemplate?: string;
}

const cronPresets = [
  { label: 'Every minute', value: '* * * * *' },
  { label: 'Every hour', value: '0 * * * *' },
  { label: 'Every day at midnight', value: '0 0 * * *' },
  { label: 'Every week on Sunday', value: '0 0 * * 0' },
  { label: 'Every month on the 1st', value: '0 0 1 * *' },
];

export default function NewCronJobForm({ templates, configmaps, secrets, preselectedTemplate }: NewCronJobFormProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [envVars, setEnvVars] = useState<EnvVarEntry[]>([{ key: '', type: 'value', value: '' }]);
  const [cronJobName, setCronJobName] = useState('');
  const [cronExpression, setCronExpression] = useState('');

  // Handle preselected template on mount
  useEffect(() => {
    if (preselectedTemplate && templates.find((t) => t.name === preselectedTemplate)) {
      setSelectedTemplate(preselectedTemplate);
      setCronJobName(`${preselectedTemplate}`);

      // Find the template and populate environment variables with defaults
      const template = templates.find((t) => t.name === preselectedTemplate);
      if (template?.data.variables && template.data.variables.length > 0) {
        setEnvVars(
          template.data.variables.map((v) => ({
            key: v.key,
            type: 'value' as const,
            value: v.defaultValue || '',
          }))
        );
      }
    }
  }, [preselectedTemplate, templates]);

  const handleTemplateChange = (templateName: string) => {
    setSelectedTemplate(templateName);
    setCronJobName(templateName);

    // Find the template and populate environment variables with defaults
    const template = templates.find((t) => t.name === templateName);
    if (template?.data.variables && template.data.variables.length > 0) {
      setEnvVars(
        template.data.variables.map((v) => ({
          key: v.key,
          value: v.defaultValue || '',
        }))
      );
    } else {
      setEnvVars([{ key: '', value: '' }]);
    }
  };

  const selectedTemplateData = templates.find((t) => t.name === selectedTemplate);

  return (
    <form className="space-y-6">
      {/* Job Template Selection */}
      <div className="bg-card border border-border p-6 rounded-lg">
        <h2 className="text-[14px] font-semibold text-foreground mb-4">Job Template</h2>
        <div>
          <label className="text-[12px] text-muted-foreground mb-2 block">Select Template</label>
          <select
            value={selectedTemplate}
            onChange={(e) => handleTemplateChange(e.target.value)}
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

      {/* CronJob Name */}
      <div className="bg-card border border-border p-6 rounded-lg">
        <h2 className="text-[14px] font-semibold text-foreground mb-4">CronJob Name</h2>
        <div>
          <label className="text-[12px] text-muted-foreground mb-2 block">Name</label>
          <input
            type="text"
            placeholder="daily-website-crawl"
            value={cronJobName}
            onChange={(e) => setCronJobName(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors font-mono"
          />
          <p className="text-[11px] text-muted-foreground mt-1">Must be lowercase alphanumeric with hyphens</p>
        </div>
      </div>

      {/* Schedule Configuration */}
      <div className="bg-card border border-border p-6 rounded-lg">
        <h2 className="text-[14px] font-semibold text-foreground mb-4">Schedule Configuration</h2>
        <div className="space-y-4">
          <div>
            <label className="text-[12px] text-muted-foreground mb-2 block">Cron Expression</label>
            <input
              type="text"
              value={cronExpression}
              onChange={(e) => setCronExpression(e.target.value)}
              placeholder="0 2 * * *"
              className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors font-mono"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Format: minute hour day month weekday
            </p>
          </div>

          <div>
            <label className="text-[12px] text-muted-foreground mb-2 block">Quick Presets</label>
            <div className="flex flex-wrap gap-2">
              {cronPresets.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setCronExpression(preset.value)}
                  className="px-3 py-1.5 border border-border rounded-lg text-[12px] hover:bg-muted transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-[12px] text-muted-foreground mb-2 block">Timezone</label>
              <select className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors">
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York</option>
                <option value="America/Los_Angeles">America/Los_Angeles</option>
                <option value="Europe/London">Europe/London</option>
                <option value="Asia/Tokyo">Asia/Tokyo</option>
                <option value="Asia/Kolkata">Asia/Kolkata</option>
              </select>
            </div>
            <div>
              <label className="text-[12px] text-muted-foreground mb-2 block">Concurrency Policy</label>
              <select className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors">
                <option value="Allow">Allow</option>
                <option value="Forbid">Forbid</option>
                <option value="Replace">Replace</option>
              </select>
            </div>
            <div>
              <label className="text-[12px] text-muted-foreground mb-2 block">Starting Deadline (seconds)</label>
              <input
                type="number"
                placeholder="100"
                className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[12px] text-muted-foreground mb-2 block">Successful Jobs History Limit</label>
              <input
                type="number"
                defaultValue="3"
                className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="text-[12px] text-muted-foreground mb-2 block">Failed Jobs History Limit</label>
              <input
                type="number"
                defaultValue="1"
                className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="suspend"
              className="w-4 h-4"
            />
            <label htmlFor="suspend" className="text-[12px] text-foreground">
              Start in suspended state
            </label>
          </div>
        </div>
      </div>

      {/* EnvVars and Configs */}
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
          href="/cronjobs"
          className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-[13px] font-medium"
        >
          Cancel
        </Link>
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-[13px] font-medium"
        >
          Create CronJob
        </button>
      </div>
    </form>
  );
}
