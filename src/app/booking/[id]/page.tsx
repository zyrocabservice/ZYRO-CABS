'use client';

import { Suspense, useState, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import LottieAnimation from '@/components/home/lottie-animation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Home, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

function ConfirmationStatusContent() {
    const searchParams = useSearchParams();
    const routeParams = useParams();
    const router = useRouter();
    const from = searchParams.get('from') || 'N/A';
    const to = searchParams.get('to') || 'N/A';
    const bookingId = routeParams.id as string;
    const [isExiting, setIsExiting] = useState(false);
    
    const handleContinueClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        setIsExiting(true);
        setTimeout(() => {
            router.push('/my-bookings');
        }, 300); // Duration of the animation
    };

    return (
        <>
            <Card className={cn("shadow-lg animate-pop-in rounded-[25px] overflow-hidden", isExiting && "animate-fade-out-shrink")}>
                <CardHeader className="text-center p-4 md:p-6">
                    <CardTitle className="text-xl md:text-2xl">Your Ride is Confirmed!</CardTitle>
                    <CardDescription className="text-xs md:text-sm">
                        From <span className="font-semibold text-primary">{from}</span> to <span className="font-semibold text-primary">{to}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6">
                    <div className="w-full h-48 md:h-64">
                        <LottieAnimation animationUrl="https://raw.githubusercontent.com/thethanjaiculture-dev/GetIn-Assests/main/Success%20(2).json" loop={false} />
                    </div>
                    <div className="text-center mt-2 md:mt-4 space-y-1 md:space-y-2">
                        <p className="font-semibold text-base md:text-lg">We're assigning a driver for you.</p>
                        <p className="text-muted-foreground text-xs md:text-sm">You will receive the driver details shortly via Whatsapp and on this page Booking Section. Thank you for choosing ZyroCabs!</p>
                    </div>
                    <div className="pt-2 md:pt-4 text-center">
                        <Button asChild>
                            <Link href="/my-bookings" onClick={handleContinueClick}>
                                Continue
                            </Link>
                        </Button>
                    </div>
                </CardContent>
                <CardFooter className="bg-muted px-6 py-3 justify-center text-sm">
                    <div>
                        <span className="opacity-80 text-muted-foreground">Booking ID: </span>
                        <span className="font-mono text-xs text-foreground">{bookingId}</span>
                    </div>
                </CardFooter>
            </Card>
        </>
    )
}

export default function BookingStatusPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
         <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <ConfirmationStatusContent />
         </Suspense>
      </div>
    </div>
  );
}
