'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, FolderKanban, Loader2, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useProjectStore } from '@/store';
import { projectService } from '@/services/project.service';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store';
import { getProjectStatusConfig, formatDate, getInitials, truncate } from '@/lib/utils';
import { ProjectModal } from '@/components/projects/ProjectModal';
import Link from 'next/link';
import { Project } from '@/types';

const stagger = { show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

export default function ProjectsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const { projects, isLoading, setProjects, setLoading } = useProjectStore();
  const { user } = useAuthStore();
  const { toast } = useToast();

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await projectService.getAll(params);
      setProjects(res.data.projects, res.data.pagination);
    } catch {
      toast({ title: 'Failed to load projects', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(loadProjects, 300);
    return () => clearTimeout(timer);
  }, [loadProjects]);

  const statusOptions = [
    { label: 'All', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Completed', value: 'completed' },
    { label: 'Archived', value: 'archived' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground text-sm mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        {user?.role === 'admin' && (
          <Button onClick={() => setShowModal(true)} className="gap-2 shadow-md shadow-primary/20">
            <Plus size={16} /> New Project
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search projects…" value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-9" />
        </div>
        <div className="flex gap-1.5">
          {statusOptions.map((opt) => (
            <Button key={opt.value} variant={statusFilter === opt.value ? 'default' : 'outline'}
              size="sm" onClick={() => setStatusFilter(opt.value)}
              className={statusFilter === opt.value ? '' : 'border-border/60'}>
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Projects grid */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState onNew={() => setShowModal(true)} canCreate={user?.role === 'admin'} />
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="show"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </motion.div>
      )}

      {/* Modal */}
      {showModal && (
        <ProjectModal
          onClose={() => setShowModal(false)}
          onSuccess={(project) => {
            useProjectStore.getState().addProject(project);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const status = getProjectStatusConfig(project.status);
  return (
    <motion.div variants={fadeUp}>
      <Link href={`/projects/${project._id}`}>
        <div className="bg-card border border-border rounded-2xl p-5 card-hover h-full flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <FolderKanban className="h-5 w-5 text-primary" />
            </div>
            <Badge className={`text-xs ${status.className}`}>{status.label}</Badge>
          </div>
          <h3 className="font-display font-bold text-foreground mb-1">{project.title}</h3>
          {project.description && (
            <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-2">{truncate(project.description, 80)}</p>
          )}
          <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
            <div className="flex -space-x-2">
              {project.members.slice(0, 4).map((member) => (
                <Avatar key={member._id} className="h-6 w-6 ring-2 ring-card">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-bold">
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {project.members.length > 4 && (
                <div className="h-6 w-6 rounded-full bg-muted ring-2 ring-card flex items-center justify-center">
                  <span className="text-[9px] font-bold text-muted-foreground">+{project.members.length - 4}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar size={11} />
              {formatDate(project.createdAt)}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function EmptyState({ onNew, canCreate }: { onNew: () => void; canCreate?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
        <FolderKanban className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-display font-bold text-lg text-foreground mb-2">No projects yet</h3>
      <p className="text-muted-foreground text-sm mb-6 max-w-sm">
        {canCreate ? 'Create your first project to get started with TaskManager.' : 'You have no assigned projects yet. Ask an admin to add you.'}
      </p>
      {canCreate && (
        <Button onClick={onNew} className="gap-2"><Plus size={16} /> Create Project</Button>
      )}
    </div>
  );
}