
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminDashboard from '@/components/admin/admin-dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';
import type { UserRole } from '@/lib/types';

const PRIMARY_ADMIN_UID = '4X7WYJxguMTm6ivpmwTINmpSkI72';

function AdminAuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState<'loading' | 'admin' | 'unauthorized'>('loading');
  const supabase = createClient();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user;
      if (user) {
        // Note: Legacy primary admin check. In production, this should be in the DB.
        if (user.id === PRIMARY_ADMIN_UID) {
            setAuthStatus('admin');
            return;
        }

        // Check for role in Supabase 'roles' table
        try {
            const { data: roleData, error: roleError } = await supabase
                .from('roles')
                .select('role')
                .eq('uid', user.id)
                .single();

            if (roleData && (roleData.role === 'Admin' || roleData.role === 'Sub-Admin')) {
                 setAuthStatus('admin');
                 return;
            }
             // If no valid role is found, set as unauthorized
            setAuthStatus('unauthorized');
        } catch (serverError) {
            console.error("Admin Auth Error:", serverError);
            setAuthStatus('unauthorized');
        }

      } else {
        // No user logged in, redirect to login
        router.replace('/admin/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  useEffect(() => {
    if (authStatus === 'unauthorized') {
      router.replace('/');
    }
  }, [authStatus, router]);

  if (authStatus === 'loading') {
    return (
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-8rem)]">
            <div className="text-center">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Verifying admin access...</p>
            </div>
        </div>
    );
  }

  if (authStatus === 'admin') {
    return <>{children}</>;
  }

  // This will be briefly shown while redirecting for 'unauthorized' or null for others
  return null;
}


export default function AdminPage() {
  return (
    <AdminAuthWrapper>
      <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading Dashboard...</div>}>
        <AdminDashboard />
      </Suspense>
    </AdminAuthWrapper>
  );
}
