

'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Car, TaxesAndCharges, TollPlaza, InclusionsExclusions, Offer } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { getCalculatedCarOptions, getTaxesAndCharges, getInclusionsExclusions, getOffersFromFirestore } from '@/lib/actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowRightLeft, ArrowRight, Route, Clock, X } from 'lucide-react';
import DirectionsMap from '@/components/booking/directions-map';
import { useToast } from '@/hooks/use-toast';
import WelcomeAnimation from '@/components/home/welcome-animation';
import MobileCarCard from '@/components/booking/mobile-car-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import FareDetailsCard from '@/components/booking/fare-details-card';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { TimePicker } from '@/components/ui/time-picker';
import CountryCodeSelector from '@/components/ui/country-code-selector';
import { countries } from '@/lib/countries';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

type CarOption = Car & { estimatedFare: number; driverFee: number; permitFee: number };
interface FormErrors {
    name?: string;
    phone?: string;
    email?: string;
    pickupTime?: string;
    passengers?: string;
    isWhatsapp?: string;
}

export default function BookPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast, toasts } = useToast();
  
  // URL Params
  const leavingFrom = searchParams.get('from');
  const goingTo = searchParams.get('to');
  const rideType = searchParams.get('rideType') || 'one-way';
  const pickupDate = searchParams.get('date');
  const returnDate = searchParams.get('returnDate');

  // UI State
  const [showWelcome, setShowWelcome] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);

  // Data State
  const [cars, setCars] = useState<CarOption[]>([]);
  const [selectedCar, setSelectedCar] = useState<CarOption | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [tollPlazas, setTollPlazas] = useState<TollPlaza[]>([]);
  const [taxesAndCharges, setTaxesAndCharges] = useState<TaxesAndCharges | null>(null);
  const [inclusionsExclusions, setInclusionsExclusions] = useState<InclusionsExclusions | null>(null);
  const [originState, setOriginState] = useState<string | null>(null);
  const [destinationState, setDestinationState] = useState<string | null>(null);
  const [statesCrossed, setStatesCrossed] = useState<string[]>([]);
  
  // User & Form State
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [pickupTime, setPickupTime] = useState('');
  const [isWhatsapp, setIsWhatsapp] = useState(false);
  const [passengers, setPassengers] = useState('1');
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Coupon State
  const [offers, setOffers] = useState<Offer[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Offer | null>(null);
  const [appliedAdminOffer, setAppliedAdminOffer] = useState<Offer | null>(null);
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const supabase = createClient();
  
  const finalAppliedOffer = appliedCoupon || appliedAdminOffer;
  const [discountAmount, setDiscountAmount] = useState(0);

  useEffect(() => {
    if (finalAppliedOffer && selectedCar) {
      const newDiscount = finalAppliedOffer.discountType === 'percentage'
        ? (selectedCar.estimatedFare * finalAppliedOffer.discountValue) / 100
        : finalAppliedOffer.discountValue;
      setDiscountAmount(newDiscount);
    } else {
      setDiscountAmount(0);
    }
  }, [finalAppliedOffer, selectedCar]);


  const carCapacity = selectedCar ? selectedCar.capacity : 1;

  // Derived display values
  const shortenAddress = (address: string | null) => {
    if (!address) return 'N/A';
    if (/^-?[\d.]+(,\s*-?[\d.]+)+$/.test(address)) return 'Current Location';
    return address.split(',').slice(0, 2).join(', ');
  }
  const displayLeavingFrom = shortenAddress(leavingFrom);


  useEffect(() => {
    const hasSeenWelcome = sessionStorage.getItem('hasSeenBookPageWelcome');
    if (hasSeenWelcome) {
        setShowWelcome(false);
    } else {
        const welcomeTimer = setTimeout(() => {
            setShowWelcome(false);
            sessionStorage.setItem('hasSeenBookPageWelcome', 'true');
        }, 2000); 
        return () => clearTimeout(welcomeTimer);
    }
  }, []);

  useEffect(() => {
    async function fetchData() {
      if (!leavingFrom || !goingTo) return;
      setLoading(true);

      const [carResult, taxes, inclusions, fetchedOffers] = await Promise.all([
          getCalculatedCarOptions(leavingFrom, goingTo, rideType),
          getTaxesAndCharges(),
          getInclusionsExclusions(),
          getOffersFromFirestore(),
      ]);

      setTaxesAndCharges(taxes);
      setInclusionsExclusions(inclusions);
      setOffers(fetchedOffers);
      
      if (carResult && carResult.carOptions && carResult.distance) {
        setCars(carResult.carOptions as CarOption[]);
        setDistance(carResult.distance);
        setDuration(carResult.duration);
        setTollPlazas(carResult.tollPlazas || []);
        setOriginState(carResult.originState || null);
        setDestinationState(carResult.destinationState || null);
        setStatesCrossed(carResult.statesCrossed || []);
        
        if (carResult.carOptions.length > 0) {
            setSelectedCar(carResult.carOptions[0] as CarOption);
        }
        setLoading(false);
      } else if (carResult && carResult.error) {
           toast({
                title: "Invalid Ride",
                description: carResult.error,
                variant: "destructive",
           });
           router.push('/');
      }
    }
    fetchData();

  }, [leavingFrom, goingTo, rideType, router, toast]);

  useEffect(() => {
    // Automatically apply an admin offer if available and no user coupon is already applied
    if (appliedCoupon) {
      setAppliedAdminOffer(null);
      return;
    }
    
    const now = new Date();
    const activeAdminOffer = offers.find(o => 
        o.offerType === 'admin' &&
        o.isActive &&
        (!o.startDate || new Date(o.startDate) <= now) &&
        (!o.endDate || new Date(o.endDate) >= now) &&
        (o.targetAudience === 'all' || (o.targetAudience === 'signed-in' && !!user))
    );

    if (activeAdminOffer) {
        setAppliedAdminOffer(activeAdminOffer);
        if (toasts && !toasts.some(t => t.title === "Special Offer Applied!")) {
            toast({
                title: "Special Offer Applied!",
                description: `${activeAdminOffer.title} Claimed Successfully,`,
            });
        }
    } else {
        setAppliedAdminOffer(null);
    }
  }, [offers, selectedCar, appliedCoupon, toast, toasts, user]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        const currentUser = session?.user || null;
        setUser(currentUser);
        if (currentUser) {
            setName(currentUser.user_metadata?.full_name || currentUser.email || '');
            setEmail(currentUser.email || '');
            // Mobile number handling might be different in Supabase if using phone auth,
            // but here we follow the existing pattern.
        }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleCarSelect = (car: CarOption) => {
    setSelectedCar(car);
  };
  
  const handleSwapLocations = () => {
    if (!leavingFrom || !goingTo) return;
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('from', goingTo);
    newParams.set('to', leavingFrom);
    router.push(`/book?${newParams.toString()}`);
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value.replace(/[^0-9]/g, '');
    const selectedCountry = countries.find(c => c.dial_code === countryCode);
    let maxLength = 15; 
    if (selectedCountry && selectedCountry.length) {
      maxLength = Array.isArray(selectedCountry.length) ? Math.max(...selectedCountry.length) : selectedCountry.length;
    }
    if (numericValue.length <= maxLength) {
      setPhone(numericValue);
    }
  };

  const getPhoneMaxLength = () => {
    const selectedCountry = countries.find(c => c.dial_code === countryCode);
    if (selectedCountry?.length) {
        return Array.isArray(selectedCountry.length) ? Math.max(...selectedCountry.length) : selectedCountry.length;
    }
    return 15;
  }

  const isPhoneNumberValid = () => {
    if (!phone) return false;
    const selectedCountry = countries.find(c => c.dial_code === countryCode);
    if (selectedCountry && selectedCountry.length) {
        const phoneLength = phone.length;
        if (Array.isArray(selectedCountry.length)) {
            return selectedCountry.length.includes(phoneLength);
        } else {
            return phoneLength === selectedCountry.length;
        }
    }
    return phone.length > 0;
  }

  const handleProceed = () => {
    const errors: FormErrors = {};
    if (!name) errors.name = 'Name is required.';
    if (!email) {
        errors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
        errors.email = 'Email is invalid.';
    }
    if (!phone) {
        errors.phone = 'Phone number is required.';
    } else if (!isPhoneNumberValid()) {
         const selectedCountry = countries.find(c => c.dial_code === countryCode);
        if (selectedCountry && selectedCountry.length) {
            if (Array.isArray(selectedCountry.length)) {
                errors.phone = `Must be ${selectedCountry.length.join(' or ')} digits.`;
            } else {
                errors.phone = `Must be ${selectedCountry.length} digits.`;
            }
        } else {
             errors.phone = 'Phone number is not valid.';
        }
    }
    if (!pickupTime) errors.pickupTime = 'Pickup time is required.';
    if (!passengers || parseInt(passengers, 10) < 1) errors.passengers = 'At least 1 passenger is required.';
    if (!isWhatsapp) errors.isWhatsapp = 'Please confirm your WhatsApp number.';
    
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
         toast({
            title: "Missing Information",
            description: "Please fill out all required fields correctly before proceeding.",
            variant: "destructive",
         });
         return;
    }

    if (!selectedCar || !pickupDate || !distance) {
        toast({
            title: "Data Error",
            description: "Could not retrieve all necessary booking data. Please try again.",
            variant: "destructive"
        });
        return;
    }
    
    const getRateForTripType = (car: Car) => {
        switch (rideType) {
            case 'airport-transfer': return car.airportTransferRate;
            case 'one-way':
            default: return car.oneWayRate;
        }
    };
    const baseRate = getRateForTripType(selectedCar);
    
    const finalFare = (selectedCar.estimatedFare || 0) - discountAmount;

    const summaryParams = new URLSearchParams({
        name,
        email,
        phone: `${countryCode}${phone}`,
        pickupTime,
        passengers,
        from: leavingFrom!,
        to: goingTo!,
        displayFrom: displayLeavingFrom,
        rideType,
        pickupDate: pickupDate!,
        distance: distance.toString(),
        carId: selectedCar.id,
        carType: selectedCar.carType,
        carImageUrl: selectedCar.imageUrl,
        capacity: selectedCar.capacity.toString(),
        baseRate: baseRate.toString(),
        driverFee: (selectedCar.driverFee || 0).toString(),
        permitFee: (selectedCar.permitFee || 0).toString(),
        taxesAndCharges: JSON.stringify(taxesAndCharges),
        tollPlazaCount: tollPlazas.length.toString(),
        originState: originState || '',
        destinationState: destinationState || '',
        statesCrossed: JSON.stringify(statesCrossed),
        finalFare: finalFare.toString(),
        discountAmount: discountAmount.toString(),
        appliedCoupon: finalAppliedOffer ? JSON.stringify(finalAppliedOffer) : '',
    });

    router.push(`/booking-summary?${summaryParams.toString()}`);
  };

  const handleApplyCoupon = () => {
    setCouponError('');
    setIsApplyingCoupon(true);

    const now = new Date();
    const validOffer = offers.find(
      (o) =>
        o.offerType === 'coupon' &&
        o.code.toLowerCase() === couponCode.toLowerCase() &&
        o.isActive &&
        (!o.startDate || new Date(o.startDate) <= now) &&
        (!o.endDate || new Date(o.endDate) >= now)
    );

    if (validOffer && selectedCar) {
        setAppliedCoupon(validOffer);
        toast({
            title: "Coupon Applied!",
            description: `You've received a discount for ${validOffer.title}.`,
        });
    } else {
        setCouponError('This coupon is not valid or has expired.');
    }
    setIsApplyingCoupon(false);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };


  const formatDuration = (seconds: number | null) => {
    if (seconds === null) return null;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };


  if (showWelcome) {
    return <WelcomeAnimation />;
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-center items-center mb-4 relative">
          <h1 className="text-xl font-bold">Let's Ride</h1>
        </div>

        <div className="bg-card p-4 rounded-lg shadow-lg mb-4">
           <div className="flex items-center">
              <div className="flex-grow space-y-2">
                 <div className="flex items-start">
                    <span className="text-xs font-bold bg-muted text-muted-foreground rounded-full h-5 w-5 flex items-center justify-center mr-2 mt-1">A</span>
                    <div>
                        <p className="text-xs text-muted-foreground">Pickup</p>
                        <p className="font-semibold text-sm">{displayLeavingFrom}</p>
                    </div>
                 </div>
                 <div className="flex items-start">
                     <span className="text-xs font-bold bg-muted text-muted-foreground rounded-full h-5 w-5 flex items-center justify-center mr-2 mt-1">B</span>
                    <div>
                        <p className="text-xs text-muted-foreground">Drop off</p>
                        <p className="font-semibold text-sm">{shortenAddress(goingTo)}</p>
                    </div>
                 </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleSwapLocations}>
                <ArrowRightLeft className="w-4 h-4 text-muted-foreground rotate-90" />
              </Button>
           </div>
        </div>
        
        <div className="h-64 rounded-lg overflow-hidden mb-4 relative bg-card">
          {leavingFrom && goingTo ? (
            <DirectionsMap origin={leavingFrom} destination={goingTo} tollPlazas={tollPlazas} />
          ) : (
            <Skeleton className="w-full h-full" />
          )}
        </div>

        {!loading && (distance || duration || tollPlazas) && (
            <div className="mb-4 grid grid-cols-2 gap-4">
                 <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center gap-2 h-full text-center">
                        <Route className="w-8 h-8 text-foreground" />
                        <p className="text-sm text-muted-foreground">Distance</p>
                        <p className="font-bold text-xl md:text-2xl text-primary whitespace-nowrap">{distance ? `${distance.toFixed(1)} km` : 'N/A'}</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center gap-2 h-full text-center">
                        <Clock className="w-8 h-8 text-foreground" />
                        <p className="text-sm text-muted-foreground">Travel Time</p>
                        <p className="font-bold text-xl md:text-2xl text-primary whitespace-nowrap">{duration ? formatDuration(duration) : 'N/A'}</p>
                    </CardContent>
                </Card>
            </div>
        )}
        
        <div className="pb-8">
            <div className="text-center mb-4">
              <h2 className="text-lg font-semibold">Choose Car Type</h2>
            </div>
            <div className="max-w-full overflow-x-auto">
              <div className="px-4">
                <div className="flex space-x-4 pb-4 no-scrollbar">
                    {loading ? (
                        Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="w-48 md:w-[350px] h-[260px] md:h-[300px] rounded-lg flex-shrink-0" />)
                    ) : (
                        cars.map((car) => (
                            <MobileCarCard 
                                key={car.id}
                                car={car}
                                isSelected={selectedCar?.id === car.id}
                                onSelect={() => handleCarSelect(car)}
                            />
                        ))
                    )}
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div>
                  {selectedCar && distance && taxesAndCharges && inclusionsExclusions ? (
                    <>
                      <FareDetailsCard
                          selectedCar={selectedCar}
                          distance={distance}
                          taxesAndCharges={taxesAndCharges}
                          inclusionsExclusions={inclusionsExclusions}
                          rideType={rideType}
                          tollPlazaCount={tollPlazas.length}
                          originState={originState}
                          destinationState={destinationState}
                          statesCrossed={statesCrossed}
                          appliedCoupon={finalAppliedOffer}
                          discountAmount={discountAmount}
                      />
                       <Card className={`mt-4 ${couponError ? "border-destructive" : ""}`}>
                          <CardHeader>
                              <CardTitle>Apply Coupon</CardTitle>
                          </CardHeader>
                          <CardContent>
                              <div className="flex gap-2">
                                  <Input 
                                      placeholder="Enter Coupon Code" 
                                      value={couponCode} 
                                      onChange={(e) => {
                                        setCouponCode(e.target.value)
                                        if (couponError) setCouponError('');
                                      }}
                                      disabled={!!appliedCoupon}
                                  />
                                   {appliedCoupon ? (
                                    <Button variant="ghost" onClick={handleRemoveCoupon}>
                                        <X className="mr-2 h-4 w-4" /> Remove
                                    </Button>
                                   ) : (
                                    <Button onClick={handleApplyCoupon} disabled={isApplyingCoupon}>
                                        {isApplyingCoupon && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Apply
                                    </Button>
                                   )}
                              </div>
                               {couponError && <p className="text-sm text-destructive mt-2">{couponError}</p>}
                               {appliedCoupon && appliedCoupon.offerType === 'coupon' && (
                                <p className="text-sm text-green-600 mt-2">
                                  Coupon <span className="font-bold">{appliedCoupon.code}</span> applied successfully!
                                </p>
                              )}
                          </CardContent>
                      </Card>
                    </>
                  ) : loading ? <Skeleton className="h-96 w-full" /> : null}
                </div>

                <div>
                   <Card>
                      <CardHeader>
                          <CardTitle>Enter Your Details</CardTitle>
                          <CardDescription>We need a few details to finalize your booking.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                          <div className="space-y-2">
                              <Label htmlFor="passengers">Number of Passengers</Label>
                              <Select name="passengers" value={passengers} onValueChange={value => { setPassengers(value); setFormErrors(p => ({...p, passengers: undefined})) }}>
                                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                                  <SelectContent>
                                      {Array.from({ length: carCapacity }, (_, i) => i + 1).map(num => (
                                          <SelectItem key={num} value={num.toString()}>{num} {num === 1 ? 'Passenger' : 'Passengers'}</SelectItem>
                                      ))}
                                  </SelectContent>
                              </Select>
                              {formErrors.passengers && <p className="text-xs text-destructive">{formErrors.passengers}</p>}
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="name">Full Name</Label>
                              <Input id="name" value={name} onChange={e => { setName(e.target.value); setFormErrors(p => ({...p, name: undefined})) }} placeholder="Your full name" required />
                              {formErrors.name && <p className="text-xs text-destructive">{formErrors.name}</p>}
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="email">Email</Label>
                              <Input id="email" type="email" value={email} onChange={e => { setEmail(e.target.value); setFormErrors(p => ({...p, email: undefined})) }} placeholder="your.email@example.com" required />
                              {formErrors.email && <p className="text-xs text-destructive">{formErrors.email}</p>}
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="phone">Phone Number</Label>
                              <div className="flex gap-2">
                                  <CountryCodeSelector value={countryCode} onValueChange={setCountryCode} />
                                  <Input id="phone" type="tel" value={phone} onChange={e => { handlePhoneChange(e); setFormErrors(p => ({...p, phone: undefined})) }} placeholder="Your contact number" required maxLength={getPhoneMaxLength()} />
                              </div>
                              {formErrors.phone && <p className="text-xs text-destructive">{formErrors.phone}</p>}
                          </div>
                          <div className="flex items-center space-x-2">
                              <Checkbox id="is-whatsapp" checked={isWhatsapp} onCheckedChange={(checked) => { setIsWhatsapp(!!checked); setFormErrors(p => ({...p, isWhatsapp: undefined})); }} />
                              <Label htmlFor="is-whatsapp" className="text-sm">The mobile number provided is also my WhatsApp number.</Label>
                          </div>
                          {formErrors.isWhatsapp && <p className="text-xs text-destructive">{formErrors.isWhatsapp}</p>}
                          <div className="space-y-2">
                              <Label htmlFor="pickup-time">Pickup Time</Label>
                              <TimePicker value={pickupTime} onChange={time => { setPickupTime(time); setFormErrors(p => ({...p, pickupTime: undefined})) }} />
                              {formErrors.pickupTime && <p className="text-xs text-destructive">{formErrors.pickupTime}</p>}
                          </div>
                      </CardContent>
                  </Card>
                </div>
            </div>

            {selectedCar && (
                <div className="mt-8 flex justify-center">
                   <Button size="lg" className="h-12 text-lg px-8" onClick={handleProceed}>
                       Next
                       <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </div>
            )}
        </div>

      </div>
    </div>
  );
}

    
