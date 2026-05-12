'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  Settings,
} from 'lucide-react';

const items = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Projects', icon: FolderKanban, href: '/projects' },
  { label: 'Tasks', icon: CheckSquare, href: '/tasks' },
  { label: 'Team', icon: Users, href: '/team' },
  { label: 'Settings', icon: Settings, href: '/settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="h-screen w-64 border-r border-border bg-card flex flex-col fixed md:static">
      
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-border">
        <h1 className="font-bold text-lg">TaskManager</h1>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {items.map((item) => {
          const active = pathname === item.href;

          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}