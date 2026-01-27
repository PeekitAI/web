'use server';

import { getBatchV1Api, getCoreV1Api } from '@/lib/k8s-client';
import { getNamespace } from '@/lib/namespace';
import { revalidatePath } from 'next/cache';
import { getJobTemplate } from './templates';

export interface EnvVarValue {
  type: 'value' | 'configMap' | 'secret';
  value?: string;
  configMapName?: string;
  secretName?: string;
  key?: string;
  mountAsFile?: boolean; // When true, mount the entire ConfigMap/Secret as files instead of env var
}

export interface CreateJobParams {
  name: string;
  templateName: string;
  envVars: Record<string, EnvVarValue>;
}

export async function getJobs() {
  try {
    const api = getBatchV1Api();
    const response = await api.listNamespacedJob({ namespace: getNamespace() });

    // Map jobs and extract category from label for efficient filtering
    const jobs = response.items.map((job) => ({
      name: job.metadata?.name || '',
      namespace: job.metadata?.namespace || '',
      status: job.status?.active ? 'Running' : job.status?.succeeded ? 'Completed' : 'Failed',
      startTime: job.status?.startTime,
      completionTime: job.status?.completionTime,
      active: job.status?.active || 0,
      succeeded: job.status?.succeeded || 0,
      failed: job.status?.failed || 0,
      template: job.metadata?.labels?.['peekit.io/template'] || '',
      category: job.metadata?.labels?.['peekit.io/category'] || '',
      creationTime: job.metadata?.creationTimestamp,
    }));

    // Sort by creation time, latest first
    jobs.sort((a, b) => {
      if (!a.creationTime) return 1;
      if (!b.creationTime) return -1;
      return new Date(b.creationTime).getTime() - new Date(a.creationTime).getTime();
    });

    return jobs;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }
}

export async function getJob(name: string) {
  try {
    const api = getBatchV1Api();
    const response = await api.readNamespacedJob({ name, namespace: getNamespace() });

    return {
      name: response.metadata?.name || '',
      namespace: response.metadata?.namespace || '',
      status: response.status?.active ? 'Running' : response.status?.succeeded ? 'Completed' : 'Failed',
      startTime: response.status?.startTime,
      completionTime: response.status?.completionTime,
      active: response.status?.active || 0,
      succeeded: response.status?.succeeded || 0,
      failed: response.status?.failed || 0,
      spec: response.spec,
      template: response.metadata?.labels?.['peekit.io/template'] || '',
    };
  } catch (error) {
    console.error('Error fetching job:', error);
    throw error;
  }
}

export async function createJob(params: CreateJobParams) {
  try {
    const batchApi = getBatchV1Api();
    const coreApi = getCoreV1Api();

    // Get the template from JobTemplate CRD
    const templateData = await getJobTemplate(params.templateName);
    const template = templateData.data;

    // Build env vars and collect volume mounts
    const volumeMounts: Array<{ name: string; mountPath: string; readOnly: boolean }> = [];
    const volumes: Array<any> = [];

    const envVars = [
      // Add PYTHONUNBUFFERED to fix Python output buffering (makes logs appear immediately)
      { name: 'PYTHONUNBUFFERED', value: '1' },
      ...Object.entries(params.envVars)
        .filter(([key, envVar]) => !envVar.mountAsFile) // Skip vars that should be mounted as files
        .map(([key, envVar]) => {
          if (envVar.type === 'value') {
            return {
              name: key,
              value: envVar.value,
            };
          } else if (envVar.type === 'configMap') {
            return {
              name: key,
              valueFrom: {
                configMapKeyRef: {
                  name: envVar.configMapName,
                  key: envVar.key,
                },
              },
            };
          } else if (envVar.type === 'secret') {
            return {
              name: key,
              valueFrom: {
                secretKeyRef: {
                  name: envVar.secretName,
                  key: envVar.key,
                },
              },
            };
          }
          return { name: key, value: '' };
        })
    ];

    // Build volume mounts for ConfigMaps and Secrets marked as mountAsFile
    // Note: Template volume mounts are already loaded into the form as envVar entries,
    // so we only need to process params.envVars here
    Object.entries(params.envVars).forEach(([key, envVar]) => {
      if (envVar.mountAsFile) {
        if (envVar.type === 'configMap' && envVar.configMapName) {
          const volumeName = `configmap-${envVar.configMapName}`;
          volumeMounts.push({
            name: volumeName,
            mountPath: envVar.value || `/mnt/configmaps/${envVar.configMapName}`,
            readOnly: true,
          });
          volumes.push({
            name: volumeName,
            configMap: {
              name: envVar.configMapName,
            },
          });
        } else if (envVar.type === 'secret' && envVar.secretName) {
          const volumeName = `secret-${envVar.secretName}`;
          volumeMounts.push({
            name: volumeName,
            mountPath: envVar.value || `/mnt/secrets/${envVar.secretName}`,
            readOnly: true,
          });
          volumes.push({
            name: volumeName,
            secret: {
              secretName: envVar.secretName,
            },
          });
        }
      }
    });

    // Create the job
    await batchApi.createNamespacedJob({
      namespace: getNamespace(),
      body: {
        metadata: {
          name: params.name,
          labels: {
            'peekit.io/template': params.templateName,
            'peekit.io/category': (template.category || 'uncategorized').replace(/\s+/g, '-').toLowerCase(),
            'app.kubernetes.io/name': params.templateName,
            'app.kubernetes.io/managed-by': 'peekit-dashboard',
          },
        },
        spec: {
          template: {
            spec: {
              containers: [
                {
                  name: 'job',
                  image: template.image,
                  imagePullPolicy: template.imagePullPolicy || 'IfNotPresent',
                  command: template.command,
                  args: template.args,
                  env: envVars,
                  volumeMounts: volumeMounts.length > 0 ? volumeMounts : undefined,
                  resources: {
                    requests: {
                      cpu: template.resources?.cpuRequest,
                      memory: template.resources?.memoryRequest,
                    },
                    limits: {
                      cpu: template.resources?.cpuLimit,
                      memory: template.resources?.memoryLimit,
                    },
                  },
                },
              ],
              volumes: volumes.length > 0 ? volumes : undefined,
              restartPolicy: 'Never',
            },
          },
          backoffLimit: template.jobSettings?.backoffLimit || 3,
          completions: template.jobSettings?.completions || 1,
          parallelism: template.jobSettings?.parallelism || 1,
          ttlSecondsAfterFinished: template.jobSettings?.ttlSecondsAfterFinished,
        },
      },
    });

    revalidatePath('/jobs');
    return { success: true };
  } catch (error: any) {
    console.error('Error creating job:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteJob(name: string) {
  try {
    const api = getBatchV1Api();
    await api.deleteNamespacedJob({
      name,
      namespace: getNamespace(),
      propagationPolicy: 'Background',
    });

    revalidatePath('/jobs');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting job:', error);
    return { success: false, error: error.message };
  }
}

export async function getJobLogs(jobName: string) {
  try {
    const coreApi = getCoreV1Api();

    // Get pods for this job
    const podsResponse = await coreApi.listNamespacedPod({
      namespace: getNamespace(),
      labelSelector: `job-name=${jobName}`,
    });

    if (podsResponse.items.length === 0) {
      return { success: true, logs: 'No pods found for this job' };
    }

    const pod = podsResponse.items[0];
    const podName = pod.metadata?.name || '';

    // Get logs from the pod
    const logsResponse = await coreApi.readNamespacedPodLog({
      name: podName,
      namespace: getNamespace(),
    });

    return { success: true, logs: logsResponse };
  } catch (error: any) {
    console.error('Error fetching job logs:', error);
    return { success: false, error: error.message, logs: '' };
  }
}
