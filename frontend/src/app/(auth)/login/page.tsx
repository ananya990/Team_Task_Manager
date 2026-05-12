// src/app/(auth)/login/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store';
import { authService } from '@/services/auth.service';
import { loginSchema, type LoginInput } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      const res = await authService.login(data);
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
      toast({ title: 'Welcome back!', description: `Good to see you, ${res.data.user.name}` });
      router.replace('/dashboard');
    } catch (err: any) {
      toast({
        title: 'Login failed',
        description: err.response?.data?.message || 'Invalid credentials',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-600 via-brand-700 to-violet-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative z-10 flex flex-col items-start justify-center p-16 text-white">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Zap className="h-5 w-5 fill-white text-white" />
            </div>
            <span className="font-display text-2xl font-bold">TaskManager</span>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="font-display text-5xl font-bold leading-tight mb-6">
              Manage work<br />
              <span className="text-brand-200">beautifully.</span>
            </h2>
            <p className="text-white/70 text-lg leading-relaxed max-w-md">
              The modern way to collaborate, track projects, and ship faster. Built for teams that move quickly.
            </p>
          </motion.div>
          {/* Floating cards */}
          <motion.div
            className="mt-16 grid grid-cols-2 gap-4 w-full max-w-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {[
              { label: 'Projects', value: '2,400+' },
              { label: 'Tasks Completed', value: '48,200+' },
              { label: 'Teams', value: '860+' },
              { label: 'Uptime', value: '99.9%' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <p className="text-white font-display text-2xl font-bold">{stat.value}</p>
                <p className="text-white/60 text-sm mt-0.5">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
        {/* Decorative orbs */}
        <div className="absolute top-1/4 right-0 w-64 h-64 bg-violet-500/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-brand-400/30 rounded-full blur-3xl" />
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/30">
              <Zap className="h-4 w-4 fill-white text-white" />
            </div>
            <span className="font-display text-xl font-bold">TaskManager</span>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">Welcome back</h1>
            <p className="text-muted-foreground">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register('email')}
                className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Your password"
                  {...register('password')}
                  className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full h-11 font-semibold" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>Sign in <ArrowRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </form>

          {/* Demo creds */}
          <div className="mt-4 p-4 rounded-xl bg-muted/50 border border-border">
            <p className="text-xs font-semibold text-muted-foreground mb-2">DEMO CREDENTIALS</p>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <p>Admin: <span className="text-foreground font-medium">admin@taskmanager.dev</span> / <span className="text-foreground font-medium">Admin@123</span></p>
              <p>Member: <span className="text-foreground font-medium">alice@taskmanager.dev</span> / <span className="text-foreground font-medium">Member@123</span></p>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary font-medium hover:underline">
              Sign up free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}