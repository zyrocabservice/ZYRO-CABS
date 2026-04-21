
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import type { UserRole } from '@/lib/types';
import Image from 'next/image';

const PRIMARY_ADMIN_UID = '4X7WYJxguMTm6ivpmwTINmpSkI72';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();

  const handleSuccessfulAdminLogin = () => {
    sessionStorage.setItem('zyro_admin_auth', 'true');
    sessionStorage.setItem('zyro_user_auth', 'true');
    router.replace('/admin');
  };

  const checkAdminPrivileges = async (user: User) => {
    // Note: In Supabase, you might want to use JWT claims for roles, 
    // but for now we follow the legacy pattern of a 'roles' table.
    const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('role')
        .eq('uid', user.id)
        .single();

    if (roleData && (roleData.role === 'Admin' || roleData.role === 'Sub-Admin')) {
      handleSuccessfulAdminLogin();
      return;
    }
    
    setError('This account does not have admin privileges.');
    setIsLoading(false);
    setIsLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (loginError) {
        setError('Authentication failed. Check your credentials.');
        setIsLoading(false);
    } else if (data.user) {
        await checkAdminPrivileges(data.user);
    }
  };


  return (
    <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>Admin Access</CardTitle>
          <CardDescription>Enter admin credentials to access the dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('');
                }}
                required
                placeholder="admin@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('');
                }}
                required
              />
            </div>
            {error && <p className="text-destructive text-sm text-center">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enter Dashboard
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
