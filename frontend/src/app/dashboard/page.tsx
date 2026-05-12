'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FolderKanban, CheckSquare, AlertCircle, Clock, TrendingUp,
  Activity, Calendar, ArrowUpRight, Loader2, RefreshCw,
  CheckCircle2, Plus, UserPlus, UserMinus, Edit, MessageSquare,
} from 'lucide-react';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { dashboardService } from '@/services/dashboard.service';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store';
import { formatDate, timeAgo, getStatusConfig, getPriorityConfig, getInitials } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// ── constants ─────────────────────────────────────────────────────────────────
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.07 } } };

const STATUS_COLORS: Record<string, string> = {
  todo: '#94a3b8', in_progress: '#6172f3', review: '#f59e0b', completed: '#10b981',
};

// Map activity type → icon + colour
const ACTIVITY_META: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  task_created:    { icon: Plus,          color: 'text-brand-600',   bg: 'bg-brand-50 dark:bg-brand-950'    },
  task_updated:    { icon: Edit,          color: 'text-amber-600',   bg: 'bg-amber-50 dark:bg-amber-950'    },
  task_completed:  { icon: CheckCircle2,  color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950'},
  task_assigned:   { icon: UserPlus,      color: 'text-violet-600',  bg: 'bg-violet-50 dark:bg-violet-950'  },
  project_created: { icon: FolderKanban, color: 'text-brand-600',   bg: 'bg-brand-50 dark:bg-brand-950'    },
  project_updated: { icon: Edit,          color: 'text-amber-600',   bg: 'bg-amber-50 dark:bg-amber-950'    },
  member_added:    { icon: UserPlus,      color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950'},
  member_removed:  { icon: UserMinus,     color: 'text-rose-600',    bg: 'bg-rose-50 dark:bg-rose-950'      },
  comment_added:   { icon: MessageSquare, color: 'text-sky-600',     bg: 'bg-sky-50 dark:bg-sky-950'        },
};

function activityMeta(type: string) {
  return ACTIVITY_META[type] ?? { icon: Activity, color: 'text-muted-foreground', bg: 'bg-muted' };
}

// ── sub-components ────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, href }: {
  icon: React.ElementType; label: string; value: string | number; color: string; href?: string;
}) {
  const inner = (
    <div className="bg-card border border-border rounded-2xl p-5 card-hover group cursor-pointer h-full">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <p className="text-3xl font-display font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
  return (
    <motion.div variants={fadeUp} className="h-full">
      {href ? <Link href={href} className="h-full block">{inner}</Link> : inner}
    </motion.div>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [stats, setStats]       = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuthStore();
  const { toast } = useToast();

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [statsRes, activityRes] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getActivity(15),
      ]);
      setStats(statsRes.data);
      setActivities(activityRes.data.activities ?? []);
    } catch {
      toast({ title: 'Failed to load dashboard', variant: 'destructive' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => { load(); }, [load]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const timer = setInterval(() => load(true), 60_000);
    return () => clearInterval(timer);
  }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const { stats: s, charts, upcomingDeadlines } = stats ?? {};

  // ── chart data derived from real API ──────────────────────────────────────
  const weeklyTrend: { day: string; created: number; completed: number }[] =
    charts?.weeklyTrend ?? [];

  const statusChartData = (charts?.tasksByStatus ?? []).map((item: any) => ({
    name:  getStatusConfig(item._id).label,
    value: item.count,
    color: STATUS_COLORS[item._id] ?? '#94a3b8',
  }));

  const greeting =
    new Date().getHours() < 12 ? 'morning'
    : new Date().getHours() < 17 ? 'afternoon'
    : 'evening';

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Good {greeting}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here's what's happening with your projects today.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => load(true)}
          disabled={refreshing}
          title="Refresh"
        >
          <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
        </Button>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────────────────── */}
      <motion.div
        variants={stagger} initial="hidden" animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard icon={FolderKanban} label="Total Projects"   value={s?.totalProjects  ?? 0}
          color="bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400"   href="/projects" />
        <StatCard icon={CheckSquare}  label="Tasks Completed"  value={s?.completedTasks ?? 0}
          color="bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400" href="/tasks?status=completed" />
        <StatCard icon={AlertCircle}  label="Overdue Tasks"    value={s?.overdueTasks   ?? 0}
          color="bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400"       href="/tasks" />
        <StatCard icon={TrendingUp}   label="Completion Rate"  value={`${s?.completionRate ?? 0}%`}
          color="bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400" />
      </motion.div>

      {/* ── Charts row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Task Activity — real weeklyTrend from backend */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show"
          className="lg:col-span-2 bg-card border border-border rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-bold text-foreground">Task Activity</h2>
              <p className="text-xs text-muted-foreground">Tasks created vs completed — last 7 days</p>
            </div>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>

          {weeklyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={weeklyTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6172f3" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#6172f3" stopOpacity={0}    />
                  </linearGradient>
                  <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false} tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '10px',
                    fontSize: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  }}
                  cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
                />
                <Area
                  type="monotone" dataKey="created"
                  stroke="#6172f3" strokeWidth={2}
                  fill="url(#gradCreated)" name="Created"
                  dot={{ r: 3, fill: '#6172f3', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#6172f3', strokeWidth: 0 }}
                />
                <Area
                  type="monotone" dataKey="completed"
                  stroke="#10b981" strokeWidth={2}
                  fill="url(#gradCompleted)" name="Completed"
                  dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#10b981', strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground gap-2">
              <Activity className="h-8 w-8 opacity-30" />
              <p className="text-sm">No task activity in the last 7 days</p>
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 justify-end">
            {[
              { color: '#6172f3', label: 'Created'   },
              { color: '#10b981', label: 'Completed' },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-3 h-1.5 rounded-full" style={{ background: l.color }} />
                {l.label}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Task by status — pie */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show"
          className="bg-card border border-border rounded-2xl p-5"
        >
          <div className="mb-4">
            <h2 className="font-display font-bold text-foreground">By Status</h2>
            <p className="text-xs text-muted-foreground">Task distribution</p>
          </div>
          {statusChartData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%" cy="50%"
                    innerRadius={40} outerRadius={65}
                    paddingAngle={3} dataKey="value"
                  >
                    {statusChartData.map((entry: any, i: number) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '10px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-1.5">
                {statusChartData.map((item: any) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="font-semibold text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-sm text-muted-foreground">
              No tasks yet
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Bottom row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Upcoming deadlines */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show"
          className="bg-card border border-border rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-bold text-foreground">Upcoming Deadlines</h2>
              <p className="text-xs text-muted-foreground">Tasks due in the next 7 days</p>
            </div>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
          {upcomingDeadlines?.length > 0 ? (
            <div className="space-y-2.5">
              {upcomingDeadlines.map((task: any) => {
                const priority = getPriorityConfig(task.priority);
                return (
                  <div
                    key={task._id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 hover:bg-muted transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${priority.dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {task.project?.title} · Due {formatDate(task.dueDate)}
                      </p>
                    </div>
                    <Badge className={`text-xs flex-shrink-0 ${priority.className}`}>
                      {priority.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Clock className="h-8 w-8 mb-2 opacity-30" />
              <p className="text-sm">No upcoming deadlines</p>
            </div>
          )}
        </motion.div>

        {/* Recent Activity — dynamic, auto-refreshes */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show"
          className="bg-card border border-border rounded-2xl p-5 flex flex-col"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-bold text-foreground">Recent Activity</h2>
              <p className="text-xs text-muted-foreground">Latest team updates</p>
            </div>
            {refreshing
              ? <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
              : <Activity className="h-4 w-4 text-muted-foreground" />
            }
          </div>

          {activities.length > 0 ? (
            <div className="space-y-1 flex-1 overflow-y-auto max-h-72 scrollbar-thin pr-1">
              {activities.map((activity: any, idx: number) => {
                const meta    = activityMeta(activity.type);
                const Icon    = meta.icon;
                const isFirst = idx === 0;
                return (
                  <motion.div
                    key={activity._id}
                    initial={isFirst ? { opacity: 0, x: -8 } : false}
                    animate={isFirst ? { opacity: 1, x: 0  } : false}
                    transition={{ duration: 0.25 }}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-muted/40 transition-colors group"
                  >
                    {/* Activity type icon */}
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
                      <Icon size={13} className={meta.color} />
                    </div>

                    {/* User avatar + message */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Avatar className="h-4 w-4 flex-shrink-0">
                          <AvatarImage src={activity.user?.avatar} />
                          <AvatarFallback className="text-[8px] bg-primary/10 text-primary font-bold">
                            {activity.user?.name ? getInitials(activity.user.name) : 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-semibold text-foreground truncate">
                          {activity.user?.name ?? 'Someone'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {activity.message}
                        {activity.project?.title && (
                          <span className="text-foreground/70"> — {activity.project.title}</span>
                        )}
                      </p>
                      <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                        {timeAgo(activity.createdAt)}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 h-32 text-muted-foreground">
              <Activity className="h-8 w-8 mb-2 opacity-30" />
              <p className="text-sm">No recent activity</p>
              <p className="text-xs mt-1 opacity-60">Activity appears here as your team works</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}