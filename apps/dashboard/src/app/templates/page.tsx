import { Plus, Eye, Play, Clock } from 'lucide-react';
import { IconTemplate } from '@tabler/icons-react';
import Link from 'next/link';
import { getJobTemplates } from '@/actions';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { TemplateActions } from '@/components/template-actions';

export default async function TemplatesPage() {
  const templates = await getJobTemplates();

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-[1200px] mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-[22px] font-semibold text-foreground tracking-tight">Job Templates</h1>
            <p className="text-[13px] text-muted-foreground mt-1.5">Create and manage reusable job templates.</p>
          </div>
          <Link
            href="/templates/new"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-[13px] font-medium"
          >
            <Plus className="w-4 h-4" />
            New Template
          </Link>
        </div>

        {templates.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <IconTemplate />
                </EmptyMedia>
                <EmptyTitle>No Job Templates Yet</EmptyTitle>
                <EmptyDescription>
                  You haven't created any job templates yet. Get started by creating
                  your first template.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent className="flex-row justify-center gap-2">
                <Button asChild>
                  <Link href="/templates/new">Create Template</Link>
                </Button>
              </EmptyContent>
            </Empty>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-8 py-4 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-[240px]">
                      Template
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-[140px]">
                      Category
                    </th>
                    <th className="px-6 py-4 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-[100px]">
                      Variables
                    </th>
                    <th className="px-8 py-4 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-[240px]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {templates.map((template) => {
                    const categoryColors = {
                      'Social Media': 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200/50 dark:border-blue-500/30',
                      'Advertising': 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200/50 dark:border-purple-500/30',
                    } as const;

                    const categoryColor = categoryColors[template.data.category as keyof typeof categoryColors] ||
                      'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-200/50 dark:border-gray-500/30';

                    return (
                      <tr key={template.name} className="group hover:bg-muted/20 transition-all duration-150">
                        <td className="px-8 py-6">
                          <div className="space-y-1.5">
                            <div className="text-[15px] font-semibold text-foreground font-mono tracking-tight">
                              {template.name}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                              <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground/40"></span>
                              <span>
                                {template.created ? new Date(template.created).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                }) : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="text-[13px] text-muted-foreground leading-relaxed max-w-lg">
                            {template.data.description || 'No description'}
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-[12px] font-medium border ${categoryColor} whitespace-nowrap`}>
                              {template.data.category || 'Uncategorized'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="text-center">
                            <div className="text-[16px] font-semibold text-foreground">
                              {template.data.variables?.length || 0}
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">
                              {template.data.variables?.length === 1 ? 'variable' : 'variables'}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center justify-end gap-1">
                            <div className="flex items-center gap-0.5 mr-2">
                              <Link
                                href={`/templates/${template.name}`}
                                className="p-2 hover:bg-accent/50 rounded-lg transition-all duration-150 hover:scale-105 group/btn"
                                title="View details"
                              >
                                <Eye className="w-[17px] h-[17px] text-muted-foreground group-hover/btn:text-foreground transition-colors" />
                              </Link>
                              <Link
                                href={`/jobs/new?template=${template.name}`}
                                className="p-2 hover:bg-primary/10 rounded-lg transition-all duration-150 hover:scale-105 group/btn"
                                title="Run one-time job"
                              >
                                <Play className="w-[17px] h-[17px] text-muted-foreground group-hover/btn:text-primary transition-colors" />
                              </Link>
                              <Link
                                href={`/cronjobs/new?template=${template.name}`}
                                className="p-2 hover:bg-primary/10 rounded-lg transition-all duration-150 hover:scale-105 group/btn"
                                title="Create scheduled job"
                              >
                                <Clock className="w-[17px] h-[17px] text-muted-foreground group-hover/btn:text-primary transition-colors" />
                              </Link>
                            </div>
                            <div className="w-px h-5 bg-border/50 mx-1"></div>
                            <TemplateActions templateName={template.name} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
