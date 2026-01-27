# Server Actions

This directory contains Next.js Server Actions for managing Kubernetes resources.

## Overview

All actions are server-side only and interact directly with the Kubernetes API using `@kubernetes/client-node`. They use the default Kubernetes configuration (in-cluster or `~/.kube/config`).

## Available Actions

### Job Templates (`templates.ts`)

Job templates are stored as ConfigMaps with the label `peekit.io/job-template=true`.

```typescript
// Get all templates
const templates = await getJobTemplates();

// Get a specific template
const template = await getJobTemplate('website-full-crawl');

// Create a template
await createJobTemplate({
  name: 'my-template',
  description: 'My custom template',
  category: 'Web Crawling',
  image: 'ghcr.io/org/crawler:latest',
  imagePullPolicy: 'IfNotPresent',
  variables: [
    { key: 'URL', defaultValue: 'https://example.com', description: 'URL to crawl' }
  ],
  resources: {
    cpuRequest: '100m',
    cpuLimit: '1000m',
    memoryRequest: '128Mi',
    memoryLimit: '512Mi',
  },
  jobSettings: {
    completions: 1,
    parallelism: 1,
    backoffLimit: 3,
    ttlSecondsAfterFinished: 3600,
  },
});

// Update a template
await updateJobTemplate('my-template', { ...updatedData });

// Delete a template
await deleteJobTemplate('my-template');
```

### Jobs (`jobs.ts`)

```typescript
// Get all jobs in a namespace
const jobs = await getJobs('crawling-jobs');

// Get a specific job
const job = await getJob('my-job', 'crawling-jobs');

// Create a job from a template
await createJob({
  name: 'my-job-123',
  namespace: 'crawling-jobs',
  templateName: 'website-full-crawl',
  envVars: {
    URL: 'https://example.com',
    DEPTH: '3',
  },
});

// Delete a job
await deleteJob('my-job-123', 'crawling-jobs');

// Get job logs
const { logs } = await getJobLogs('my-job-123', 'crawling-jobs');
```

### CronJobs (`cronjobs.ts`)

```typescript
// Get all cronjobs
const cronJobs = await getCronJobs('crawling-jobs');

// Get a specific cronjob
const cronJob = await getCronJob('daily-crawl', 'crawling-jobs');

// Create a cronjob from a template
await createCronJob({
  name: 'daily-crawl',
  namespace: 'crawling-jobs',
  templateName: 'website-full-crawl',
  schedule: '0 2 * * *',
  timezone: 'UTC',
  concurrencyPolicy: 'Forbid',
  successfulJobsHistoryLimit: 3,
  failedJobsHistoryLimit: 1,
  suspend: false,
  envVars: {
    URL: 'https://example.com',
  },
});

// Update a cronjob
await updateCronJob('daily-crawl', 'crawling-jobs', {
  schedule: '0 3 * * *',
});

// Suspend a cronjob
await suspendCronJob('daily-crawl', 'crawling-jobs');

// Resume a cronjob
await resumeCronJob('daily-crawl', 'crawling-jobs');

// Manually trigger a cronjob (creates a one-off job)
await triggerCronJob('daily-crawl', 'crawling-jobs');

// Delete a cronjob
await deleteCronJob('daily-crawl', 'crawling-jobs');
```

### ConfigMaps (`configmaps.ts`)

```typescript
// Get all configmaps
const configMaps = await getConfigMaps('crawling-jobs');

// Get a specific configmap
const configMap = await getConfigMap('crawler-config', 'crawling-jobs');

// Create a configmap
await createConfigMap('crawler-config', 'crawling-jobs', {
  'max-depth': '5',
  'user-agent': 'MyCrawler/1.0',
});

// Update a configmap
await updateConfigMap('crawler-config', 'crawling-jobs', {
  'max-depth': '10',
  'user-agent': 'MyCrawler/2.0',
});

// Delete a configmap
await deleteConfigMap('crawler-config', 'crawling-jobs');
```

### Secrets (`secrets.ts`)

```typescript
// Get all secrets
const secrets = await getSecrets('crawling-jobs');

// Get a specific secret (data is base64 decoded)
const secret = await getSecret('api-credentials', 'crawling-jobs');

// Create a secret
await createSecret('api-credentials', 'crawling-jobs', {
  'api-key': 'my-secret-key',
  'api-secret': 'my-secret-value',
}, 'Opaque');

// Update a secret
await updateSecret('api-credentials', 'crawling-jobs', {
  'api-key': 'new-secret-key',
  'api-secret': 'new-secret-value',
});

// Delete a secret
await deleteSecret('api-credentials', 'crawling-jobs');
```

## Error Handling

All actions return objects with `{ success: boolean, error?: string }` for mutations, or throw errors for read operations that should be caught by the caller.

## Revalidation

Actions that modify data automatically revalidate the appropriate Next.js paths using `revalidatePath()`.

## Environment Variables

- `TEMPLATE_NAMESPACE`: The namespace where job templates are stored (default: `default`)
- `KUBECONFIG`: Optional path to kubeconfig file (defaults to `~/.kube/config` or in-cluster config)
