'use server';

import { getCoreV1Api } from '@/lib/k8s-client';
import { getNamespace } from '@/lib/namespace';
import { revalidatePath } from 'next/cache';

const TEMPLATE_LABEL = 'peekit.io/job-template';

export async function getConfigMaps() {
  try {
    const api = getCoreV1Api();
    const response = await api.listNamespacedConfigMap({ namespace: getNamespace() });

    // Filter out job templates (they have their own section)
    return response.items
      .filter((cm) => !cm.metadata?.labels?.[TEMPLATE_LABEL])
      .map((cm) => ({
        name: cm.metadata?.name || '',
        namespace: cm.metadata?.namespace || '',
        keys: Object.keys(cm.data || {}).length,
        created: cm.metadata?.creationTimestamp,
        data: cm.data || {},
      }));
  } catch (error) {
    console.error('Error fetching configmaps:', error);
    return [];
  }
}

export async function getConfigMap(name: string) {
  try {
    const api = getCoreV1Api();
    const response = await api.readNamespacedConfigMap({ name, namespace: getNamespace() });

    return {
      name: response.metadata?.name || '',
      namespace: response.metadata?.namespace || '',
      keys: Object.keys(response.data || {}).length,
      created: response.metadata?.creationTimestamp,
      data: response.data || {},
    };
  } catch (error) {
    console.error('Error fetching configmap:', error);
    throw error;
  }
}

export async function createConfigMap(
  name: string,
  data: Record<string, string>
) {
  try {
    const api = getCoreV1Api();

    await api.createNamespacedConfigMap({
      namespace: getNamespace(),
      body: {
        metadata: {
          name,
        },
        data,
      },
    });

    revalidatePath('/configs');
    return { success: true };
  } catch (error: any) {
    console.error('Error creating configmap:', error);
    return { success: false, error: error.message };
  }
}

export async function updateConfigMap(
  name: string,
  data: Record<string, string>
) {
  try {
    const api = getCoreV1Api();

    await api.replaceNamespacedConfigMap({
      name,
      namespace: getNamespace(),
      body: {
        metadata: {
          name,
        },
        data,
      },
    });

    revalidatePath('/configs');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating configmap:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteConfigMap(name: string) {
  try {
    const api = getCoreV1Api();
    await api.deleteNamespacedConfigMap({ name, namespace: getNamespace() });

    revalidatePath('/configs');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting configmap:', error);
    return { success: false, error: error.message };
  }
}
