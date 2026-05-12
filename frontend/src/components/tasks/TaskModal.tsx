'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Loader2, Calendar, Tag, User as UserIcon,
  AlignLeft, Type, Flag, CheckSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { taskService } from '@/services/task.service';
import { useToast } from '@/hooks/use-toast';
import { Task, TaskStatus, TaskPriority, User } from '@/types';
import { cn } from '@/lib/utils';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Convert an ISO date string (from the DB) → "YYYY-MM-DD" for <input type="date">.
 * Returns "" when the value is absent or invalid.
 */
function isoToDateInput(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  // Use local date parts to avoid UTC-offset shifting the day
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Convert a "YYYY-MM-DD" date-input string → ISO string at LOCAL noon,
 * or null when the field is blank.
 *
 * Why noon?  Sending midnight local time can drift backward to the previous
 * day once JavaScript converts it to UTC for the JSON payload.
 */
function dateInputToISO(value: string | undefined): string | null {
  if (!value || value.trim() === '') return null;
  // Validate format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) return null;
  const [year, month, day] = value.trim().split('-').map(Number);
  const d = new Date(year, month - 1, day, 12, 0, 0); // local noon
  if (isNaN(d.getTime())) return null;
  return d.toISOString(); // safe ISO string the backend parses correctly
}

// ─── Zod schema (frontend only) ───────────────────────────────────────────────
const taskFormSchema = z.object({
  title:       z.string().min(3, 'Title must be at least 3 characters').max(300, 'Title is too long'),
  description: z.string().max(5000, 'Description too long').optional(),
  status:      z.enum(['todo', 'in_progress', 'review', 'completed']),
  priority:    z.enum(['low', 'medium', 'high', 'urgent']),
  // Raw HTML date input value ("YYYY-MM-DD") or ""
  dueDate:     z.string().optional(),
  // User _id or ""
  assignedTo:  z.string().optional(),
  // Comma-separated tags
  tagsRaw:     z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────
interface TaskModalProps {
  task?:          Task;          // present → edit mode
  projectId:      string;
  defaultStatus?: TaskStatus;
  members?:       User[];
  onClose:        () => void;
  onSuccess:      (task: Task) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'todo',        label: 'To Do'       },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review',      label: 'Review'      },
  { value: 'completed',   label: 'Completed'   },
];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'low',    label: 'Low'    },
  { value: 'medium', label: 'Medium' },
  { value: 'high',   label: 'High'   },
  { value: 'urgent', label: 'Urgent' },
];

// ─── Component ────────────────────────────────────────────────────────────────
export function TaskModal({
  task,
  projectId,
  defaultStatus = 'todo',
  members = [],
  onClose,
  onSuccess,
}: TaskModalProps) {
  const isEditing = Boolean(task);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Resolve assignedTo _id regardless of whether it's populated or raw
  const assignedToId =
    task?.assignedTo
      ? typeof task.assignedTo === 'string'
        ? task.assignedTo
        : (task.assignedTo as User)._id
      : '';

  const { register, handleSubmit, formState: { errors }, watch, setValue } =
    useForm<TaskFormValues>({
      resolver: zodResolver(taskFormSchema),
      defaultValues: {
        title:       task?.title       ?? '',
        description: task?.description ?? '',
        status:      task?.status      ?? defaultStatus,
        priority:    task?.priority    ?? 'medium',
        dueDate:     isoToDateInput(task?.dueDate),   // "" when absent
        assignedTo:  assignedToId,
        tagsRaw:     task?.tags?.join(', ') ?? '',
      },
    });

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const onSubmit = async (values: TaskFormValues) => {
    setIsLoading(true);
    try {
      // ── Build payload — coerce empty strings to null ───────────────────────
      const payload = {
        title:       values.title.trim(),
        description: values.description?.trim() || undefined,
        status:      values.status,
        priority:    values.priority,
        project:     projectId,
        // "" → null; "YYYY-MM-DD" → ISO string at local noon
        dueDate:     dateInputToISO(values.dueDate),
        // "" → null; non-empty → ObjectId string
        assignedTo:  values.assignedTo?.trim() || null,
        // "frontend, bug" → ["frontend", "bug"]
        tags: values.tagsRaw
          ? values.tagsRaw.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
      };

      let res;
      if (isEditing && task) {
        const { project: _unused, ...updatePayload } = payload; // project is immutable
        res = await taskService.update(task._id, updatePayload);
      } else {
        res = await taskService.create(payload);
      }

      toast({ title: isEditing ? 'Task updated ✓' : 'Task created ✓', description: payload.title });
      onSuccess(res.data.task);
    } catch (err: any) {
      const backendErrors = err?.response?.data?.errors;
      const backendMessage: string = err?.response?.data?.message ?? 'Please try again.';

      if (backendErrors) {
        const detail = Object.entries(backendErrors)
          .map(([f, msgs]) => `${f}: ${(msgs as string[]).join(', ')}`)
          .join('\n');
        toast({ title: backendMessage, description: detail, variant: 'destructive' });
      } else {
        toast({ title: 'Something went wrong', description: backendMessage, variant: 'destructive' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const selectedStatus   = watch('status');
  const selectedPriority = watch('priority');

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      />

      {/* Panel */}
      <motion.div
        key="modal"
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        exit={{    opacity: 0, scale: 0.96, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl shadow-black/20 overflow-hidden max-h-[90vh] flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center">
                <CheckSquare size={14} className="text-primary" />
              </div>
              <h2 className="font-display font-bold text-foreground">
                {isEditing ? 'Edit Task' : 'New Task'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X size={15} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto">
            <div className="px-6 py-5 space-y-5">

              {/* Title */}
              <div className="space-y-1.5">
                <Label htmlFor="title" className="flex items-center gap-1.5 text-sm font-medium">
                  <Type size={13} className="text-muted-foreground" />
                  Title <span className="text-destructive ml-0.5">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. Implement login page"
                  autoFocus
                  {...register('title')}
                  className={cn(errors.title && 'border-destructive focus-visible:ring-destructive')}
                />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="description" className="flex items-center gap-1.5 text-sm font-medium">
                  <AlignLeft size={13} className="text-muted-foreground" />
                  Description
                </Label>
                <textarea
                  id="description"
                  placeholder="Add more detail about this task…"
                  rows={3}
                  {...register('description')}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                />
              </div>

              {/* Status & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="grid grid-cols-2 gap-1">
                    {STATUS_OPTIONS.map((opt) => (
                      <button key={opt.value} type="button"
                        onClick={() => setValue('status', opt.value)}
                        className={cn(
                          'px-2 py-1.5 rounded-lg text-xs font-medium border transition-all text-center',
                          selectedStatus === opt.value
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                            : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                        )}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-sm font-medium">
                    <Flag size={13} className="text-muted-foreground" />
                    Priority
                  </Label>
                  <div className="grid grid-cols-2 gap-1">
                    {PRIORITY_OPTIONS.map((opt) => (
                      <button key={opt.value} type="button"
                        onClick={() => setValue('priority', opt.value)}
                        className={cn(
                          'px-2 py-1.5 rounded-lg text-xs font-medium border transition-all text-center',
                          selectedPriority === opt.value
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                            : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                        )}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Due Date & Assignee */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="dueDate" className="flex items-center gap-1.5 text-sm font-medium">
                    <Calendar size={13} className="text-muted-foreground" />
                    Due Date
                  </Label>
                  <Input
                    id="dueDate"
                    type="date"
                    {...register('dueDate')}
                    className="text-sm"
                  />
                  {/* Clear button */}
                  {watch('dueDate') && (
                    <button type="button" onClick={() => setValue('dueDate', '')}
                      className="text-xs text-muted-foreground hover:text-destructive transition-colors">
                      Clear date
                    </button>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="assignedTo" className="flex items-center gap-1.5 text-sm font-medium">
                    <UserIcon size={13} className="text-muted-foreground" />
                    Assignee
                  </Label>
                  <select
                    id="assignedTo"
                    {...register('assignedTo')}
                    className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Unassigned</option>
                    {members.map((m) => (
                      <option key={m._id} value={m._id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <Label htmlFor="tagsRaw" className="flex items-center gap-1.5 text-sm font-medium">
                  <Tag size={13} className="text-muted-foreground" />
                  Tags
                  <span className="text-muted-foreground font-normal">(comma-separated)</span>
                </Label>
                <Input
                  id="tagsRaw"
                  placeholder="frontend, bug, design"
                  {...register('tagsRaw')}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="gap-2 min-w-[110px] shadow-md shadow-primary/20"
              >
                {isLoading
                  ? <Loader2 size={14} className="animate-spin" />
                  : isEditing ? 'Save Changes' : 'Create Task'}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}