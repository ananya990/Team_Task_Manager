'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Plus, Settings, Users, Loader2, MoreHorizontal,
  CheckCircle2, Circle, Clock, Eye, FolderKanban, Trash2, Edit,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { projectService } from '@/services/project.service';
import { taskService } from '@/services/task.service';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store';
import { getStatusConfig, getPriorityConfig, getInitials, formatDate, formatDueDate } from '@/lib/utils';
import { Task, TaskStatus, Project } from '@/types';
import { TaskModal } from '@/components/tasks/TaskModal';
import { TaskCard } from '@/components/tasks/TaskCard';
import { getProjectStatusConfig } from '@/lib/utils';
import Link from 'next/link';

const COLUMNS: { id: TaskStatus; label: string; icon: any; color: string }[] = [
  { id: 'todo', label: 'To Do', icon: Circle, color: 'text-slate-500' },
  { id: 'in_progress', label: 'In Progress', icon: Clock, color: 'text-blue-500' },
  { id: 'review', label: 'Review', icon: Eye, color: 'text-amber-500' },
  { id: 'completed', label: 'Completed', icon: CheckCircle2, color: 'text-emerald-500' },
];

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [activeColumn, setActiveColumn] = useState<TaskStatus | null>(null);
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const { user } = useAuthStore();
  const { toast } = useToast();

  const load = useCallback(async () => {
    try {
      const [projRes, taskRes] = await Promise.all([
        projectService.getById(id),
        taskService.getAll({ project: id, limit: '100' }),
      ]);
      setProject(projRes.data.project);
      setTasks(taskRes.data.tasks);
    } catch {
      toast({ title: 'Failed to load project', variant: 'destructive' });
      router.push('/projects');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleTaskStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const res = await taskService.update(taskId, { status: newStatus });
      setTasks((prev) => prev.map((t) => t._id === taskId ? res.data.task : t));
    } catch {
      toast({ title: 'Failed to update task', variant: 'destructive' });
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      await taskService.delete(taskId);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      toast({ title: 'Task deleted' });
    } catch {
      toast({ title: 'Failed to delete task', variant: 'destructive' });
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!project) return null;

  const tasksByStatus = COLUMNS.reduce((acc, col) => {
    acc[col.id] = tasks.filter((t) => t.status === col.id);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

const canManage = 
  user?.role === 'admin' || 
  (typeof project.owner === 'string' ? project.owner === user?._id : project.owner?._id === user?._id);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <Link href="/projects">
          <Button variant="ghost" size="sm" className="h-8 w-8 flex-shrink-0">
            <ArrowLeft size={16} />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <FolderKanban size={16} className="text-primary" />
            </div>
            <h1 className="font-display text-xl font-bold text-foreground">{project.title}</h1>
            <Badge className={`text-xs ${getProjectStatusConfig(project.status).className}`}>
              {getProjectStatusConfig(project.status).label}
            </Badge>
          </div>
          {project.description && (
            <p className="text-sm text-muted-foreground mt-2 ml-11">{project.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Members avatars */}
          <div className="flex -space-x-2">
            {project.members.slice(0, 5).map((m) => (
              <Avatar key={m._id} className="h-7 w-7 ring-2 ring-background">
                <AvatarImage src={m.avatar} />
                <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">{getInitials(m.name)}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          {canManage && (
            <Button onClick={() => { setActiveColumn('todo'); setShowTaskModal(true); }} size="sm" className="gap-1.5 shadow-sm shadow-primary/20">
              <Plus size={14} /> Add Task
            </Button>
          )}
        </div>
      </div>

      {/* View toggle & stats */}
      <div className="flex items-center gap-4">
        <div className="flex bg-muted rounded-lg p-1 gap-0.5">
          {(['kanban', 'list'] as const).map((v) => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${view === v ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              {v}
            </button>
          ))}
        </div>
        <div className="flex gap-3 text-xs text-muted-foreground">
          {COLUMNS.map((col) => (
            <span key={col.id}><span className="font-semibold text-foreground">{tasksByStatus[col.id].length}</span> {col.label}</span>
          ))}
        </div>
      </div>

      {/* Kanban Board */}
      {view === 'kanban' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 pb-4">
          {COLUMNS.map((col) => {
            const colTasks = tasksByStatus[col.id];
            const Icon = col.icon;
            return (
              <div key={col.id} className="flex flex-col min-h-64">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon size={15} className={col.color} />
                    <span className="text-sm font-semibold text-foreground">{col.label}</span>
                    <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full font-medium">{colTasks.length}</span>
                  </div>
                  {canManage && (
                    <button onClick={() => { setActiveColumn(col.id); setShowTaskModal(true); }}
                      className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                      <Plus size={13} />
                    </button>
                  )}
                </div>
                <div className="flex-1 space-y-2.5">
                  {colTasks.map((task) => (
                    <TaskCard key={task._id} task={task}
                      onStatusChange={(s) => handleTaskStatusChange(task._id, s)}
                      onDelete={() => handleTaskDelete(task._id)}
                      canEdit={canManage || task.createdBy?._id === user?._id || (task.assignedTo as any)?._id === user?._id}
                      onUpdate={(updated) => setTasks((prev) => prev.map((t) => t._id === updated._id ? updated : t))}
                      projectId={id}
                    />
                  ))}
                  {colTasks.length === 0 && (
                    <div className="border-2 border-dashed border-border rounded-xl p-4 text-center">
                      <p className="text-xs text-muted-foreground">No tasks</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List view */
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="grid grid-cols-12 gap-3 px-4 py-2.5 bg-muted/50 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <div className="col-span-5">Task</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Priority</div>
            <div className="col-span-2">Assignee</div>
            <div className="col-span-1">Due</div>
          </div>
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <CheckCircle2 className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-sm">No tasks yet</p>
            </div>
          ) : (
            tasks.map((task) => {
              const status = getStatusConfig(task.status);
              const priority = getPriorityConfig(task.priority);
              const due = task.dueDate ? formatDueDate(task.dueDate) : null;
              return (
                <div key={task._id} className="grid grid-cols-12 gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-muted/30 transition-colors items-center">
                  <div className="col-span-5">
                    <p className="text-sm font-medium text-foreground">{task.title}</p>
                    {task.description && <p className="text-xs text-muted-foreground truncate mt-0.5">{task.description}</p>}
                  </div>
                  <div className="col-span-2"><Badge className={`text-xs ${status.className}`}>{status.label}</Badge></div>
                  <div className="col-span-2"><Badge className={`text-xs ${priority.className}`}>{priority.label}</Badge></div>
                  <div className="col-span-2">
                    {task.assignedTo ? (
                      <div className="flex items-center gap-1.5">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={(task.assignedTo as any).avatar} />
                          <AvatarFallback className="text-[8px]">{getInitials((task.assignedTo as any).name)}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground truncate">{(task.assignedTo as any).name?.split(' ')[0]}</span>
                      </div>
                    ) : <span className="text-xs text-muted-foreground">Unassigned</span>}
                  </div>
                  <div className="col-span-1">
                    {due ? (
                      <span className={`text-xs font-medium ${due.isOverdue ? 'text-rose-500' : due.isUrgent ? 'text-amber-500' : 'text-muted-foreground'}`}>
                        {due.text}
                      </span>
                    ) : <span className="text-xs text-muted-foreground">—</span>}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Task modal */}
      {showTaskModal && (
        <TaskModal
          projectId={id}
          defaultStatus={activeColumn || 'todo'}
          onClose={() => { setShowTaskModal(false); setActiveColumn(null); }}
          onSuccess={(task) => {
            setTasks((prev) => [...prev, task]);
            setShowTaskModal(false);
          }}
          members={project.members}
        />
      )}
    </div>
  );
}