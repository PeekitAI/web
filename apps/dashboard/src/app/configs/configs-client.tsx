'use client';

import { Plus, Edit, Trash, Eye, X, Save, EyeOff } from 'lucide-react';
import { useState, useTransition } from 'react';
import { createConfigMap, updateConfigMap, deleteConfigMap, createSecret, updateSecret, deleteSecret } from '@/actions';
import { useRouter } from 'next/navigation';

interface ConfigMap {
  name: string;
  namespace: string;
  keys: number;
  created?: Date;
  data: Record<string, string>;
}

interface Secret {
  name: string;
  namespace: string;
  type: string;
  keys: number;
  created?: Date;
  data: Record<string, string>;
}

interface ConfigsClientProps {
  configMaps: ConfigMap[];
  secrets: Secret[];
}

export default function ConfigsClient({ configMaps, secrets }: ConfigsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'configmaps' | 'secrets'>('configmaps');
  const [viewModal, setViewModal] = useState<{ type: 'configmap' | 'secret'; item: ConfigMap | Secret } | null>(null);
  const [editModal, setEditModal] = useState<{ type: 'configmap' | 'secret'; item: ConfigMap | Secret; data: Record<string, string> } | null>(null);
  const [createModal, setCreateModal] = useState<{ type: 'configmap' | 'secret'; name: string; secretType: string; data: Array<{ key: string; value: string }> } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showSecretValues, setShowSecretValues] = useState<Record<string, boolean>>({});

  const handleView = (type: 'configmap' | 'secret', item: ConfigMap | Secret) => {
    setViewModal({ type, item });
  };

  const handleEdit = (type: 'configmap' | 'secret', item: ConfigMap | Secret) => {
    setEditModal({ type, item, data: { ...item.data } });
  };

  const handleSaveEdit = () => {
    if (!editModal) return;

    setError(null);
    startTransition(async () => {
      const result = editModal.type === 'configmap'
        ? await updateConfigMap(editModal.item.name, editModal.data)
        : await updateSecret(
            editModal.item.name,
            editModal.data,
            (editModal.item as Secret).type
          );

      if (result.success) {
        setEditModal(null);
        router.refresh();
      } else {
        setError(result.error || 'Failed to save changes');
      }
    });
  };

  const handleDelete = (type: 'configmap' | 'secret', name: string) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

    startTransition(async () => {
      const result = type === 'configmap'
        ? await deleteConfigMap(name)
        : await deleteSecret(name);

      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || 'Failed to delete');
      }
    });
  };

  const handleOpenCreate = (type: 'configmap' | 'secret') => {
    setCreateModal({
      type,
      name: '',
      secretType: 'Opaque',
      data: [{ key: '', value: '' }],
    });
  };

  const handleSaveCreate = () => {
    if (!createModal) return;

    // Validate
    if (!createModal.name.trim()) {
      setError('Name is required');
      return;
    }

    const hasEmptyKeys = createModal.data.some((item) => !item.key.trim());
    if (hasEmptyKeys) {
      setError('All keys must be filled');
      return;
    }

    setError(null);
    startTransition(async () => {
      const dataRecord: Record<string, string> = {};
      createModal.data.forEach((item) => {
        if (item.key.trim()) {
          dataRecord[item.key] = item.value;
        }
      });

      const result = createModal.type === 'configmap'
        ? await createConfigMap(createModal.name, dataRecord)
        : await createSecret(createModal.name, dataRecord, createModal.secretType);

      if (result.success) {
        setCreateModal(null);
        router.refresh();
      } else {
        setError(result.error || 'Failed to create');
      }
    });
  };

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-[1200px] mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[22px] font-semibold text-foreground tracking-tight">Configs & Secrets</h1>
            <p className="text-[13px] text-muted-foreground mt-1.5">Manage ConfigMaps and Secrets for your namespace.</p>
          </div>
          <button
            onClick={() => handleOpenCreate(activeTab === 'configmaps' ? 'configmap' : 'secret')}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-[13px] font-medium"
          >
            <Plus className="w-4 h-4" />
            Create {activeTab === 'configmaps' ? 'ConfigMap' : 'Secret'}
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-border mb-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('configmaps')}
              className={`pb-3 text-[14px] font-medium border-b-2 transition-colors ${
                activeTab === 'configmaps'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              ConfigMaps ({configMaps.length})
            </button>
            <button
              onClick={() => setActiveTab('secrets')}
              className={`pb-3 text-[14px] font-medium border-b-2 transition-colors ${
                activeTab === 'secrets'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Secrets ({secrets.length})
            </button>
          </div>
        </div>

        {/* ConfigMaps Table */}
        {activeTab === 'configmaps' && (
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-8 py-4 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Namespace
                    </th>
                    <th className="px-6 py-4 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-[100px]">
                      Keys
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-8 py-4 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-[180px]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {configMaps.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-[13px] text-muted-foreground">
                        No ConfigMaps found
                      </td>
                    </tr>
                  ) : (
                    configMaps.map((config) => (
                      <tr key={config.name} className="group hover:bg-muted/20 transition-all duration-150">
                        <td className="px-8 py-6">
                          <div className="text-[15px] font-semibold text-foreground font-mono">{config.name}</div>
                        </td>
                        <td className="px-6 py-6">
                          <span className="text-[13px] text-muted-foreground font-mono">{config.namespace}</span>
                        </td>
                        <td className="px-6 py-6">
                          <div className="text-center">
                            <div className="text-[16px] font-semibold text-foreground">{config.keys}</div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">
                              {config.keys === 1 ? 'key' : 'keys'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <span className="text-[13px] text-muted-foreground">
                            {config.created ? new Date(config.created).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            }) : '-'}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleView('configmap', config)}
                              className="p-2 hover:bg-accent/50 rounded-lg transition-all duration-150 hover:scale-105 group/btn"
                              title="View details"
                            >
                              <Eye className="w-[17px] h-[17px] text-muted-foreground group-hover/btn:text-foreground transition-colors" />
                            </button>
                            <button
                              onClick={() => handleEdit('configmap', config)}
                              className="p-2 hover:bg-accent/50 rounded-lg transition-all duration-150 hover:scale-105 group/btn"
                              title="Edit"
                            >
                              <Edit className="w-[17px] h-[17px] text-muted-foreground group-hover/btn:text-foreground transition-colors" />
                            </button>
                            <button
                              onClick={() => handleDelete('configmap', config.name)}
                              className="p-2 hover:bg-destructive/10 rounded-lg transition-all duration-150 hover:scale-105 group/btn"
                              title="Delete"
                              disabled={isPending}
                            >
                              <Trash className="w-[17px] h-[17px] text-muted-foreground group-hover/btn:text-destructive transition-colors" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Secrets Table */}
        {activeTab === 'secrets' && (
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-8 py-4 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Namespace
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-[100px]">
                      Keys
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-8 py-4 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-[180px]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {secrets.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-[13px] text-muted-foreground">
                        No Secrets found
                      </td>
                    </tr>
                  ) : (
                    secrets.map((secret) => (
                      <tr key={secret.name} className="group hover:bg-muted/20 transition-all duration-150">
                        <td className="px-8 py-6">
                          <div className="text-[15px] font-semibold text-foreground font-mono">{secret.name}</div>
                        </td>
                        <td className="px-6 py-6">
                          <span className="text-[13px] text-muted-foreground font-mono">{secret.namespace}</span>
                        </td>
                        <td className="px-6 py-6">
                          <span className="text-[12px] text-muted-foreground bg-muted/30 px-2 py-1 rounded font-mono">{secret.type}</span>
                        </td>
                        <td className="px-6 py-6">
                          <div className="text-center">
                            <div className="text-[16px] font-semibold text-foreground">{secret.keys}</div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">
                              {secret.keys === 1 ? 'key' : 'keys'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <span className="text-[13px] text-muted-foreground">
                            {secret.created ? new Date(secret.created).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            }) : '-'}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleView('secret', secret)}
                              className="p-2 hover:bg-accent/50 rounded-lg transition-all duration-150 hover:scale-105 group/btn"
                              title="View details"
                            >
                              <Eye className="w-[17px] h-[17px] text-muted-foreground group-hover/btn:text-foreground transition-colors" />
                            </button>
                            <button
                              onClick={() => handleEdit('secret', secret)}
                              className="p-2 hover:bg-accent/50 rounded-lg transition-all duration-150 hover:scale-105 group/btn"
                              title="Edit"
                            >
                              <Edit className="w-[17px] h-[17px] text-muted-foreground group-hover/btn:text-foreground transition-colors" />
                            </button>
                            <button
                              onClick={() => handleDelete('secret', secret.name)}
                              className="p-2 hover:bg-destructive/10 rounded-lg transition-all duration-150 hover:scale-105 group/btn"
                              title="Delete"
                              disabled={isPending}
                            >
                              <Trash className="w-[17px] h-[17px] text-muted-foreground group-hover/btn:text-destructive transition-colors" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* View Modal */}
        {viewModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-xl shadow-2xl max-w-3xl w-full max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div>
                  <h2 className="text-[18px] font-semibold text-foreground">
                    {viewModal.type === 'configmap' ? 'ConfigMap' : 'Secret'} Details
                  </h2>
                  <p className="text-[13px] text-muted-foreground mt-1 font-mono">{viewModal.item.name}</p>
                </div>
                <button
                  onClick={() => {
                    setViewModal(null);
                    setShowSecretValues({});
                  }}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  {Object.entries(viewModal.item.data).map(([key, value]) => (
                    <div key={key} className="border border-border rounded-lg p-4 bg-muted/20">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-[13px] font-semibold text-foreground font-mono">{key}</div>
                        {viewModal.type === 'secret' && (
                          <button
                            onClick={() => setShowSecretValues(prev => ({ ...prev, [key]: !prev[key] }))}
                            className="p-1.5 hover:bg-muted rounded transition-colors"
                            title={showSecretValues[key] ? 'Hide value' : 'Show value'}
                          >
                            {showSecretValues[key] ? (
                              <EyeOff className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <Eye className="w-4 h-4 text-muted-foreground" />
                            )}
                          </button>
                        )}
                      </div>
                      <pre className="text-[12px] text-muted-foreground bg-background p-3 rounded border border-border overflow-x-auto font-mono whitespace-pre-wrap break-words">
                        {viewModal.type === 'secret' && !showSecretValues[key] ? '••••••••' : value}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 p-6 border-t border-border">
                <button
                  onClick={() => {
                    setViewModal(null);
                    setShowSecretValues({});
                  }}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-[13px] font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-xl shadow-2xl max-w-3xl w-full max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div>
                  <h2 className="text-[18px] font-semibold text-foreground">
                    Edit {editModal.type === 'configmap' ? 'ConfigMap' : 'Secret'}
                  </h2>
                  <p className="text-[13px] text-muted-foreground mt-1 font-mono">{editModal.item.name}</p>
                </div>
                <button
                  onClick={() => setEditModal(null)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
                    <p className="text-[13px] text-destructive">{error}</p>
                  </div>
                )}
                <div className="space-y-4">
                  {Object.entries(editModal.data).map(([key, value]) => (
                    <div key={key} className="border border-border rounded-lg p-4">
                      <label className="text-[13px] font-semibold text-foreground mb-2 block font-mono">{key}</label>
                      <textarea
                        value={value}
                        onChange={(e) => {
                          setEditModal({
                            ...editModal,
                            data: { ...editModal.data, [key]: e.target.value }
                          });
                        }}
                        rows={3}
                        className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors font-mono resize-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 p-6 border-t border-border">
                <button
                  onClick={() => setEditModal(null)}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-[13px] font-medium"
                  disabled={isPending}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isPending}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-[13px] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  {isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Modal */}
        {createModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-xl shadow-2xl max-w-3xl w-full max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div>
                  <h2 className="text-[18px] font-semibold text-foreground">
                    Create {createModal.type === 'configmap' ? 'ConfigMap' : 'Secret'}
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setCreateModal(null);
                    setError(null);
                  }}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
                    <p className="text-[13px] text-destructive">{error}</p>
                  </div>
                )}
                <div className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className="text-[13px] font-semibold text-foreground mb-2 block">
                      Name <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      value={createModal.name}
                      onChange={(e) => setCreateModal({ ...createModal, name: e.target.value })}
                      placeholder="my-config"
                      className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors font-mono"
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">Must be lowercase alphanumeric with hyphens</p>
                  </div>

                  {/* Secret Type */}
                  {createModal.type === 'secret' && (
                    <div>
                      <label className="text-[13px] font-semibold text-foreground mb-2 block">Secret Type</label>
                      <select
                        value={createModal.secretType}
                        onChange={(e) => setCreateModal({ ...createModal, secretType: e.target.value })}
                        className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors"
                      >
                        <option value="Opaque">Opaque</option>
                        <option value="kubernetes.io/dockerconfigjson">kubernetes.io/dockerconfigjson</option>
                        <option value="kubernetes.io/tls">kubernetes.io/tls</option>
                        <option value="kubernetes.io/ssh-auth">kubernetes.io/ssh-auth</option>
                        <option value="kubernetes.io/basic-auth">kubernetes.io/basic-auth</option>
                      </select>
                    </div>
                  )}

                  {/* Data Key-Value Pairs */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-[13px] font-semibold text-foreground">
                        Data <span className="text-destructive">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setCreateModal({
                          ...createModal,
                          data: [...createModal.data, { key: '', value: '' }]
                        })}
                        className="flex items-center gap-1 px-2 py-1 text-[12px] text-primary hover:bg-primary/10 rounded transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        Add Key
                      </button>
                    </div>
                    <div className="space-y-3">
                      {createModal.data.map((item, index) => (
                        <div key={index} className="border border-border rounded-lg p-3">
                          <div className="flex gap-2 mb-2">
                            <div className="flex-1">
                              <label className="text-[11px] text-muted-foreground mb-1 block">Key</label>
                              <input
                                type="text"
                                value={item.key}
                                onChange={(e) => {
                                  const newData = [...createModal.data];
                                  newData[index].key = e.target.value;
                                  setCreateModal({ ...createModal, data: newData });
                                }}
                                placeholder="key-name"
                                className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors font-mono"
                              />
                            </div>
                            {createModal.data.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newData = createModal.data.filter((_, i) => i !== index);
                                  setCreateModal({ ...createModal, data: newData });
                                }}
                                className="p-2 hover:bg-muted rounded transition-colors mt-5"
                              >
                                <X className="w-4 h-4 text-muted-foreground" />
                              </button>
                            )}
                          </div>
                          <div>
                            <label className="text-[11px] text-muted-foreground mb-1 block">Value</label>
                            <textarea
                              value={item.value}
                              onChange={(e) => {
                                const newData = [...createModal.data];
                                newData[index].value = e.target.value;
                                setCreateModal({ ...createModal, data: newData });
                              }}
                              placeholder="value"
                              rows={3}
                              className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors font-mono resize-none"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 p-6 border-t border-border">
                <button
                  onClick={() => {
                    setCreateModal(null);
                    setError(null);
                  }}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-[13px] font-medium"
                  disabled={isPending}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCreate}
                  disabled={isPending || !createModal.name.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-[13px] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  {isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
