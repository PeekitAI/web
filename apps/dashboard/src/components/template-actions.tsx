'use client';

import { Copy, Edit, Trash } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { deleteJobTemplate } from '@/actions/templates';
import { toast } from 'sonner';

interface TemplateActionsProps {
  templateName: string;
}

export function TemplateActions({ templateName }: TemplateActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDuplicate = () => {
    router.push(`/templates/new?duplicate=${templateName}`);
  };

  const handleDelete = async () => {
    if (isDeleting) return;

    if (!confirm(`Are you sure you want to delete the template "${templateName}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteJobTemplate(templateName);
      if (result.success) {
        toast.success('Template deleted successfully');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to delete template');
      }
    } catch (error) {
      toast.error('Failed to delete template');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-0.5">
      <button
        onClick={handleDuplicate}
        className="p-2 hover:bg-accent/50 rounded-lg transition-all duration-150 hover:scale-105 group/btn"
        title="Duplicate"
      >
        <Copy className="w-[17px] h-[17px] text-muted-foreground group-hover/btn:text-foreground transition-colors" />
      </button>
      <Link
        href={`/templates/${templateName}/edit`}
        className="p-2 hover:bg-accent/50 rounded-lg transition-all duration-150 hover:scale-105 group/btn"
        title="Edit template"
      >
        <Edit className="w-[17px] h-[17px] text-muted-foreground group-hover/btn:text-foreground transition-colors" />
      </Link>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="p-2 hover:bg-destructive/10 rounded-lg transition-all duration-150 hover:scale-105 group/btn disabled:opacity-50 disabled:cursor-not-allowed"
        title="Delete"
      >
        <Trash className="w-[17px] h-[17px] text-muted-foreground group-hover/btn:text-destructive transition-colors" />
      </button>
    </div>
  );
}
