export default function SettingsPage() {
  return (
    <div className="min-h-full bg-background">
      <div className="max-w-[900px] mx-auto px-8 py-12">
        <div className="mb-8">
          <h1 className="text-[22px] font-semibold text-foreground tracking-tight">Settings</h1>
          <p className="text-[13px] text-muted-foreground mt-1.5">Manage your portal settings and preferences.</p>
        </div>

        <div className="space-y-6">
          {/* Kubernetes Configuration */}
          <div className="bg-card border border-border p-6 rounded-lg">
            <h2 className="text-[14px] font-semibold text-foreground mb-4">Kubernetes Configuration</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[12px] text-muted-foreground mb-2 block">Default Namespace</label>
                <input
                  type="text"
                  defaultValue="crawling-jobs"
                  className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors font-mono"
                />
                <p className="text-[11px] text-muted-foreground mt-1">The default namespace for creating jobs and cronjobs</p>
              </div>
              <div>
                <label className="text-[12px] text-muted-foreground mb-2 block">Cluster Context</label>
                <select className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors">
                  <option>production-cluster</option>
                  <option>staging-cluster</option>
                  <option>development-cluster</option>
                </select>
              </div>
            </div>
          </div>

          {/* Default Resource Limits */}
          <div className="bg-card border border-border p-6 rounded-lg">
            <h2 className="text-[14px] font-semibold text-foreground mb-4">Default Resource Limits</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[12px] text-muted-foreground mb-2 block">CPU Request</label>
                <input
                  type="text"
                  defaultValue="100m"
                  className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors font-mono"
                />
              </div>
              <div>
                <label className="text-[12px] text-muted-foreground mb-2 block">CPU Limit</label>
                <input
                  type="text"
                  defaultValue="1000m"
                  className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors font-mono"
                />
              </div>
              <div>
                <label className="text-[12px] text-muted-foreground mb-2 block">Memory Request</label>
                <input
                  type="text"
                  defaultValue="128Mi"
                  className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors font-mono"
                />
              </div>
              <div>
                <label className="text-[12px] text-muted-foreground mb-2 block">Memory Limit</label>
                <input
                  type="text"
                  defaultValue="512Mi"
                  className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors font-mono"
                />
              </div>
            </div>
          </div>

          {/* Container Registry */}
          <div className="bg-card border border-border p-6 rounded-lg">
            <h2 className="text-[14px] font-semibold text-foreground mb-4">Container Registry</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[12px] text-muted-foreground mb-2 block">Default Registry</label>
                <input
                  type="text"
                  placeholder="ghcr.io/org"
                  className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors font-mono"
                />
              </div>
              <div>
                <label className="text-[12px] text-muted-foreground mb-2 block">Image Pull Policy</label>
                <select className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors">
                  <option value="Always">Always</option>
                  <option value="IfNotPresent">IfNotPresent</option>
                  <option value="Never">Never</option>
                </select>
              </div>
            </div>
          </div>

          {/* Job Settings */}
          <div className="bg-card border border-border p-6 rounded-lg">
            <h2 className="text-[14px] font-semibold text-foreground mb-4">Default Job Settings</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[12px] text-muted-foreground mb-2 block">Backoff Limit</label>
                <input
                  type="number"
                  defaultValue="3"
                  className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="text-[12px] text-muted-foreground mb-2 block">TTL After Finished (seconds)</label>
                <input
                  type="number"
                  defaultValue="3600"
                  className="w-full px-3 py-2 border border-input rounded-lg text-[13px] bg-background focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-[13px] font-medium"
            >
              Reset to Defaults
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-[13px] font-medium"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
