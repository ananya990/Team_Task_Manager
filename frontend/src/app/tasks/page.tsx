'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Loader2, CheckSquare, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { taskService } from '@/services/task.service';
import { projectService } from '@/services/project.service';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store';
import { getStatusConfig, getPriorityConfig, getInitials, formatDueDate } from '@/lib/utils';
import { Task, TaskStatus, TaskPriority } from '@/types';
import { TaskModal } from '@/components/tasks/TaskModal';
import { useSearchParams } from 'next/navigation';

const STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: 'All', value: '' },
  { label: 'To Do', value: 'todo' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Review', value: 'review' },
  { label: 'Completed', value: 'completed' },
];
const PRIORITY_OPTIONS: { label: string; value: string }[] = [
  { label: 'All', value: '' },
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Urgent', value: 'urgent' },
];

export default function TasksPage() {
  const searchParams = useSearchParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuthStore();
  const { toast } = useToast();

  const loadProjects = useCallback(async () => {
    try {
      const res = await projectService.getAll({ limit: '100' });
      setProjects(res.data.projects);
    } catch {}
  }, []);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      const res = await taskService.getAll(params);
      setTasks(res.data.tasks);
    } catch {
      toast({ title: 'Failed to load tasks', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, priorityFilter]);

  useEffect(() => { loadProjects(); }, []);
  useEffect(() => {
    const t = setTimeout(loadTasks, 300);
    return () => clearTimeout(t);
  }, [loadTasks]);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const res = await taskService.update(taskId, { status: newStatus });
      setTasks((prev) => prev.map((t) => t._id === taskId ? res.data.task : t));
    } catch { toast({ title: 'Failed to update', variant: 'destructive' }); }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await taskService.delete(taskId);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      toast({ title: 'Task deleted' });
    } catch { toast({ title: 'Failed to delete', variant: 'destructive' }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Tasks</h1>
          <p className="text-muted-foreground text-sm mt-1">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
        </div>
        {user?.role === 'admin' && (
          <Button onClick={() => setShowModal(true)} className="gap-2 shadow-md shadow-primary/20">
            <Plus size={16} /> New Task
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search tasks…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground self-center">Status:</span>
          {STATUS_OPTIONS.map((opt) => (
            <Button key={opt.value} variant={statusFilter === opt.value ? 'default' : 'outline'} size="sm"
              onClick={() => setStatusFilter(opt.value)} className={`h-7 text-xs ${statusFilter !== opt.value ? 'border-border/60' : ''}`}>
              {opt.label}
            </Button>
          ))}
          <span className="text-xs text-muted-foreground self-center ml-2">Priority:</span>
          {PRIORITY_OPTIONS.map((opt) => (
            <Button key={opt.value} variant={priorityFilter === opt.value ? 'default' : 'outline'} size="sm"
              onClick={() => setPriorityFilter(opt.value)} className={`h-7 text-xs ${priorityFilter !== opt.value ? 'border-border/60' : ''}`}>
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Task list */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mb-4">
            <CheckSquare className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="font-display font-bold text-lg text-foreground mb-1">No tasks found</h3>
          <p className="text-muted-foreground text-sm">Try adjusting your filters or create a new task.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-muted/50 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <div className="col-span-4">Task</div>
            <div className="col-span-2">Project</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1">Priority</div>
            <div className="col-span-2">Assignee</div>
            <div className="col-span-1">Due</div>
          </div>
          {tasks.map((task) => {
            const status = getStatusConfig(task.status);
            const priority = getPriorityConfig(task.priority);
            const due = task.dueDate ? formatDueDate(task.dueDate) : null;
            const project = task.project as any;
            return (
              <motion.div key={task._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-border last:border-0 hover:bg-muted/20 transition-colors items-center group">
                <div className="col-span-4">
                  <p className="text-sm font-medium text-foreground">{task.title}</p>
                  {task.tags?.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {task.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="col-span-2 text-xs text-muted-foreground truncate">{project?.title || '—'}</div>
                <div className="col-span-2">
                  <select value={task.status}
                    onChange={(e) => handleStatusChange(task._id, e.target.value as TaskStatus)}
                    className="text-xs bg-transparent border-none outline-none cursor-pointer">
                    {STATUS_OPTIONS.filter((o) => o.value).map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-1"><Badge className={`text-[10px] px-1.5 py-0.5 ${priority.className}`}>{priority.label}</Badge></div>
                <div className="col-span-2">
                  {task.assignedTo ? (
                    <div className="flex items-center gap-1.5">
                      <Avatar className="h-5 w-5"><AvatarImage src={(task.assignedTo as any).avatar} /><AvatarFallback className="text-[8px]">{getInitials((task.assignedTo as any).name)}</AvatarFallback></Avatar>
                      <span className="text-xs text-muted-foreground truncate">{(task.assignedTo as any).name?.split(' ')[0]}</span>
                    </div>
                  ) : <span className="text-xs text-muted-foreground">—</span>}
                </div>
                <div className="col-span-1">
                  {due ? <span className={`text-xs ${due.isOverdue ? 'text-rose-500 font-medium' : due.isUrgent ? 'text-amber-500' : 'text-muted-foreground'}`}>{due.text}</span>
                    : <span className="text-xs text-muted-foreground">—</span>}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {showModal && (
        <TaskModal
          projectId={projects[0]?._id || ''}
          defaultStatus="todo"
          onClose={() => setShowModal(false)}
          onSuccess={(task) => { setTasks((p) => [task, ...p]); setShowModal(false); }}
          members={[]}
        />
      )}
    </div>
  );
}