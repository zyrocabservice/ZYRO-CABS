
'use client';

import type { Booking } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Calendar, Clock, Car, Hash, CircleUser, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookingCardProps {
    booking: Booking;
}

const DetailRow = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | undefined | null }) => {
    if (!value) return null;
    return (
        <div className="flex items-center gap-2 text-sm">
            <Icon className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{label}:</span>
            <span className="text-muted-foreground">{value}</span>
        </div>
    )
}

export default function BookingCard({ booking }: BookingCardProps) {
    const getStatusClasses = (status: Booking['status']) => {
        switch (status) {
            case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'completed': return 'bg-green-100 text-green-800 border-green-300';
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const isDriverAssigned = booking.status === 'confirmed' || booking.status === 'completed';

    return (
        <Card className="shadow-md hover:shadow-lg transition-shadow rounded-[25px] overflow-hidden">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">
                            {booking.pickupLocation} <span className="text-primary">to</span> {booking.dropLocation}
                        </CardTitle>
                        <CardDescription>
                            Booked on {format(new Date(booking.createdAt), 'PPP')}
                        </CardDescription>
                    </div>
                    <Badge className={cn("capitalize text-sm", getStatusClasses(booking.status))}>
                        {booking.status.replace('_', ' ')}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                   <DetailRow icon={Calendar} label="Pickup Date" value={booking.pickupDate ? format(new Date(booking.pickupDate), 'PPP') : 'N/A'} />
                   <DetailRow icon={Clock} label="Pickup Time" value={booking.pickupTime} />
                   <DetailRow icon={Car} label="Car Type" value={booking.carType} />
                </div>
                 {isDriverAssigned && (booking.driverName || booking.driverNo || booking.carNo) && (
                    <div className="border-t pt-4 mt-4">
                        <h4 className="font-semibold mb-2">Driver & Car Details</h4>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <DetailRow icon={CircleUser} label="Driver Name" value={booking.driverName} />
                            <DetailRow icon={Phone} label="Driver Number" value={booking.driverNo} />
                            <DetailRow icon={Hash} label="Car Number" value={booking.carNo} />
                         </div>
                    </div>
                 )}
            </CardContent>
            <CardFooter className="bg-primary/10 text-primary-foreground px-6 py-3 justify-between text-sm">
                <div>
                    <span className="opacity-80 text-foreground">Booking ID: </span>
                    <span className="font-mono text-xs text-foreground">{booking.id}</span>
                </div>
                {booking.estimatedFare && (
                     <div>
                        <span className="opacity-80 text-foreground">Fare: </span>
                        <span className="font-semibold text-foreground">₹{booking.estimatedFare.toFixed(2)}</span>
                    </div>
                )}
            </CardFooter>
        </Card>
    );
}
