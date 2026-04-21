

'use client';

import type { Driver } from '@/lib/types';
import { User, Phone, Car, BookOpen, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { format } from 'date-fns';

interface DriversTableProps {
  drivers: Driver[];
}

const DetailRow = ({ icon: Icon, value, label }: { icon: React.ElementType, value: string | undefined | number, label: string }) => {
    if (!value) return null;
    return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon className="w-4 h-4" />
            <span className="font-medium">{label}:</span>
            <span>{value}</span>
        </div>
    )
}


export default function DriversTable({ drivers }: DriversTableProps) {
    
    if (drivers.length === 0) {
        return (
            <div className="text-center py-16 border-dashed border-2 rounded-lg">
                <User className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No Driver Data</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    Driver information will appear here once you assign them to bookings.
                </p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {drivers.map((driver) => (
                <Card key={driver.id}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            {driver.name}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <DetailRow icon={Phone} label="Phone" value={driver.phone} />
                        <DetailRow icon={Car} label="Vehicle" value={driver.vehicle} />
                        <DetailRow icon={BookOpen} label="Total Trips" value={driver.totalBookings} />
                        <DetailRow icon={Clock} label="Last Trip" value={format(driver.lastSeen, 'PP')} />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

    