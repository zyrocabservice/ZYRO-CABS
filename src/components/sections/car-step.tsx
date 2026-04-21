
'use client';

import Image from 'next/image';
import type { Car } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Briefcase } from 'lucide-react';

type CarOption = Car & { estimatedFare: number };

interface CarStepProps {
  carOptions: CarOption[];
  onSelect: (car: CarOption) => void;
  onBack: () => void;
}

export default function CarStep({ carOptions, onSelect, onBack }: CarStepProps) {

  const formatRate = (rate: number) => {
    if (rate % 1 === 0) {
      return rate.toString();
    }
    return rate.toFixed(2);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {carOptions.map((car) => (
          <Card 
            key={car.id} 
            className="cursor-pointer hover:border-primary transition-colors flex flex-col"
            onClick={() => onSelect(car)}
          >
            <CardContent className="p-4 flex-grow">
              <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{car.carType}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><Users className="w-4 h-4"/> {car.capacity}</span>
                        <span className="flex items-center gap-1"><Briefcase className="w-4 h-4"/> {car.capacity > 2 ? 2 : 1}</span>
                    </div>
                  </div>
                  <p className="font-bold text-lg">Rs {formatRate(car.estimatedFare)}</p>
              </div>
              <div className="aspect-video w-full mt-4 rounded-md overflow-hidden relative">
                <Image
                    src={car.imageUrl}
                    alt={car.carType}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                    data-ai-hint={car.imageHint}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Button variant="outline" onClick={onBack} className="w-full">Back</Button>
    </div>
  );
}
