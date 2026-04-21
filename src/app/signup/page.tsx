
'use client';

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Loader2, ShieldCheck, KeyRound, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from '@/lib/supabase/client';
import { User } from "@supabase/supabase-js";
import Image from "next/image";
import CountryCodeSelector from "@/components/ui/country-code-selector";
import { countries } from "@/lib/countries";

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSuccessfulLogin = async (user: User) => {
    sessionStorage.setItem('zyro_user_auth', 'true');
    
    // Check for admin role (legacy pattern)
    const { data: roleData } = await supabase
        .from('roles')
        .select('role')
        .eq('uid', user.id)
        .single();

    if (roleData && (roleData.role === 'Admin' || roleData.role === 'Sub-Admin')) {
        sessionStorage.setItem('zyro_admin_auth', 'true');
    }

    router.replace('/');
    toast({
        title: "Account Created",
        description: `Successfully signed in as ${user.user_metadata?.full_name || user.email}.`,
    });
  };
  
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
    }

    setIsLoading(true);
    try {
        const fullPhoneNumber = `${countryCode}${phone}`;
        const { data, error: signupError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                    phone: fullPhoneNumber,
                }
            }
        });

        if (signupError) throw signupError;

        if (data.user) {
            // Upsert patient/customer record (legacy logic)
            await supabase.from('customers').insert([{
                uid: data.user.id,
                email: email,
                name: name,
                phone: fullPhoneNumber,
                bookings_count: 0
            }]);

            await handleSuccessfulLogin(data.user);
        }

    } catch (err: any) {
        setError(err.message);
    } finally {
        setIsLoading(false);
    }
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
                <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full mb-4">
                    <UserPlus className="h-6 w-6" />
                </div>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>Enter your details to create a new account</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleCreateAccount} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" type="text" placeholder="Your Name" required value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <div className="flex gap-2">
                            <CountryCodeSelector value={countryCode} onValueChange={setCountryCode} />
                            <Input id="phone" placeholder="Your phone number" type="tel" required value={phone} onChange={e => setPhone(e.target.value.replace(/[^0-9]/g, ''))} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Choose a password"/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm Password</Label>
                        <Input id="confirm-password" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm your password"/>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Account
                    </Button>
                </form>
                {error && <p className="text-sm text-destructive text-center mt-4">{error}</p>}
            </CardContent>
            <CardFooter className="flex justify-center">
                <p className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="underline">
                    Login
                    </Link>
                </p>
            </CardFooter>
        </Card>
    </div>
  );
}
