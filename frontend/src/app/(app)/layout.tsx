'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useUiStore } from '@/store';
import { Sidebar } from '../../components/layout/sidebar';
import { Navbar } from '../../components/layout/navbar';
import { cn } from '@/lib/utils';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

// useEffect(() => {
//   if (isLoading) return;

//   if (isAuthenticated === false) {
//     router.replace('/login');
//   }
// }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading TaskManager…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <>{children}</>;

  return (
    <div className="h-screen flex bg-background">

      {/* Sidebar FIXED */}
      <div className="md:block w-64 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main area */}
      <div className="flex flex-1 flex-col min-w-0">

        {/* Navbar STICKY */}
        <div className="sticky top-0 z-50 bg-background border-b border-border">
          <Navbar />
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 lg:p-8 max-w-screen-2xl mx-auto">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}