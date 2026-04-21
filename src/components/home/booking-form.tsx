
'use client';

import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, ArrowRightLeft, Sun, Moon, Sunrise, MapPin } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import BannerCarousel from './banner-carousel';
import PlacesAutocompleteWrapper from './places-autocomplete-wrapper';
import { useRouter, useSearchParams } from 'next/navigation';
import type { ImagePlaceholder } from '@/lib/types';


const LocationInputMobile = ({ placeholder, value, fieldName, fromValue, toValue }: { placeholder: string; value: string; fieldName: 'from' | 'to', fromValue: string, toValue: string }) => {
    const router = useRouter();

    const handleClick = () => {
        const newParams = new URLSearchParams();
        newParams.set('currentFrom', fromValue);
        newParams.set('currentTo', toValue);
        newParams.set('field', fieldName);
        router.push(`/search-location?${newParams.toString()}`);
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className="w-full h-9 md:h-10 text-xs md:text-sm bg-background rounded-md flex items-center px-3 text-left border border-input"
        >
            <MapPin className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
            {value ? <span className="text-foreground truncate">{value}</span> : <span className="text-muted-foreground">{placeholder}</span>}
        </button>
    );
};

interface BookingFormProps {
    banners: ImagePlaceholder[];
}

export default function BookingForm({ banners }: BookingFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [pickupDate, setPickupDate] = useState<Date | undefined>(undefined);
  const [returnDate, setReturnDate] = useState<Date>();
  const [leavingFrom, setLeavingFrom] = useState('');
  const [goingTo, setGoingTo] = useState('');
  const [rideType, setRideType] = useState('one-way');
  const [isPickupPopoverOpen, setIsPickupPopoverOpen] = useState(false);
  const [isReturnPopoverOpen, setIsReturnPopoverOpen] = useState(false);
  const { toast } = useToast();
  const [greeting, setGreeting] = useState('');
  const [userName, setUserName] = useState('');
  const [greetingIcon, setGreetingIcon] = useState<React.ReactNode>(null);
  const [isClient, setIsClient] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');
    if (fromParam) setLeavingFrom(fromParam);
    if (toParam) setGoingTo(toParam);
  }, [searchParams]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good Morning');
      setGreetingIcon(<Sunrise className="inline-block ml-2 text-yellow-500" />);
    } else if (hour < 18) {
      setGreeting('Good Afternoon');
      setGreetingIcon(<Sun className="inline-block ml-2 text-orange-500" />);
    } else {
      setGreeting('Good Evening');
      setGreetingIcon(<Moon className="inline-block ml-2 text-gray-400" />);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      if (user) {
        setUserName(user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || '');
      } else {
        setUserName('');
      }
    });
    
    // Set initial date only on the client
    setPickupDate(new Date());

    return () => subscription.unsubscribe();
  }, []);
  
  const showReturnDate = rideType === 'round-trip';

  useEffect(() => {
    if (rideType !== 'round-trip') {
      setReturnDate(undefined);
    }
  }, [rideType]);

  let bookingUrl = `/book?from=${encodeURIComponent(leavingFrom)}&to=${encodeURIComponent(goingTo)}&rideType=${rideType}`;
  if (pickupDate) {
    bookingUrl += `&date=${format(pickupDate, 'yyyy-MM-dd')}`;
  }
   if (returnDate && showReturnDate) {
    bookingUrl += `&returnDate=${format(returnDate, 'yyyy-MM-dd')}`;
  }


  const isButtonDisabled = !leavingFrom || !goingTo || !pickupDate;
  
  const handleGetRideClick = (e: React.MouseEvent<HTMLElement>) => {
    if (isButtonDisabled) {
      e.preventDefault();
      toast({
        title: "Missing Information",
        description: "Please provide pickup, drop-off, and date to find a ride.",
        variant: "destructive",
      });
      return;
    }

    if (leavingFrom && goingTo && leavingFrom.trim().toLowerCase() === goingTo.trim().toLowerCase()) {
        e.preventDefault();
        toast({
            title: "Invalid Locations",
            description: "Pickup and drop-off locations cannot be the same.",
            variant: "destructive",
        });
        return;
    }
  };
  

  return (
    <div className="relative container mx-auto px-4 flex flex-col justify-center mt-6">
        <div className="w-full text-center md:text-left mb-4">
            <h1 className="text-xl md:text-2xl font-bold text-foreground">
                Hi <span className="text-primary">{userName || 'there'}</span>, {greeting}!
                {greetingIcon}
            </h1>
            <p className="hidden md:block text-xs md:text-base text-foreground/80 mt-2">Welcome to ZyroCabs! We provide safe, reliable, and affordable cab services. Whether it’s a short city trip or a long-distance journey, our professional drivers and well-maintained vehicles ensure a comfortable travel experience. Book your ride easily and travel with confidence.</p>
        </div>

        <div className="my-4">
            <div className="max-w-6xl mx-auto">
                <BannerCarousel banners={banners} />
            </div>
        </div>

        <div 
            className={cn(
                "relative z-10 p-2 md:p-6 bg-card/60 dark:bg-white/10 backdrop-blur-md border border-border/30 rounded-2xl shadow-2xl w-full text-foreground transition-all duration-300 ease-in-out hover:shadow-primary/20",
                showReturnDate ? "max-w-5xl self-center" : "max-w-4xl self-center"
            )}
        >
        <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-4 items-center">
             <div className="grid grid-cols-2 md:grid-cols-2 gap-2 w-full">
                {isClient && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? (
                    <>
                        <LocationInputMobile placeholder="From" value={leavingFrom} fieldName="from" fromValue={leavingFrom} toValue={goingTo} />
                        <LocationInputMobile placeholder="To" value={goingTo} fieldName="to" fromValue={leavingFrom} toValue={goingTo} />
                    </>
                ) : (
                    <>
                        <PlacesAutocompleteWrapper placeholder="From" onLocationSelect={(addr) => setLeavingFrom(addr)} defaultValue={leavingFrom} />
                        <PlacesAutocompleteWrapper placeholder="To" onLocationSelect={(addr) => setGoingTo(addr)} defaultValue={goingTo} />
                    </>
                )}
            </div>
            
            <div className={cn(
                "grid grid-cols-1 gap-2 w-full",
                 showReturnDate ? "md:grid-cols-3" : "md:grid-cols-2"
            )}>
                 <div className="grid grid-cols-2 gap-2 col-span-1 md:col-span-2 justify-center">
                    <Select value={rideType} onValueChange={setRideType}>
                      <SelectTrigger className="bg-background h-9 md:h-10 text-xs md:text-sm">
                        <SelectValue placeholder="Ride Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="one-way">One Way</SelectItem>
                        <SelectItem value="airport-transfer">Airport Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                    
                      <Popover open={isPickupPopoverOpen} onOpenChange={setIsPickupPopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button
                            variant={"outline"}
                            className={"w-full justify-start text-left font-normal h-9 md:h-10 text-xs md:text-sm"}
                            >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {pickupDate ? format(pickupDate, "MMM d") : <span>Pickup Date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                            mode="single"
                            selected={pickupDate}
                            onSelect={(date) => {
                                setPickupDate(date);
                                setIsPickupPopoverOpen(false);
                            }}
                            disabled={{ before: new Date(new Date().setDate(new Date().getDate() - 1)) }}
                            initialFocus
                            />
                        </PopoverContent>
                      </Popover>
                  </div>
                  
                  {showReturnDate && (
                      <Popover open={isReturnPopoverOpen} onOpenChange={setIsReturnPopoverOpen}>
                      <PopoverTrigger asChild>
                          <Button
                          variant={"outline"}
                          className="w-full justify-start text-left font-normal h-9 md:h-10 text-xs md:text-sm"
                          >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {returnDate ? format(returnDate, "MMM d") : <span>Return Date</span>}
                          </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                          <Calendar
                          mode="single"
                          selected={returnDate}
                          onSelect={(date) => {
                              setReturnDate(date);
                              setIsReturnPopoverOpen(false);
                          }}
                          disabled={{ before: pickupDate || new Date() }}
                          initialFocus
                          />
                      </PopoverContent>
                      </Popover>
                  )}
            </div>

        </div>
        </div>
        <div className="w-full flex justify-center mt-4">
            <Link href={isButtonDisabled ? '#' : bookingUrl} className="w-auto" aria-disabled={isButtonDisabled} onClick={handleGetRideClick}>
                <Button className="w-48 h-9 md:h-10 text-sm md:text-base" disabled={isButtonDisabled}>Get Ride</Button>
            </Link>
        </div>
    </div>
  );
}
