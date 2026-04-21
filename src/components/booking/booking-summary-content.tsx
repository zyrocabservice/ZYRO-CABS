

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, MapPin, CheckCircle, Mail, Phone, Calendar as CalendarIcon, X, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { confirmAndSaveBooking } from '@/lib/actions';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { format } from 'date-fns';
import type { TaxItem, TaxesAndCharges, Offer } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { TimePicker } from '../ui/time-picker';
import CountryCodeSelector from '../ui/country-code-selector';
import { countries } from '@/lib/countries';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import LottieAnimation from '../home/lottie-animation';


const DetailRow = ({ label, value, valueClass, subValue }: { label: React.ReactNode; value: string | React.ReactNode; valueClass?: string; subValue?: string }) => (
    <div className="flex justify-between items-center text-xs md:text-sm py-1">
        <div className="text-muted-foreground">{label}</div>
        <div className="text-right">
            <p className={`font-medium ${valueClass}`}>{value}</p>
            {subValue && <p className="text-xs text-muted-foreground">{subValue}</p>}
        </div>
    </div>
);

const transformImageUrl = (url: string) => {
    if (!url) return 'https://placehold.co/400x250/EFEFEF/AAAAAA&text=Car';
    if (url.includes('github.com') && !url.includes('raw.githubusercontent.com')) {
        return url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
    }
    return url;
};

interface FormErrors {
    name?: string;
    phone?: string;
    email?: string;
    pickupTime?: string;
    passengers?: string;
    isWhatsapp?: string;
}

export default function BookingSummaryContent() {
    const router = useRouter();
    const params = useSearchParams();
    const { toast } = useToast();

    const [isConfirming, setIsConfirming] = useState(false);
    const [isTermsAccepted, setIsTermsAccepted] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const supabase = createClient();

    // Form fields from previous step are now part of the URL.
    // Let's get them for display and final confirmation.
    const name = params.get('name') || '';
    const email = params.get('email') || '';
    const fullPhone = params.get('phone') || '';
    const pickupTime = params.get('pickupTime') || '';
    const passengers = params.get('passengers') || '1';

    // Ride Details
    const from = params.get('from') || '';
    const to = params.get('to') || '';
    const displayFrom = params.get('displayFrom') || 'N/A';
    const rideType = params.get('rideType') || 'N/A';
    const pickupDateRaw = params.get('pickupDate') || 'N/A';
    const distance = parseFloat(params.get('distance') || '0');
    const originState = params.get('originState');
    const destinationState = params.get('destinationState');
    const statesCrossedRaw = params.get('statesCrossed');
    const statesCrossed: string[] = statesCrossedRaw ? JSON.parse(statesCrossedRaw) : [];
    
    // Car & Fare Details
    const carId = params.get('carId') || '';
    const carType = params.get('carType') || 'N/A';
    const carImageUrl = params.get('carImageUrl') || 'https://placehold.co/400x250/EFEFEF/AAAAAA&text=Car';
    const capacity = parseInt(params.get('capacity') || '1', 10);
    const baseRate = parseFloat(params.get('baseRate') || '0');
    const driverFee = parseFloat(params.get('driverFee') || '0');
    const permitFee = parseFloat(params.get('permitFee') || '0');
    
    // Taxes & Charges & Coupon
    const taxesAndChargesRaw = params.get('taxesAndCharges');
    const taxesAndCharges: TaxesAndCharges | null = taxesAndChargesRaw ? JSON.parse(taxesAndChargesRaw) : null;
    const tollPlazaCount = parseInt(params.get('tollPlazaCount') || '0');
    const finalFare = parseFloat(params.get('finalFare') || '0');
    const discountAmount = parseFloat(params.get('discountAmount') || '0');
    const appliedCouponRaw = params.get('appliedCoupon');
    const appliedCoupon: Offer | null = appliedCouponRaw ? JSON.parse(appliedCouponRaw) : null;


    const shortenAddress = (address: string | null) => {
        if (!address) return 'N/A';
        if (/^-?[\d.]+(,\s*-?[\d.]+)+$/.test(address)) return 'Selected Location';
        return address.split(',').slice(0, 2).join(', ');
    }
    const displayTo = shortenAddress(to);


    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
        });
        return () => subscription.unsubscribe();
    }, []);

    const calculateCharge = (chargeValue: string | number | undefined, base: number): number => {
        if (chargeValue === undefined || chargeValue === null) return 0;
        const valueStr = String(chargeValue).trim();
        if (valueStr.toLowerCase() === 'as applicable' || valueStr.toLowerCase() === 'not applicable') return 0;
        const numericValue = parseFloat(valueStr.replace(/[^0-9.]/g, ''));
        if (!isNaN(numericValue) && numericValue >= 0) return numericValue;
        return 0;
    };

    const calculateTax = (chargeValue: string | number | undefined, base: number): number => {
        if (chargeValue === undefined || chargeValue === null) return 0;
        const valueStr = String(chargeValue).trim();
        if (valueStr.toLowerCase() === 'as applicable' || valueStr.toLowerCase() === 'not applicable') return 0;
        let numericValue = -1;
        if (valueStr.includes('%')) {
            numericValue = parseFloat(valueStr.replace('%', ''));
        } else {
            numericValue = parseFloat(valueStr);
        }
        if (!isNaN(numericValue) && numericValue >= 0) return base * (numericValue / 100);
        return 0;
    };
    
    const billingDistance = Math.max(distance, 130);
    const isMinBillingApplied = distance < 130;
    const totalBaseFare = baseRate * billingDistance;

    const perTollCharge = (taxesAndCharges && typeof taxesAndCharges.tollCharges === 'string') ? parseFloat(taxesAndCharges.tollCharges) : (taxesAndCharges?.tollCharges || 0) as number;
    const finalTollCharge = isNaN(perTollCharge) ? 0 : perTollCharge * tollPlazaCount;
    
    const permitStates = (statesCrossed || []).filter(s => originState && s.toLowerCase() !== originState.toLowerCase());
    
    const hasInterStateTravel = permitStates.length > 0;
    
    const taxItems = taxesAndCharges?.taxes
            .filter(tax => tax.enabled)
            .map(tax => {
                const amount = calculateTax(tax.value, totalBaseFare);
                return { ...tax, amount, value: String(tax.value) };
            }) || [];
    
    const totalTaxAmount = taxItems.reduce((acc, tax) => {
        return acc + tax.amount;
    }, 0);
    
    const calculatedTotalAmount = totalBaseFare + driverFee + permitFee + finalTollCharge + totalTaxAmount;
    const formattedPickupDate = pickupDateRaw && pickupDateRaw !== 'N/A' ? format(new Date(pickupDateRaw), 'dd-MM-yyyy') : 'N/A';

    const handleConfirmRide = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setIsConfirming(true);

        try {
            const bookingDetails = {
                from,
                to,
                customerName: name,
                customerEmail: email,
                customerPhone: fullPhone,
                customerUid: user?.id, // Can be undefined for guest users
                carType,
                passengers,
                pickupTime,
                pickupDate: pickupDateRaw,
                estimatedFare: finalFare,
                distance: distance.toFixed(1),
                rideType,
                tollCharges: finalTollCharge.toString() ?? '0',
                taxes: JSON.stringify(taxesAndCharges?.taxes ?? []),
                subTotal: finalFare,
            };

            const result = await confirmAndSaveBooking(bookingDetails);

            if (result.success && result.bookingId) {
                const finalParams = new URLSearchParams({
                    from: displayFrom,
                    to: displayTo,
                });
                router.replace(`/booking/${result.bookingId}?${finalParams.toString()}`);
            } else {
                throw new Error(result.error || 'An unknown error occurred.');
            }

        } catch (error: any) {
             console.error("Failed to Save Booking:", `Could not save booking. Error: ${error.message}`);
             toast({
                title: "Booking Failed",
                description: "Could not save your booking. Please try again later.",
                variant: "destructive"
             });
             setIsConfirming(false);
        }
    };


    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="relative text-center">
                    <Button variant="ghost" size="icon" className="absolute left-0 top-1/2 -translate-y-1/2" onClick={() => router.back()}>
                        <ArrowLeft />
                    </Button>
                    <h1 className="text-xl md:text-2xl font-bold">Confirm Your Ride</h1>
                    <p className="text-xs md:text-sm text-muted-foreground">Please review the details below before confirming.</p>
                </div>
                <Card>
                    <CardContent className="p-4 md:p-6 grid md:grid-cols-2 gap-8 pt-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center my-2">
                                <div className="flex-1 text-left">
                                    <h3 className="font-bold text-base">{carType}</h3>
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-1">
                                        <span className="flex items-center gap-1"><Users className="w-3 h-3 text-primary"/> {capacity} people</span>
                                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-primary"/> {distance ? distance.toFixed(1) : 'N/A'} km</span>
                                    </div>
                                </div>
                                <div className="relative w-28 h-20 rounded-md overflow-hidden">
                                    <Image src={transformImageUrl(carImageUrl)} alt={carType} fill className="object-contain"/>
                                </div>
                            </div>
                            <div className="bg-green-50 text-green-700 p-2 rounded-md text-xs flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                                <span>100% of drivers are police verified, licensed and audited</span>
                            </div>
                            <div className="relative pl-4">
                                
                                <div className="flex items-start gap-3 mb-4">
                                    <MapPin className="w-4 h-4 text-destructive mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Pickup</p>
                                        <p className="font-semibold text-sm">{displayFrom}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-4 h-4 text-destructive mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Drop</p>
                                        <p className="font-semibold text-sm">{displayTo}</p>
                                    </div>
                                </div>
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                <h4 className="font-semibold text-base mb-2">Your Details</h4>
                                <div className="flex items-center gap-2 text-xs"><Users className="w-3 h-3 text-muted-foreground" /> {name} ({passengers} passengers)</div>
                                <div className="flex items-center gap-2 text-xs"><Mail className="w-3 h-3 text-muted-foreground" /> {email}</div>
                                <div className="flex items-center gap-2 text-xs"><Phone className="w-3 h-3 text-muted-foreground" /> {fullPhone}</div>
                                <div className="flex items-center gap-2 text-xs"><CalendarIcon className="w-3 h-3 text-muted-foreground" /> {formattedPickupDate}, {pickupTime}</div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="space-y-1">
                                <h4 className="font-semibold text-base mb-2 text-center">Fare Details</h4>
                                <DetailRow label="Base Rate" value={`₹${baseRate.toFixed(2)}/km`} />
                                <DetailRow 
                                    label="Base KM" 
                                    value={`${distance.toFixed(1)} km`} 
                                    subValue={isMinBillingApplied ? `(Min 130km Applied)` : ``}
                                />
                                <Separator />
                                <DetailRow label="Calculated Base Fare" value={`₹${totalBaseFare.toFixed(2)}`} subValue={`${billingDistance.toFixed(1)}km x ₹${baseRate.toFixed(2)}`} />
                                <DetailRow label="Driver allowance" value={`₹${driverFee.toFixed(2)}`} />
                                <DetailRow label="State Permit" value={hasInterStateTravel ? `₹${permitFee.toFixed(2)}` : 'Not Required'} />
                                <DetailRow 
                                    label={
                                        <div className="flex items-center gap-1">
                                            Toll Charges <span className="text-muted-foreground/80">(Approx)</span>
                                        </div>
                                    } 
                                    value={finalTollCharge > 0 ? `₹${finalTollCharge.toFixed(2)}` : 'Not Required'} 
                                />
                                {taxItems.map(tax => (
                                    <DetailRow 
                                        key={tax.id} 
                                        label={tax.name}
                                        value={`₹${tax.amount.toFixed(2)}`}
                                        subValue={`${String(tax.value).replace('%', '')}%`}
                                    />
                                ))}
                                {appliedCoupon && (
                                    <DetailRow
                                    label={
                                        <div className="flex items-center gap-1 text-green-600">
                                        {appliedCoupon.title}
                                        </div>
                                    }
                                    value={`- ₹${discountAmount.toFixed(2)}`}
                                    valueClass="text-green-600"
                                    />
                                )}
                            </div>
                            <Separator />
                            <div className="text-center space-y-1 pt-2 relative">
                                <p className="font-bold text-base">Total Estimated Cost</p>
                                <div className="flex items-center justify-center gap-2">
                                    {appliedCoupon && (
                                        <p className="font-bold text-lg text-destructive line-through">₹{calculatedTotalAmount.toFixed(2)}</p>
                                    )}
                                    <p className="font-bold text-2xl text-primary">₹{finalFare.toFixed(2)}</p>
                                </div>
                                {discountAmount > 0 && (
                                    <>
                                        <div className="absolute inset-0 -top-12 pointer-events-none">
                                            <LottieAnimation animationUrl="https://raw.githubusercontent.com/thethanjaiculture-dev/GetIn-Assests/refs/heads/main/fireworks%20and%20poppers.json" loop={false} />
                                        </div>
                                        <div className="text-center text-sm font-semibold text-green-600 pt-1">
                                            Hooray! You Saved ₹{discountAmount.toFixed(2)}
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="bg-green-50 text-green-700 p-2 rounded-md text-xs flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                                <span>Driver allowance, Vehicle Charge and 1 hour free waiting Charge Included</span>
                            </div>
                            <div className="bg-yellow-50 text-yellow-700 p-2 rounded-md text-xs">
                                <p>Extra Costs for Private parking, roof carrier, Ride with Pets</p>
                            </div>
                            <div className="text-center text-xs font-semibold text-muted-foreground pt-1">
                            <p>No Hidden Charges are Collected</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <div className="mt-4 flex flex-col items-center gap-4">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button size="lg" className="h-10 text-sm px-6">
                            Confirm Ride
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Terms and Conditions</AlertDialogTitle>
                                <AlertDialogDescription>
                                    <strong className="text-destructive">Note:</strong> The actual bill amount might differ based on actual KMs travelled, Waiting time (for Oneway only), Hill-station charges, Inter-state Permits, Toll Charges etc.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="flex items-center space-x-2 my-4">
                                <Checkbox id="terms" onCheckedChange={(checked) => setIsTermsAccepted(checked as boolean)} />
                                <Label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    I agree to the terms and conditions
                                </Label>
                            </div>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={isConfirming}>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleConfirmRide} disabled={isConfirming || !isTermsAccepted}>
                                    {isConfirming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Confirm
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </div>
    );
}

