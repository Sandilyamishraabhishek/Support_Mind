'use client';

import { signOut } from 'next-auth/react';
import { LogOut, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface LogoutButtonProps {
  className?: string;
}

export function LogoutButton({ className = '' }: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);
    try {
      // Clear the next-auth session and redirect directly to the login page
      await signOut({ callbackUrl: '/login' });
    } catch (error) {
      console.error('[Logout Error]:', error);
      setIsLoading(false);
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={`inline-flex items-center justify-center p-2 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-colors shadow-sm disabled:opacity-50 cursor-pointer ${className}`}
      title="Sign Out"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-zinc-500 dark:text-zinc-400" />
      ) : (
        <LogOut className="w-4 h-4" />
      )}
    </button>
  );
}
