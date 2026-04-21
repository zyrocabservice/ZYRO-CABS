
'use client';

import { useState, useEffect } from 'react';
import type { Booking, Driver } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Home, Calendar, Clock, User, Car, Ticket } from 'lucide-react';
import Link from 'next/link';
import LottieAnimation from './home/lottie-animation';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

type EnrichedBooking = Booking & { driver?: Driver; returnDate?: string; bookingDate?: string; rideType?: string; };

const DetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | null | undefined }) => {
    if (!value) return null;
    return (
        <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
            <Icon className="w-6 h-6 mb-2 text-primary" />
            <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="font-semibold">{value}</p>
            </div>
        </div>
    )
}

export default function BookingStatus({ initialBooking }: { initialBooking: EnrichedBooking }) {
  const [booking] = useState<EnrichedBooking>(initialBooking);
  const [formattedBookingDate, setFormattedBookingDate] = useState<string | null>(null);

  useEffect(() => {
    if (booking.bookingDate) {
      setFormattedBookingDate(format(new Date(booking.bookingDate), 'PPp'));
    }
  }, [booking.bookingDate]);

  const formatTime12h = (time24: string | null | undefined) => {
    if (!time24) return null;
    const [hours, minutes] = time24.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    let h12 = h % 12;
    if (h12 === 0) h12 = 12;
    return `${h12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  };

  return (
    <div className="relative">
      <Card className="shadow-lg animate-pop-in">
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="flex-1">
            <CardTitle>Booking Status</CardTitle>
            <CardDescription className="text-xs pt-1">
                Your ride from {booking.pickupLocation} to {booking.dropLocation}.
            </CardDescription>
          </div>
          {formattedBookingDate && (
              <div className="hidden sm:block text-right">
                  <p className="text-sm text-muted-foreground">Booked On</p>
                  <p className="font-semibold text-sm text-primary">{formattedBookingDate}</p>
              </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-8 space-y-3">
              <h2 className="text-2xl font-bold">Your Ride is Confirmed!</h2>
              <div className="w-full h-64" style={{ willChange: 'transform' }}>
                <LottieAnimation animationUrl="https://raw.githubusercontent.com/thethanjaiculture-dev/GetIn-Assests/refs/heads/main/Success%20(2).json" loop={false} />
              </div>
              <p className="font-semibold text-lg">Assigning a driver...</p>
              <p className="text-muted-foreground">We're assigning the best driver for you. This should only take a moment.</p>
          </div>

          <div className="border-t pt-6 space-y-4">
              <h3 className="font-bold text-lg mb-2 text-center">Booking Details</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 justify-items-center sm:justify-items-start">
                  <DetailItem icon={User} label="Name" value={booking.customer?.name} />
                  <DetailItem icon={Calendar} label="Pickup Date" value={booking.pickupDate ? format(new Date(booking.pickupDate), 'PPP') : null} />
                  {booking.returnDate && <DetailItem icon={Calendar} label="Return Date" value={format(new Date(booking.returnDate), 'PPP')} />}
                  <DetailItem icon={Car} label="Ride Type" value={booking.rideType?.replace('-', ' ')} />
                  <DetailItem icon={Clock} label="Pickup Time" value={formatTime12h(booking.pickupTime)} />
                  <DetailItem icon={Ticket} label="Booking ID" value={booking.id.substring(0,8)} />
                   {formattedBookingDate && (
                        <div className="sm:hidden">
                            <DetailItem icon={Clock} label="Booking Date" value={formattedBookingDate} />
                        </div>
                   )}
              </div>
          </div>
          
          <div className="space-y-4">
              <Button asChild className="w-full">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
