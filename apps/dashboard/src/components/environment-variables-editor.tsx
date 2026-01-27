'use client';

import { Plus, X } from 'lucide-react';

export interface EnvVarEntry {
  key: string;
  type: 'value' | 'configMap' | 'secret';
  value?: string; // For direct value or mount path when mountAsFile is true
  configMapName?: string;
  secretName?: string;
  refKey?: string; // Key within ConfigMap/Secret when not mounting as file
  mountAsFile?: boolean;
  defaultValue?: string; // Template editor: default value for variables
  description?: string; // Template editor: description for variables
  subPath?: string; // Template editor: subpath for volume mounts
}

interface ConfigMap {
  name: string;
  data: Record<string, string>;
}

interface Secret {
  name: string;
  data: Record<string, string>;
}

interface TemplateVariable {
  key: string;
  defaultValue?: string;
  description?: string;
}

interface EnvironmentVariablesEditorProps {
  envVars: EnvVarEntry[];
  setEnvVars: (vars: EnvVarEntry[]) => void;
  configmaps: ConfigMap[];
  secrets: Secret[];
  templateVariables?: TemplateVariable[]; // Optional: for showing "from template" UI
  showTemplateInfo?: boolean;
  isTemplateEditor?: boolean; // Enable description and defaultValue editing
}

export default function EnvironmentVariablesEditor({
  envVars,
  setEnvVars,
  configmaps,
  secrets,
  templateVariables = [],
  showTemplateInfo = false,
  isTemplateEditor = false,
}: EnvironmentVariablesEditorProps) {
  const addEnvVar = () => {
    setEnvVars([...envVars, { key: '', type: 'value', value: '' }]);
  };

  const removeEnvVar = (index: number) => {
    setEnvVars(envVars.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-card border border-border p-6 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-[14px] font-semibold text-foreground">EnvVars and Configs</h2>
          {showTemplateInfo && templateVariables.length > 0 && (
            <p className="text-[11px] text-muted-foreground mt-1">
              Loaded {templateVariables.length} variable{templateVariables.length !== 1 ? 's' : ''} from template
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={addEnvVar}
          className="flex items-center gap-1 px-2 py-1 text-[12px] text-primary hover:bg-primary/10 rounded transition-colors"
        >
          <Plus className="w-3 h-3" />
          Add Variable
        </button>
      </div>
      <div className="space-y-4">
        {envVars.map((envVar, index) => {
          const templateVar = templateVariables.find(
            (v) => v.key === envVar.key
          );
          const isFromTemplate = !!templateVar;

          return (
            <div key={index} className="space-y-2 p-3 border border-border rounded-lg">
              {/* Key and Type */}
              <div className="flex gap-2 items-start">
                <div className="flex-1">
                  <label className="text-[11px] text-muted-foreground mb-1 block">Variable Name</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="KEY"
                      value={envVar.key}
                      onChange={(e) => {
                        const newEnvVars = [...envVars];
                        newEnvVars[index].key = e.target.value;
                        setEnvVars(newEnvVars);
                      }}
                      disabled={isFromTemplate}
                      required
                      className={`w-full px-3 py-2 border border-input rounded-lg text-[13px] focus:outline-none focus:border-primary transition-colors font-mono ${
                        isFromTemplate ? 'bg-muted/30 cursor-not-allowed' : 'bg-background'
                      }`}
                    />
                    {isFromTemplate && (
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap bg-muted px-2 py-1 rounded">
                        From template
                      </span>
                    )}
                  </div>
                </div>

                <div className="w-48">
                  <label className="text-[11px] text-muted-foreground mb-1 block">Value Type</label>
                  <select
                    value={envVar.type}
                    onChange={(e) => {
                      const newEnvVars = [...envVars];
                      newEnvVars[index].type = e.target.value as 'value' | 'configMap' | 'secret';
                      // Clear other fields when type changes
                      newEnvVars[index].value = '';
                      newEnvVars[index].configMapName = '';
                      newEnvVars[index].secretName = '';
                      newEnvVars[index].refKey = '';
                      setEnvVars(newEnvVars);
                    }}
                    className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="value">Direct Value</option>
                    <option value="configMap">ConfigMap</option>
                    <option value="secret">Secret</option>
                  </select>
                </div>

                {!isFromTemplate && envVars.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEnvVar(index)}
                    className="p-2 hover:bg-muted rounded transition-colors mt-5"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
              </div>

              {/* Value Fields */}
              {envVar.type === 'value' && (
                <div>
                  <label className="text-[11px] text-muted-foreground mb-1 block">Value</label>
                  <input
                    type="text"
                    placeholder="value"
                    value={envVar.value || ''}
                    onChange={(e) => {
                      const newEnvVars = [...envVars];
                      newEnvVars[index].value = e.target.value;
                      setEnvVars(newEnvVars);
                    }}
                    className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors font-mono"
                  />
                </div>
              )}

              {envVar.type === 'configMap' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`mount-as-file-${index}`}
                      checked={envVar.mountAsFile || false}
                      onChange={(e) => {
                        const newEnvVars = [...envVars];
                        newEnvVars[index].mountAsFile = e.target.checked;
                        if (e.target.checked) {
                          // Clear refKey when switching to file mount
                          newEnvVars[index].refKey = '';
                        }
                        setEnvVars(newEnvVars);
                      }}
                      className="rounded border-input"
                    />
                    <label htmlFor={`mount-as-file-${index}`} className="text-[11px] text-muted-foreground cursor-pointer">
                      Mount as file (entire ConfigMap)
                    </label>
                  </div>

                  <div className={envVar.mountAsFile ? "grid grid-cols-2 gap-2" : "grid grid-cols-2 gap-2"}>
                    <div>
                      <label className="text-[11px] text-muted-foreground mb-1 block">ConfigMap Name</label>
                      <select
                        value={envVar.configMapName || ''}
                        onChange={(e) => {
                          const newEnvVars = [...envVars];
                          newEnvVars[index].configMapName = e.target.value;
                          setEnvVars(newEnvVars);
                        }}
                        required
                        className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors"
                      >
                        <option value="">Select ConfigMap...</option>
                        {configmaps.map((cm) => (
                          <option key={cm.name} value={cm.name}>
                            {cm.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {envVar.mountAsFile ? (
                      <div>
                        <label className="text-[11px] text-muted-foreground mb-1 block">Mount Path</label>
                        <input
                          type="text"
                          placeholder="/mnt/configmaps/..."
                          value={envVar.value || ''}
                          onChange={(e) => {
                            const newEnvVars = [...envVars];
                            newEnvVars[index].value = e.target.value;
                            setEnvVars(newEnvVars);
                          }}
                          className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors font-mono"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="text-[11px] text-muted-foreground mb-1 block">Key</label>
                        <select
                          value={envVar.refKey || ''}
                          onChange={(e) => {
                            const newEnvVars = [...envVars];
                            newEnvVars[index].refKey = e.target.value;
                            setEnvVars(newEnvVars);
                          }}
                          required
                          disabled={!envVar.configMapName}
                          className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                        >
                          <option value="">Select Key...</option>
                          {envVar.configMapName &&
                            configmaps
                              .find((cm) => cm.name === envVar.configMapName)
                              ?.data &&
                            Object.keys(configmaps.find((cm) => cm.name === envVar.configMapName)!.data).map((key) => (
                              <option key={key} value={key}>
                                {key}
                              </option>
                            ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {isTemplateEditor && envVar.mountAsFile && (
                    <div>
                      <label className="text-[11px] text-muted-foreground mb-1 block">Subpath (optional)</label>
                      <input
                        type="text"
                        placeholder="file.json"
                        value={envVar.subPath || ''}
                        onChange={(e) => {
                          const newEnvVars = [...envVars];
                          newEnvVars[index].subPath = e.target.value;
                          setEnvVars(newEnvVars);
                        }}
                        className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors font-mono"
                      />
                    </div>
                  )}
                </div>
              )}

              {envVar.type === 'secret' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`mount-secret-as-file-${index}`}
                      checked={envVar.mountAsFile || false}
                      onChange={(e) => {
                        const newEnvVars = [...envVars];
                        newEnvVars[index].mountAsFile = e.target.checked;
                        if (e.target.checked) {
                          // Clear refKey when switching to file mount
                          newEnvVars[index].refKey = '';
                        }
                        setEnvVars(newEnvVars);
                      }}
                      className="rounded border-input"
                    />
                    <label htmlFor={`mount-secret-as-file-${index}`} className="text-[11px] text-muted-foreground cursor-pointer">
                      Mount as file (entire Secret)
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-muted-foreground mb-1 block">Secret Name</label>
                      <select
                        value={envVar.secretName || ''}
                        onChange={(e) => {
                          const newEnvVars = [...envVars];
                          newEnvVars[index].secretName = e.target.value;
                          setEnvVars(newEnvVars);
                        }}
                        required
                        className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors"
                      >
                        <option value="">Select Secret...</option>
                        {secrets.map((secret) => (
                          <option key={secret.name} value={secret.name}>
                            {secret.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {envVar.mountAsFile ? (
                      <div>
                        <label className="text-[11px] text-muted-foreground mb-1 block">Mount Path</label>
                        <input
                          type="text"
                          placeholder="/mnt/secrets/..."
                          value={envVar.value || ''}
                          onChange={(e) => {
                            const newEnvVars = [...envVars];
                            newEnvVars[index].value = e.target.value;
                            setEnvVars(newEnvVars);
                          }}
                          className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors font-mono"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="text-[11px] text-muted-foreground mb-1 block">Key</label>
                        <select
                          value={envVar.refKey || ''}
                          onChange={(e) => {
                            const newEnvVars = [...envVars];
                            newEnvVars[index].refKey = e.target.value;
                            setEnvVars(newEnvVars);
                          }}
                          required
                          disabled={!envVar.secretName}
                          className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                        >
                          <option value="">Select Key...</option>
                          {envVar.secretName &&
                            secrets
                              .find((s) => s.name === envVar.secretName)
                              ?.data &&
                            Object.keys(secrets.find((s) => s.name === envVar.secretName)!.data).map((key) => (
                              <option key={key} value={key}>
                                {key}
                              </option>
                            ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {isTemplateEditor && envVar.mountAsFile && (
                    <div>
                      <label className="text-[11px] text-muted-foreground mb-1 block">Subpath (optional)</label>
                      <input
                        type="text"
                        placeholder="file.json"
                        value={envVar.subPath || ''}
                        onChange={(e) => {
                          const newEnvVars = [...envVars];
                          newEnvVars[index].subPath = e.target.value;
                          setEnvVars(newEnvVars);
                        }}
                        className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors font-mono"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Template Editor Fields */}
              {isTemplateEditor && (
                <>
                  {envVar.type === 'value' && (
                    <div>
                      <label className="text-[11px] text-muted-foreground mb-1 block">Default Value (Optional)</label>
                      <input
                        type="text"
                        placeholder="Default value for this variable"
                        value={envVar.defaultValue || ''}
                        onChange={(e) => {
                          const newEnvVars = [...envVars];
                          newEnvVars[index].defaultValue = e.target.value;
                          setEnvVars(newEnvVars);
                        }}
                        className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors font-mono"
                      />
                    </div>
                  )}
                  <div>
                    <label className="text-[11px] text-muted-foreground mb-1 block">Description (Optional)</label>
                    <textarea
                      placeholder="Describe what this variable is used for"
                      value={envVar.description || ''}
                      onChange={(e) => {
                        const newEnvVars = [...envVars];
                        newEnvVars[index].description = e.target.value;
                        setEnvVars(newEnvVars);
                      }}
                      rows={2}
                      className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors resize-none"
                    />
                  </div>
                </>
              )}

              {!isTemplateEditor && templateVar?.description && (
                <p className="text-[11px] text-muted-foreground">
                  💡 {templateVar.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
