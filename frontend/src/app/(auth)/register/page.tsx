'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Zap, ArrowRight, Loader2, User, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store';
import { authService } from '@/services/auth.service';
import { registerSchema, type RegisterInput } from '@/lib/validations';
import { useToast } from '@/hooks/use-toast';
import { RegisterFormData } from '@/types';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'member' },
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      const res = await authService.register(data as RegisterFormData);
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
      toast({ title: 'Account created!', description: `Welcome to TaskManager, ${res.data.user.name}!` });
      router.replace('/dashboard');
    } catch (err: any) {
      toast({
        title: 'Registration failed',
        description: err.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-mesh p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
            <Zap className="h-5 w-5 fill-white text-white" />
          </div>
          <span className="font-display text-2xl font-bold">TaskManager</span>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl shadow-black/5">
          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold text-foreground mb-1">Create an account</h1>
            <p className="text-muted-foreground text-sm">Start managing your projects today</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-medium">Full name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="name" placeholder="Alex Morgan" {...register('name')}
                  className={`pl-9 ${errors.name ? 'border-destructive' : ''}`} />
              </div>
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@example.com" {...register('email')}
                  className={`pl-9 ${errors.email ? 'border-destructive' : ''}`} />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Min. 8 chars, 1 uppercase, 1 number"
                  {...register('password')} className={`pl-9 pr-10 ${errors.password ? 'border-destructive' : ''}`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Account type</Label>
              <div className="grid grid-cols-2 gap-2">
                {(['member', 'admin'] as const).map((role) => (
                  <label key={role} className="relative">
                    <input type="radio" value={role} {...register('role')} className="sr-only peer" />
                    <div className="border-2 border-border rounded-lg p-3 text-center cursor-pointer peer-checked:border-primary peer-checked:bg-primary/5 transition-all hover:border-primary/50">
                      <p className="text-sm font-semibold capitalize">{role}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{role === 'admin' ? 'Full control' : 'Team member'}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full h-11 font-semibold mt-2" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Create account <ArrowRight className="ml-2 h-4 w-4" /></>}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}