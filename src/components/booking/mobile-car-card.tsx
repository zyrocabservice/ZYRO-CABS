
'use client';

import type { Car, Offer } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Star, AirVent, Luggage } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

type CarOption = Car & { estimatedFare: number };

interface MobileCarCardProps {
  car: CarOption;
  isSelected: boolean;
  onSelect: () => void;
}

const transformImageUrl = (url: string) => {
    if (url.includes('github.com') && !url.includes('raw.githubusercontent.com')) {
        return url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
    }
    return url;
};

export default function MobileCarCard({ car, isSelected, onSelect }: MobileCarCardProps) {

  return (
    <Card
      className={cn(
        "flex-shrink-0 w-48 md:w-[330px] transition-all duration-300 overflow-hidden shadow-lg",
        isSelected ? "border-primary bg-primary/10 shadow-primary/40" : "bg-card"
      )}
      onClick={onSelect}
    >
      <CardContent className="p-3 text-center">
        <div className="relative w-full h-20 md:h-52 mb-2">
            <Image 
                src={transformImageUrl(car.imageUrl)}
                alt={car.carType}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 160px, 330px"
            />
        </div>
        <h3 className={cn("font-bold text-sm md:text-xl truncate", isSelected && "text-foreground")}>{car.carType}</h3>
        
        <div className={cn("flex items-center justify-center gap-2 text-xs md:text-sm mt-1", isSelected ? "opacity-80 text-foreground" : "text-muted-foreground")}>
            <span className="flex items-center gap-1"><AirVent className="w-3 h-3 md:w-4 md:h-4" /> AC</span>
            <span className="flex items-center gap-1"><Luggage className="w-3 h-3 md:w-4 md:h-4" /> {car.carType.toLowerCase().includes('suv') || car.carType.toLowerCase().includes('innova') ? '2-4' : '1-2'}</span>
        </div>
        
        <div className="mt-2">
            <p className="font-bold text-lg md:text-3xl text-system-green">
              ₹{car.estimatedFare.toFixed(2)}
            </p>
        </div>

        <p className="text-[10px] md:text-sm text-muted-foreground leading-tight mt-1">Incl of Toll (approx), Driver Allowence and other charges</p>
      </CardContent>
    </Card>
  );
}
