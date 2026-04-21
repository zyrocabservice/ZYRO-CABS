
'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from '@/lib/supabase/client';
import { User } from "@supabase/supabase-js";
import { saveWebLoginToSupabase } from "@/lib/actions";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";


const PRIMARY_ADMIN_UID = '4X7WYJxguMTm6ivpmwTINmpSkI72';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [error, setError] = useState('');

  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const [isForgotPassDialogOpen, setIsForgotPassDialogOpen] = useState(false);
  const supabase = createClient();


  useEffect(() => {
    // This effect can be used for initial auth state checking if needed
  }, []);

  const handleSuccessfulLogin = async (user: User) => {
    sessionStorage.setItem('zyro_user_auth', 'true');
    
    // Check for admin role
    const { data: roleData } = await supabase
        .from('roles')
        .select('role')
        .eq('uid', user.id)
        .single();

    if (roleData && (roleData.role === 'Admin' || roleData.role === 'Sub-Admin')) {
        sessionStorage.setItem('zyro_admin_auth', 'true');
    }

    // This is a fire-and-forget action
    saveWebLoginToSupabase({
        user_id: user.user_metadata?.full_name || user.email || 'Unknown User',
        photo_url: user.user_metadata?.avatar_url || undefined,
        device_name: 'Unknown',
        device_type: 'Desktop',
        location: 'Unknown',
        ip_address: 'N/A',
        time_spent: 'N/A',
    });

    router.replace('/');
    toast({
        title: "Logged In",
        description: `Successfully signed in as ${user.user_metadata?.full_name || user.email}.`,
    });
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEmailLoading(true);
    setError('');

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        setError(error.message);
        setIsEmailLoading(false);
    } else if (data.user) {
        await handleSuccessfulLogin(data.user);
        setIsEmailLoading(false);
    }
  };
  

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);
    setResetError('');
    setResetMessage('');

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth/update-password`,
    });

    if (error) {
        setResetError(error.message);
    } else {
        setResetMessage('Password reset email sent! Please check your inbox.');
    }
    setIsResetting(false);
  };


  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <Image
            src="https://raw.githubusercontent.com/thethanjaiculture-dev/GetIn-Assests/main/ZyroCabsBF-Photoroom.png"
            alt="ZyroCabs Logo"
            width={120}
            height={48}
            className="object-contain mb-6"
            priority
        />
        <Card className="w-full max-w-sm">
            <CardHeader className="text-center">
            <CardTitle>Login</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                    id="email" 
                    type="email" 
                    placeholder="m@example.com" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                </div>
                <div className="space-y-2">
                <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <Dialog open={isForgotPassDialogOpen} onOpenChange={setIsForgotPassDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="link" type="button" className="ml-auto inline-block text-sm underline">
                            Forgot your password?
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <form onSubmit={handlePasswordReset}>
                            <DialogHeader>
                            <DialogTitle>Forgot Password</DialogTitle>
                            <DialogDescription>
                                Enter your email address and we'll send you a link to reset your password.
                            </DialogDescription>
                            </DialogHeader>
                            <div className="py-4 space-y-2">
                            <Label htmlFor="reset-email">Email</Label>
                            <Input
                                id="reset-email"
                                type="email"
                                placeholder="you@example.com"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                required
                            />
                            {resetError && <p className="text-sm text-destructive">{resetError}</p>}
                            {resetMessage && <p className="text-sm text-primary">{resetMessage}</p>}
                            </div>
                            <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsForgotPassDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isResetting}>
                                {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Send Reset Link
                            </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                    </Dialog>
                </div>
                <Input 
                    id="password" 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                </div>
                {error && <p className="text-sm text-destructive text-center">{error}</p>}
                <Button type="submit" className="w-full" disabled={isEmailLoading}>
                {isEmailLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
                </Button>
            </form>
            </CardContent>
            <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/signup" className="underline">
                Create new account
                </Link>
            </p>
            </CardFooter>
        </Card>
    </div>
  );
}
