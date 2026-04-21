
'use client';

import CarCard from './car-card';
import type { Car, ContactDetails, ButtonSettings } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

interface CarListProps {
    cars: Car[];
    contactDetails: ContactDetails;
    buttonSettings: ButtonSettings;
}

export default function CarList({ cars, contactDetails, buttonSettings }: CarListProps) {
  const handleBookNowClick = () => {
    document.getElementById('booking-flow')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!cars || !Array.isArray(cars) || cars.length === 0) {
      return (
        <section className="mt-[-10px]">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold">Cars Available For You</h2>
                <p className="text-muted-foreground">Choose the car you want for your trip</p>
            </div>
            <div className="text-center text-muted-foreground">
                Could not load car data. Please try again later.
            </div>
        </section>
      )
  }

  return (
    <section className="mt-[-10px]">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold">Cars Available For You</h2>
        <p className="text-muted-foreground">Choose the car you want for your trip</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {cars.map((car) => (
            <CarCard 
                key={car.id} 
                car={car}
                onBookNowClick={handleBookNowClick}
                contactDetails={contactDetails}
                buttonSettings={buttonSettings}
            />
        ))}
      </div>
    </section>
  );
}
