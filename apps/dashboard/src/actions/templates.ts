'use server';

import { getCustomObjectsApi } from '@/lib/k8s-client';
import { getNamespace } from '@/lib/namespace';
import { revalidatePath } from 'next/cache';

export interface JobTemplate {
  name: string;
  description: string;
  category: string;
  image: string;
  imagePullPolicy: string;
  command?: string[];
  args?: string[];
  variables: Array<{
    key: string;
    defaultValue?: string;
    description?: string;
  }>;
  resources: {
    cpuRequest?: string;
    cpuLimit?: string;
    memoryRequest?: string;
    memoryLimit?: string;
  };
  jobSettings: {
    completions?: number;
    parallelism?: number;
    backoffLimit?: number;
    ttlSecondsAfterFinished?: number;
  };
  volumeMounts?: Array<{
    name: string;
    mountPath: string;
    sourceType: 'configMap' | 'secret';
    sourceName: string;
    subPath?: string;
  }>;
}

const JOB_TEMPLATE_CRD_GROUP = 'peekit.io';
const JOB_TEMPLATE_CRD_VERSION = 'v1';
const JOB_TEMPLATE_CRD_PLURAL = 'jobtemplates';

export async function getJobTemplates() {
  try {
    const api = getCustomObjectsApi();
    const namespace = getNamespace();
    const response = await api.listNamespacedCustomObject({
      group: JOB_TEMPLATE_CRD_GROUP,
      version: JOB_TEMPLATE_CRD_VERSION,
      namespace,
      plural: JOB_TEMPLATE_CRD_PLURAL,
    }) as any;

    const items = response.body?.items || response.items || [];
    return items.map((item: any) => ({
      name: item.metadata?.name || '',
      data: item.spec as JobTemplate,
      created: item.metadata?.creationTimestamp,
    }));
  } catch (error) {
    console.error('Error fetching job templates:', error);
    return [];
  }
}

export async function getJobTemplate(name: string) {
  try {
    const api = getCustomObjectsApi();
    const namespace = getNamespace();
    const response = await api.getNamespacedCustomObject({
      group: JOB_TEMPLATE_CRD_GROUP,
      version: JOB_TEMPLATE_CRD_VERSION,
      namespace,
      plural: JOB_TEMPLATE_CRD_PLURAL,
      name,
    }) as any;

    const data = response.body || response;
    return {
      name: data.metadata?.name || '',
      data: data.spec as JobTemplate,
      created: data.metadata?.creationTimestamp,
    };
  } catch (error) {
    console.error('Error fetching job template:', error);
    throw error;
  }
}

export async function createJobTemplate(template: JobTemplate) {
  try {
    const api = getCustomObjectsApi();
    const namespace = getNamespace();

    await api.createNamespacedCustomObject({
      group: JOB_TEMPLATE_CRD_GROUP,
      version: JOB_TEMPLATE_CRD_VERSION,
      namespace,
      plural: JOB_TEMPLATE_CRD_PLURAL,
      body: {
        apiVersion: `${JOB_TEMPLATE_CRD_GROUP}/${JOB_TEMPLATE_CRD_VERSION}`,
        kind: 'JobTemplate',
        metadata: {
          name: template.name,
          namespace,
        },
        spec: template,
      },
    });

    revalidatePath('/templates');
    return { success: true };
  } catch (error: any) {
    console.error('Error creating job template:', error);
    return { success: false, error: error.message };
  }
}

export async function updateJobTemplate(name: string, template: JobTemplate) {
  try {
    const api = getCustomObjectsApi();
    const namespace = getNamespace();

    await api.replaceNamespacedCustomObject({
      group: JOB_TEMPLATE_CRD_GROUP,
      version: JOB_TEMPLATE_CRD_VERSION,
      namespace,
      plural: JOB_TEMPLATE_CRD_PLURAL,
      name,
      body: {
        apiVersion: `${JOB_TEMPLATE_CRD_GROUP}/${JOB_TEMPLATE_CRD_VERSION}`,
        kind: 'JobTemplate',
        metadata: {
          name: template.name,
          namespace,
        },
        spec: template,
      },
    });

    revalidatePath('/templates');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating job template:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteJobTemplate(name: string) {
  try {
    const api = getCustomObjectsApi();
    const namespace = getNamespace();
    await api.deleteNamespacedCustomObject({
      group: JOB_TEMPLATE_CRD_GROUP,
      version: JOB_TEMPLATE_CRD_VERSION,
      namespace,
      plural: JOB_TEMPLATE_CRD_PLURAL,
      name,
    });

    revalidatePath('/templates');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting job template:', error);
    return { success: false, error: error.message };
  }
}
