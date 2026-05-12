'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Mail, Shield, UserCheck, Loader2, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { userService } from '@/services/user.service';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store';
import { User } from '@/types';
import { getInitials, formatDate } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function TeamPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user } = useAuthStore();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (user?.role !== 'admin') { router.replace('/dashboard'); return; }
    const load = async () => {
      try {
        const res = await userService.getAll();
        setUsers(res.data.users);
      } catch { toast({ title: 'Failed to load team', variant: 'destructive' }); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Team Members</h1>
          <p className="text-muted-foreground text-sm mt-1">{users.length} member{users.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search members…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((member, i) => (
            <motion.div key={member._id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="bg-card border border-border rounded-2xl p-5 card-hover">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12 ring-2 ring-primary/10">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground truncate">{member.name}</h3>
                      <Badge className={`text-[10px] px-1.5 py-0.5 flex-shrink-0 ${member.role === 'admin' ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-400' : 'status-todo'}`}>
                        {member.role === 'admin' ? <><Shield size={9} className="mr-1" />Admin</> : <><UserCheck size={9} className="mr-1" />Member</>}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Mail size={11} className="text-muted-foreground flex-shrink-0" />
                      <span className="text-xs text-muted-foreground truncate">{member.email}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Joined {formatDate(member.createdAt)}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mb-4">
            <Users className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="font-display font-bold text-lg text-foreground mb-1">No members found</h3>
          <p className="text-muted-foreground text-sm">Try a different search term.</p>
        </div>
      )}
    </div>
  );
}