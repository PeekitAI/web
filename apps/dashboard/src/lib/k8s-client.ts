import * as k8s from '@kubernetes/client-node';

let kc: k8s.KubeConfig | null = null;
let k8sApi: k8s.CoreV1Api | null = null;
let batchApi: k8s.BatchV1Api | null = null;
let customObjectsApi: k8s.CustomObjectsApi | null = null;

export function getKubeConfig(): k8s.KubeConfig {
  if (!kc) {
    kc = new k8s.KubeConfig();
    kc.loadFromDefault();
  }
  return kc;
}

export function getCoreV1Api(): k8s.CoreV1Api {
  if (!k8sApi) {
    const kubeConfig = getKubeConfig();
    k8sApi = kubeConfig.makeApiClient(k8s.CoreV1Api);
  }
  return k8sApi;
}

export function getBatchV1Api(): k8s.BatchV1Api {
  if (!batchApi) {
    const kubeConfig = getKubeConfig();
    batchApi = kubeConfig.makeApiClient(k8s.BatchV1Api);
  }
  return batchApi;
}

export function getCustomObjectsApi(): k8s.CustomObjectsApi {
  if (!customObjectsApi) {
    const kubeConfig = getKubeConfig();
    customObjectsApi = kubeConfig.makeApiClient(k8s.CustomObjectsApi);
  }
  return customObjectsApi;
}
