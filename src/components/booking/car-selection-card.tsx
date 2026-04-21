
'use client';

import * as React from 'react';
import type { Car, InclusionsExclusions, TaxesAndCharges, TaxItem, DriverAllowanceRule } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Star, ChevronDown, ChevronUp, XCircle, CheckCircle, Circle, Check, AirVent, Luggage } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { getInclusionsExclusions, getTaxesAndCharges, getDriverAllowanceRules } from '@/lib/actions';
import { Skeleton } from '../ui/skeleton';

type CarOption = Car & { estimatedFare: number };

interface CarSelectionCardProps {
  car: CarOption;
  isSelected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
  distance: number | null;
}

const DetailRow = ({ label, value }: { label: string; value: string | React.ReactNode }) => (
    <div className="grid grid-cols-2 items-center text-sm py-0.5">
        <p className="text-muted-foreground">{label}</p>
        <p className="font-medium text-right">{value}</p>
    </div>
);

const transformImageUrl = (url: string) => {
    if (url.includes('github.com') && !url.includes('raw.githubusercontent.com')) {
        return url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
    }
    return url;
};

export default function CarSelectionCard({ car, isSelected, onSelect, children, distance }: CarSelectionCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-300 overflow-hidden shadow-lg",
        isSelected ? "ring-2 ring-primary border-primary bg-primary/10 shadow-primary/30" : "hover:shadow-xl"
      )}
      onClick={onSelect}
    >
        <div>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-[288px_1fr_auto] items-center gap-4">
                {React.cloneElement(children as React.ReactElement, {
                    key: car.id,
                    src: transformImageUrl(car.imageUrl)
                })}

                <div className="flex-grow text-center md:border-l md:border-r md:px-2">
                    <h3 className="font-bold text-xl">{car.carType}</h3>
                    <p className="text-sm text-muted-foreground">Upto {car.capacity} person Seatings</p>
                     <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><AirVent className="w-4 h-4 text-primary" /> AC</span>
                        <span className="flex items-center gap-1"><Luggage className="w-4 h-4 text-primary" /> {car.carType.toLowerCase().includes('suv') || car.carType.toLowerCase().includes('innova') ? '2-4' : '1-2'} Luggages</span>
                    </div>
                </div>

                <div className="text-center px-8 w-full md:w-60 flex flex-col items-center gap-2">
                    <div className="w-full">
                        <p className="font-bold text-2xl text-system-green">
                        Rs {car.estimatedFare.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">incl of Driver Fee</p>
                    </div>
                     <Button
                        variant={isSelected ? "default" : "outline"}
                        className="w-full"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect();
                        }}
                    >
                        {isSelected ? <Check className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                        {isSelected ? 'Selected' : 'Select'}
                    </Button>
                </div>
            </div>
          </CardContent>
        </div>
    </Card>
  );
}
