import { Plus, Edit, Trash, Eye } from 'lucide-react';
import { getConfigMaps, getSecrets } from '@/actions';
import ConfigsClient from './configs-client';

export default async function ConfigsPage() {
  const [configMaps, secrets] = await Promise.all([
    getConfigMaps(),
    getSecrets()
  ]);

  return <ConfigsClient configMaps={configMaps} secrets={secrets} />;
}
