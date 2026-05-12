// src/app/layout.tsx
import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { AuthProvider } from '@/components/providers/auth-provider';
import { Toaster } from '@/components/ui/toaster';
import '@/styles/globals.css';
import AppLayout from '../app/(app)/layout';

export const metadata: Metadata = {
  title: { default: 'TaskManager', template: '%s | TaskManager' },
  description: 'A modern collaborative task management platform',
  keywords: ['task management', 'project management', 'team collaboration'],
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <AppLayout>
            {children}
            <Toaster />
            </AppLayout>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}