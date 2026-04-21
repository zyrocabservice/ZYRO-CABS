
'use client';

import dynamic from 'next/dynamic';
import ScrollingImageGallery from './scrolling-image-gallery';
import { Skeleton } from '../ui/skeleton';
import type { Car, ContactDetails, ButtonSettings } from '@/lib/types';

const BookingFlow = dynamic(() => import('../booking-flow'), {
  loading: () => <Skeleton className="h-[600px] w-full" />,
});

interface MakeTripProps {
    contactDetails: ContactDetails;
    buttonSettings: ButtonSettings;
    cars: Car[];
}

export default function MakeTrip({ contactDetails, buttonSettings, cars }: MakeTripProps) {
  return (
    <section id="booking-flow" className="py-12">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold">Make Plan for Trip</h2>
            <p className="text-muted-foreground">Choose the option for get ready for your trip</p>
        </div>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div 
              className="relative h-[650px] overflow-hidden hidden lg:block mask-image-t-b"
            >
              <ScrollingImageGallery />
            </div>
            <BookingFlow contactDetails={contactDetails} buttonSettings={buttonSettings} cars={cars} />
        </div>
    </section>
  );
}
