'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { User, Palette, Shield, Save, Loader2, Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/store';
import { userService } from '@/services/user.service';
import { useToast } from '@/hooks/use-toast';
import { profileSchema, type ProfileInput } from '@/lib/validations';
import { getInitials } from '@/lib/utils';
import { useTheme } from 'next-themes';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'security', label: 'Security', icon: Shield },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const { user, setUser } = useAuthStore();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '', avatar: user?.avatar || '' },
  });

  const onSaveProfile = async (data: ProfileInput) => {
    setSaving(true);
    try {
      const res = await userService.updateProfile(data);
      setUser(res.data.user);
      toast({ title: 'Profile updated successfully!' });
    } catch {
      toast({ title: 'Failed to update profile', variant: 'destructive' });
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account and preferences</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        {/* Sidebar tabs */}
        <div className="sm:w-44 flex-shrink-0">
          <nav className="space-y-0.5">
            {TABS.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                <tab.icon size={15} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 bg-card border border-border rounded-2xl p-6">
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="font-display font-bold text-foreground mb-5">Profile Information</h2>
              <div className="flex items-center gap-4 mb-6 p-4 bg-muted/50 rounded-xl">
                <Avatar className="h-16 w-16 ring-4 ring-primary/10">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                    {user?.name ? getInitials(user.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground">{user?.name}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <p className="text-xs text-muted-foreground capitalize mt-0.5">Role: <span className="font-medium text-foreground">{user?.role}</span></p>
                </div>
              </div>
              <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Display Name</Label>
                  <Input {...register('name')} className={errors.name ? 'border-destructive' : ''} />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Email Address</Label>
                  <Input value={user?.email} disabled className="opacity-60" />
                  <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
                </div>
                <div className="space-y-1.5">
                  <Label>Avatar URL</Label>
                  <Input {...register('avatar')} placeholder="https://example.com/avatar.png" />
                  {errors.avatar && <p className="text-xs text-destructive">{errors.avatar.message}</p>}
                </div>
                <Button type="submit" disabled={saving} className="gap-2">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Save Changes
                </Button>
              </form>
            </motion.div>
          )}

          {activeTab === 'appearance' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="font-display font-bold text-foreground mb-5">Appearance</h2>
              <div className="space-y-4">
                <div>
                  <Label className="mb-3 block">Theme</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'light', label: 'Light', icon: Sun },
                      { value: 'dark', label: 'Dark', icon: Moon },
                      { value: 'system', label: 'System', icon: Monitor },
                    ].map((t) => (
                      <button key={t.value} onClick={() => setTheme(t.value)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${theme === t.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}>
                        <t.icon size={20} className={theme === t.value ? 'text-primary' : 'text-muted-foreground'} />
                        <span className={`text-sm font-medium ${theme === t.value ? 'text-primary' : 'text-muted-foreground'}`}>{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="font-display font-bold text-foreground mb-5">Security</h2>
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-xl border border-border">
                  <p className="text-sm font-medium text-foreground mb-1">Password</p>
                  <p className="text-xs text-muted-foreground">Last changed: unknown</p>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1.5"><Label>Current Password</Label><Input type="password" placeholder="••••••••" /></div>
                  <div className="space-y-1.5"><Label>New Password</Label><Input type="password" placeholder="••••••••" /></div>
                  <div className="space-y-1.5"><Label>Confirm New Password</Label><Input type="password" placeholder="••••••••" /></div>
                  <Button variant="outline" className="gap-2">
                    <Shield size={14} /> Change Password
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}