
'use client';

import Image from 'next/image';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import type { Car, ContactDetails, ButtonSettings } from '@/lib/types';
import { useState, useRef, useEffect } from 'react';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import { useOnScreen } from '@/hooks/use-on-screen';
import RollingNumber from './rolling-number';

type CarOption = Car & { estimatedFare?: number };

type TripType = 'one-way' | 'round-trip' | 'airport-transfer';

interface CarCardProps {
    car: CarOption;
    onBookNowClick: () => void;
    contactDetails: ContactDetails;
    buttonSettings: ButtonSettings;
}

const transformImageUrl = (url: string | null | undefined): string => {
    if (!url) return 'https://placehold.co/400x250/EFEFEF/AAAAAA&text=No+URL';
    if (url.includes('github.com') && !url.includes('raw.githubusercontent.com')) {
        return url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
    }
    return url;
}

export default function CarCard({ car, onBookNowClick, contactDetails, buttonSettings }: CarCardProps) {
  const [selectedTripType, setSelectedTripType] = useState<TripType>('one-way');
  const ref = useRef<HTMLDivElement>(null);
  const isOnScreen = useOnScreen(ref);

  const getRateForTripType = (tripType: TripType) => {
    switch (tripType) {
      case 'one-way':
        return car.oneWayRate;
      case 'round-trip':
        return car.roundTripRate;
      case 'airport-transfer':
        return car.airportTransferRate;
      default:
        return car.oneWayRate;
    }
  };

  const displayRate = getRateForTripType(selectedTripType);
  
  const formatRate = (rate: number | null | undefined) => {
    if (rate == null) return 'N/A';
    if (rate % 1 === 0) {
      return rate;
    }
    return parseFloat(rate.toFixed(2));
  }

  const tripTypeDisplayNames: Record<TripType, string> = {
    'one-way': 'One Way Drop',
    'round-trip': 'Round Trip',
    'airport-transfer': 'Airport Transfer',
  };
  
  const whatsappMessage = contactDetails.enquiryWhatsappMessage
    .replace('{carType}', car.carType)
    .replace('{tripType}', tripTypeDisplayNames[selectedTripType]);
  const whatsappUrl = `https://wa.me/${contactDetails.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`;
  
  const mailSubject = encodeURIComponent(
      contactDetails.emailSubject
        .replace('{carType}', car.carType)
        .replace('{tripType}', tripTypeDisplayNames[selectedTripType])
  );
  const mailBody = encodeURIComponent(
      contactDetails.emailBody
        .replace('{carType}', car.carType)
        .replace('{tripType}', tripTypeDisplayNames[selectedTripType])
  );
  const mailUrl = `mailto:${contactDetails.email}?subject=${mailSubject}&body=${mailBody}`;

  const instagramUrl = `https://www.instagram.com/${contactDetails.instagram}`;

  const phoneUrl = `tel:${contactDetails.phone}`;
  
  const getEnquireUrl = () => {
    switch(buttonSettings.enquireNowAction) {
        case 'whatsapp': return whatsappUrl;
        case 'instagram': return instagramUrl;
        case 'phone': return phoneUrl;
        case 'email':
        default: 
            return mailUrl;
    }
  }

  const rateValue = formatRate(displayRate);

  return (
    <Card 
      ref={ref}
      className="rounded-[25px] flex flex-col"
    >
      <CardContent className="px-2 pt-2 pb-4 flex-grow flex flex-col">
          <div className="flex-grow flex flex-col items-center">
              <div className="relative w-full aspect-[16/9] overflow-hidden rounded-md h-40 md:h-auto">
                <Image 
                    src={transformImageUrl(car.imageUrl)} 
                    alt={car.carType} 
                    fill
                    className={cn("object-cover", isOnScreen && "animate-slide-in-from-left")}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    data-ai-hint={car.imageHint}
                    loading="lazy" 
                />
              </div>
              
              <div className="flex-1 flex flex-col items-center gap-1 text-center mt-1">
                <div>
                    <h3 className="font-bold text-lg md:text-xl">{car.carType}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">Upto {car.capacity} person Seatings</p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-1 md:gap-2 mt-2">
                    <Button size="sm" variant={selectedTripType === 'one-way' ? 'default' : 'outline'} onClick={() => setSelectedTripType('one-way')} className="text-xs px-2 h-7 md:text-sm md:px-3 md:h-9">One Way Drop</Button>
                    <Button size="sm" variant={selectedTripType === 'airport-transfer' ? 'default' : 'outline'} onClick={() => setSelectedTripType('airport-transfer')} className="text-xs px-2 h-7 md:text-sm md:px-3 md:h-9">Airport</Button>
                </div>
                <div className="font-bold text-lg md:text-xl flex items-baseline gap-1 mt-2">
                  <span>Rs</span>
                  {typeof rateValue === 'number' ? (
                      <RollingNumber 
                        targetNumber={rateValue} 
                        className="text-[32px] md:text-[40px] leading-none text-system-green"
                      />
                  ) : (
                      <span className="text-[32px] md:text-[40px] leading-none text-system-green">{rateValue}</span>
                  )}
                  <span>Per Km</span>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center gap-2 w-full px-4">
                <div className="grid grid-cols-2 gap-2 w-full mt-2">
                    <Button variant="outline" className="w-full text-xs h-8 md:text-sm md:h-9" asChild>
                        <a href={getEnquireUrl()} target="_blank" rel="noopener noreferrer">Enquire Now</a>
                    </Button>
                    <Button onClick={onBookNowClick} className="w-full text-xs h-8 md:text-sm md:h-9" variant="primary">Book Now</Button>
                </div>
              </div>
          </div>
      </CardContent>
    </Card>
  );
}
