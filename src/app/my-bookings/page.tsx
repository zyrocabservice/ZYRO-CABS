
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Booking, UserRole } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Inbox, Loader2, LogIn, AlertTriangle } from 'lucide-react';
import BookingCard from '@/components/my-bookings/booking-card';
import { Skeleton } from '@/components/ui/skeleton';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

export default function MyBookingsPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [authChecked, setAuthChecked] = useState(false);
    const [showLoginDialog, setShowLoginDialog] = useState(false);
    const [supabaseError, setSupabaseError] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setUser(session?.user ?? null);
            setAuthChecked(true);
        });
        return () => subscription.unsubscribe();
    }, []);

    const fetchBookings = async (userId: string) => {
        setLoading(true);
        setSupabaseError(null);

        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('customer_uid', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Supabase Error on My Bookings:", error.message);
            setSupabaseError("Could not load your bookings.");
            setLoading(false);
            return;
        }

        const mappedBookings: Booking[] = (data || []).map(item => ({
            id: item.id,
            pickupLocation: item.pickup_location,
            dropLocation: item.drop_location,
            status: item.status as any,
            carType: item.car_type,
            estimatedFare: Number(item.estimated_fare),
            passengers: item.passengers,
            pickupDate: item.pickup_date,
            pickupTime: item.pickup_time,
            carNo: item.car_no,
            driverNo: item.driver_no,
            rideType: item.ride_type,
            createdAt: new Date(item.created_at),
            customer: {
                name: item.customer_name,
                mobile: item.customer_phone,
                email: item.customer_email,
                uid: item.customer_uid,
            }
        }));

        setBookings(mappedBookings);
        setLoading(false);
    };

    useEffect(() => {
        if (!authChecked) return;

        if (!user) {
            setLoading(false);
            if (!sessionStorage.getItem('zyro_login_dialog_shown')) {
                setShowLoginDialog(true);
                sessionStorage.setItem('zyro_login_dialog_shown', 'true');
            }
            return;
        }

        fetchBookings(user.id);

        // Optional: Real-time subscription
        const channel = supabase
            .channel('my-bookings-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'bookings',
                    filter: `customer_uid=eq.${user.id}`
                },
                () => fetchBookings(user.id)
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };

    }, [user, authChecked]);

    const handleLoginRedirect = () => {
        router.push('/login');
    }

    const handleHomeRedirect = () => {
        router.push('/');
    }

    if (!authChecked || (authChecked && loading && !user)) {
        return (
             <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-8rem)]">
                <div className="text-center">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                    <p className="mt-4 text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }
    
    if (!user) {
        return (
            <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
                <DialogContent onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle className="text-center text-xl">Sign in to View Bookings</DialogTitle>
                        <DialogDescription className="text-center">
                            Please log in to your account to see your past and upcoming bookings.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center justify-center p-6">
                        <LogIn className="w-16 h-16 text-primary" />
                    </div>
                    <DialogFooter className="sm:justify-center gap-2">
                        <Button onClick={handleHomeRedirect} variant="outline">Go to Home</Button>
                        <Button onClick={handleLoginRedirect}>Sign In</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }
    
    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold">Recent Bookings</h1>
                <p className="text-muted-foreground mb-6">Your recent bookings are shown here.</p>
                <div className="space-y-4">
                    <Skeleton className="h-48 w-full rounded-lg" />
                    <Skeleton className="h-48 w-full rounded-lg" />
                    <Skeleton className="h-48 w-full rounded-lg" />
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold">Recent Bookings</h1>
            <p className="text-muted-foreground mb-6">Your recent bookings are shown here.</p>
            {firestoreError && (
                 <Alert variant="destructive" className="mb-6">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{firestoreError}</AlertDescription>
                </Alert>
            )}
            {bookings.length > 0 ? (
                <div className="space-y-6">
                    {bookings.map(booking => (
                        <BookingCard key={booking.id} booking={booking} />
                    ))}
                </div>
            ) : !firestoreError ? (
                <div className="text-center py-16 border-dashed border-2 rounded-lg">
                    <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No bookings yet</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        You have no past or upcoming bookings.
                    </p>
                    <Button asChild className="mt-6">
                        <Link href="/">Book a Ride</Link>
                    </Button>
                </div>
            ) : null}
        </div>
    );
}
