'use client';

import React, { useEffect } from 'react';

import { useAuthStore } from '@/store/';
import { authService } from '@/services/auth.service';

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    setAuth,
    setLoading,
    logout,
  } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      const storedToken =
        localStorage.getItem('accessToken');

      const storedRefresh =
        localStorage.getItem('refreshToken');

      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await authService.me();

        if (
          res.data?.user &&
          storedToken &&
          storedRefresh
        ) {
          setAuth(
            res.data.user,
            storedToken,
            storedRefresh
          );
        }
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  return <>{children}</>;
}