// hooks/useRedirect.tsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

/**
 * Хук для перенаправления пользователей на основе состояния аутентификации.
 *
 * @param {boolean} shouldBeAuthenticated - Должен ли пользователь быть аутентифицированным для доступа к странице.
 * @param {string} redirectTo - URL для перенаправления, если условие не выполнено.
 */
export function useRedirect(
  shouldBeAuthenticated: boolean,
  redirectTo: string
) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (shouldBeAuthenticated && !user) {
        // Пользователь должен быть аутентифицирован, но не аутентифицирован
        router.push('/login');
      } else if (!shouldBeAuthenticated && user) {
        // Пользователь не должен быть аутентифицирован, но аутентифицирован
        router.push(redirectTo);
      }
    }
  }, [loading, user, shouldBeAuthenticated, redirectTo, router]);
}
