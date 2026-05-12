'use client';

import React, { useState } from 'react';
import { MoreHorizontal, Calendar, User, Tag, Edit, Trash2, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getPriorityConfig, getStatusConfig, getInitials, formatDueDate } from '@/lib/utils';
import { Task, TaskStatus } from '@/types';
import { TaskModal } from './TaskModal';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onStatusChange: (status: TaskStatus) => void;
  onDelete: () => void;
  onUpdate: (task: Task) => void;
  canEdit: boolean;
  projectId: string;
}

const STATUS_NEXT: Record<TaskStatus, TaskStatus | null> = {
  todo: 'in_progress',
  in_progress: 'review',
  review: 'completed',
  completed: null,
};

export function TaskCard({ task, onStatusChange, onDelete, onUpdate, canEdit, projectId }: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const priority = getPriorityConfig(task.priority);
  const due = task.dueDate ? formatDueDate(task.dueDate) : null;
  const nextStatus = STATUS_NEXT[task.status];
  const assignee = task.assignedTo as any;

  return (
    <>
      <div className={cn(
        'bg-card border border-border rounded-xl p-3.5 shadow-sm hover:shadow-md transition-all duration-200 group',
        'hover:-translate-y-0.5 cursor-pointer relative'
      )}>
        {/* Priority indicator */}
        <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full ${priority.dot}`} />

        <div className="pl-2">
          {/* Title & menu */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="text-sm font-medium text-foreground leading-tight flex-1">{task.title}</h4>
            {canEdit && (
              <div className="relative flex-shrink-0">
                <button onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                  className="h-6 w-6 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted opacity-0 group-hover:opacity-100 transition-all">
                  <MoreHorizontal size={14} />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-7 bg-popover border border-border rounded-xl shadow-xl z-50 w-36 py-1 overflow-hidden">
                    <button onClick={() => { setShowEditModal(true); setShowMenu(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors">
                      <Edit size={12} /> Edit Task
                    </button>
                    {nextStatus && (
                      <button onClick={() => { onStatusChange(nextStatus); setShowMenu(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors">
                        <ArrowRight size={12} /> Move to {getStatusConfig(nextStatus).label}
                      </button>
                    )}
                    <button onClick={() => { onDelete(); setShowMenu(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-destructive hover:bg-destructive/10 transition-colors">
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-muted-foreground mb-2.5 line-clamp-2">{task.description}</p>
          )}

          {/* Tags */}
          {task.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2.5">
              {task.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="inline-flex items-center gap-0.5 text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-md">
                  <Tag size={8} />#{tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-2.5">
            <div className="flex items-center gap-2">
              <Badge className={`text-[10px] px-1.5 py-0.5 ${priority.className}`}>{priority.label}</Badge>
              {due && (
                <div className={`flex items-center gap-0.5 text-[10px] ${due.isOverdue ? 'text-rose-500 font-medium' : due.isUrgent ? 'text-amber-500' : 'text-muted-foreground'}`}>
                  <Calendar size={9} />
                  <span>{due.text}</span>
                </div>
              )}
            </div>
            {assignee && (
              <Avatar className="h-5 w-5" title={assignee.name}>
                <AvatarImage src={assignee.avatar} />
                <AvatarFallback className="text-[8px] bg-primary/10 text-primary font-bold">
                  {getInitials(assignee.name)}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </div>

      {showEditModal && (
        <TaskModal
          task={task}
          projectId={projectId}
          defaultStatus={task.status}
          onClose={() => setShowEditModal(false)}
          onSuccess={onUpdate}
          members={[]}
        />
      )}
    </>
  );
}