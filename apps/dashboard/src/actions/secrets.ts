'use server';

import { getCoreV1Api } from '@/lib/k8s-client';
import { getNamespace } from '@/lib/namespace';
import { revalidatePath } from 'next/cache';

export async function getSecrets() {
  try {
    const api = getCoreV1Api();
    const response = await api.listNamespacedSecret({ namespace: getNamespace() });

    // Filter out default service account tokens
    return response.items
      .filter((secret) => secret.type !== 'kubernetes.io/service-account-token')
      .map((secret) => {
        // Decode secret data (base64)
        const decodedData: Record<string, string> = {};
        if (secret.data) {
          for (const [key, value] of Object.entries(secret.data)) {
            decodedData[key] = Buffer.from(value, 'base64').toString('utf-8');
          }
        }

        return {
          name: secret.metadata?.name || '',
          namespace: secret.metadata?.namespace || '',
          type: secret.type || 'Opaque',
          keys: Object.keys(secret.data || {}).length,
          created: secret.metadata?.creationTimestamp,
          data: decodedData,
        };
      });
  } catch (error) {
    console.error('Error fetching secrets:', error);
    return [];
  }
}

export async function getSecret(name: string) {
  try {
    const api = getCoreV1Api();
    const response = await api.readNamespacedSecret({ name, namespace: getNamespace() });

    // Decode secret data (base64)
    const decodedData: Record<string, string> = {};
    if (response.data) {
      for (const [key, value] of Object.entries(response.data)) {
        decodedData[key] = Buffer.from(value, 'base64').toString('utf-8');
      }
    }

    return {
      name: response.metadata?.name || '',
      namespace: response.metadata?.namespace || '',
      type: response.type || 'Opaque',
      keys: Object.keys(response.data || {}).length,
      created: response.metadata?.creationTimestamp,
      data: decodedData,
    };
  } catch (error) {
    console.error('Error fetching secret:', error);
    throw error;
  }
}

export async function createSecret(
  name: string,
  data: Record<string, string>,
  type: string = 'Opaque'
) {
  try {
    const api = getCoreV1Api();

    // Encode data to base64
    const encodedData: Record<string, string> = {};
    for (const [key, value] of Object.entries(data)) {
      encodedData[key] = Buffer.from(value).toString('base64');
    }

    await api.createNamespacedSecret({
      namespace: getNamespace(),
      body: {
        metadata: {
          name,
        },
        type,
        data: encodedData,
      },
    });

    revalidatePath('/configs');
    return { success: true };
  } catch (error: any) {
    console.error('Error creating secret:', error);
    return { success: false, error: error.message };
  }
}

export async function updateSecret(
  name: string,
  data: Record<string, string>,
  type: string = 'Opaque'
) {
  try {
    const api = getCoreV1Api();

    // Encode data to base64
    const encodedData: Record<string, string> = {};
    for (const [key, value] of Object.entries(data)) {
      encodedData[key] = Buffer.from(value).toString('base64');
    }

    await api.replaceNamespacedSecret({
      name,
      namespace: getNamespace(),
      body: {
        metadata: {
          name,
        },
        type,
        data: encodedData,
      },
    });

    revalidatePath('/configs');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating secret:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteSecret(name: string) {
  try {
    const api = getCoreV1Api();
    await api.deleteNamespacedSecret({ name, namespace: getNamespace() });

    revalidatePath('/configs');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting secret:', error);
    return { success: false, error: error.message };
  }
}
