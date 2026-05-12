'use client';

import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { projectService } from '@/services/project.service';
import { Project } from '@/types';

interface ProjectModalProps {
  onClose: () => void;
  onSuccess: (project: Project) => void;
}

export function ProjectModal({ onClose, onSuccess }: ProjectModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({
        title: 'Project title is required',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
const res = await projectService.create({
  title: title.trim(),
  description: description.trim(),
  status: 'active', // or 'todo' depending on your system
});

      toast({
        title: 'Project created successfully',
      });

      onSuccess(res.data.project);
    } catch (err) {
      toast({
        title: 'Failed to create project',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-xl p-6 relative animate-fade-in">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <h2 className="font-display text-xl font-bold text-foreground mb-1">
          Create Project
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Add a new project to your workspace
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Title */}
          <div>
            <label className="text-sm font-medium text-foreground">
              Project Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Marketing Website"
              className="mt-1"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-foreground">
              Description (optional)
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the project..."
              className="mt-1 resize-none"
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={loading} className="gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Create
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}