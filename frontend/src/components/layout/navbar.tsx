'use client';

import React from 'react';
import { useAuthStore } from '@/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { Bell } from 'lucide-react';

export function Navbar() {
  const { user } = useAuthStore();

  return (
    <header className="h-16 border-b border-border bg-background flex items-center justify-between px-6">
      {/* Left */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground">
          Welcome back 👋
        </h2>
        <p className="text-sm font-semibold text-foreground">
          {user?.name || 'User'}
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-muted transition">
          <Bell size={18} />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-2">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.avatar || ''} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {user?.name ? getInitials(user.name) : 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}