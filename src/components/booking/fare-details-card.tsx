

'use client';

import * as React from 'react';
import type { Car, InclusionsExclusions, TaxesAndCharges, TaxItem, Offer } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { XCircle, CheckCircle } from 'lucide-react';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LottieAnimation from '../home/lottie-animation';

type CarOption = Car & { estimatedFare: number, driverFee: number, permitFee: number };

interface FareDetailsCardProps {
  selectedCar: CarOption;
  distance: number;
  taxesAndCharges: TaxesAndCharges;
  inclusionsExclusions: InclusionsExclusions;
  rideType: string;
  tollPlazaCount: number;
  originState: string | null;
  destinationState: string | null;
  statesCrossed: string[];
  appliedCoupon: Offer | null;
  discountAmount: number;
}

const DetailRow = ({ label, value, valueClass, subValue, subValueClass }: { label: string | React.ReactNode; value: string | React.ReactNode; valueClass?: string; subValue?: string, subValueClass?: string }) => (
    <div className="flex justify-between items-center text-sm py-1">
        <div className="text-muted-foreground">{label}</div>
        <div className="text-right">
            <p className={`font-medium ${valueClass}`}>{value}</p>
            {subValue && <p className={`text-xs text-muted-foreground ${subValueClass}`}>{subValue}</p>}
        </div>
    </div>
);


export default function FareDetailsCard({ selectedCar, distance, taxesAndCharges, inclusionsExclusions, rideType, tollPlazaCount, originState, destinationState, statesCrossed, appliedCoupon, discountAmount }: FareDetailsCardProps) {
    const { baseRate, baseFare, driverFee, tollChargeAmount, permitFee, taxItems, totalFare, billingDistance, finalBillingDistance, isMinBillingApplied, hasInterStateTravel } = React.useMemo(() => {
        const actualDistance = distance;
        const billingDistance = Math.max(actualDistance, 130);
        const isMinBillingApplied = actualDistance < 130;

        const getRateForTripType = (car: Car) => {
            switch (rideType) {
                case 'round-trip': return car.roundTripRate;
                case 'airport-transfer': return car.airportTransferRate;
                case 'one-way':
                default: return car.oneWayRate;
            }
        };

        const baseRate = getRateForTripType(selectedCar);
        const baseFare = baseRate * billingDistance;

        const driverFee = selectedCar.driverFee || 0;
        const permitFee = selectedCar.permitFee || 0;
        
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

        const perTollCharge = typeof taxesAndCharges.tollCharges === 'string' ? parseFloat(taxesAndCharges.tollCharges) : taxesAndCharges.tollCharges;
        const tollChargeAmount = isNaN(perTollCharge) ? 0 : perTollCharge * tollPlazaCount;
        
        const taxItems = taxesAndCharges.taxes
            .filter(tax => tax.enabled)
            .map(tax => {
                const amount = calculateTax(tax.value, baseFare);
                return { ...tax, amount, value: String(tax.value) };
            });

        const totalTaxAmount = taxItems.reduce((sum, tax) => sum + tax.amount, 0);

        const totalFare = baseFare + driverFee + tollChargeAmount + permitFee + totalTaxAmount;
        
        return {
            baseRate,
            baseFare,
            driverFee,
            tollChargeAmount,
            permitFee,
            taxItems,
            totalFare,
            billingDistance: actualDistance,
            finalBillingDistance: billingDistance,
            isMinBillingApplied,
            hasInterStateTravel: permitFee > 0,
        };

    }, [selectedCar, distance, taxesAndCharges, rideType, tollPlazaCount, originState, destinationState, statesCrossed]);
    
    const finalTotal = totalFare - discountAmount;

    return (
        <Card className="mt-4">
            <CardContent className="p-4">
                 <Tabs defaultValue="fare-details" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="fare-details">Fare Details</TabsTrigger>
                        <TabsTrigger value="inclusions">Inclusions</TabsTrigger>
                        <TabsTrigger value="exclusions">Exclusions</TabsTrigger>
                    </TabsList>
                    <TabsContent value="fare-details" className="pt-4">
                         <div className="space-y-2">
                            <DetailRow label="Base Rate" value={`₹${baseRate.toFixed(2)}/km`} />
                            <DetailRow 
                                label="Base KM" 
                                value={`${billingDistance.toFixed(1)} km`} 
                                subValue={isMinBillingApplied ? `(Min 130km Applied)` : undefined}
                                subValueClass={isMinBillingApplied ? 'text-destructive' : ''}
                            />
                            <Separator />
                            <DetailRow 
                                label="Calculated Base Fare" 
                                value={`₹${baseFare.toFixed(2)}`} 
                                subValue={`${finalBillingDistance.toFixed(1)}km x ₹${baseRate.toFixed(2)}`} 
                                subValueClass="text-system-green" 
                            />
                            <DetailRow label="Driver Allowance" value={`₹${driverFee.toFixed(2)}`} />
                            <DetailRow 
                                label={
                                    <div className="flex items-center gap-1">
                                        Toll Charges <span className="text-muted-foreground/80">(Approx)</span>
                                    </div>
                                } 
                                value={tollChargeAmount > 0 ? `₹${tollChargeAmount.toFixed(2)}` : 'Not Required'} 
                            />
                            <DetailRow label="State Permit" value={permitFee > 0 ? `₹${permitFee.toFixed(2)}` : 'Not Required'} />
                            {taxItems.map(tax => (
                                <DetailRow 
                                    key={tax.id} 
                                    label={tax.name}
                                    value={`₹${tax.amount.toFixed(2)}`}
                                    subValue={`${String(tax.value)}`}
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
                            <Separator />
                             <div className="flex justify-between items-center text-sm py-1 relative">
                                <div className="font-bold text-base">Total Estimated Cost</div>
                                <div className="text-right flex items-center gap-2">
                                    {appliedCoupon && (
                                        <p className="font-medium text-destructive line-through">₹{totalFare.toFixed(2)}</p>
                                    )}
                                    <p className="font-bold text-xl text-system-green">₹{finalTotal.toFixed(2)}</p>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="absolute inset-0 -top-12 pointer-events-none">
                                        <LottieAnimation animationUrl="https://raw.githubusercontent.com/thethanjaiculture-dev/GetIn-Assests/refs/heads/main/fireworks%20and%20poppers.json" loop={false} />
                                    </div>
                                )}
                            </div>
                            {discountAmount > 0 && (
                                <div className="text-center text-sm font-semibold text-green-600 pt-1">
                                    Hooray! You Saved ₹{discountAmount.toFixed(2)}
                                </div>
                            )}
                         </div>
                    </TabsContent>
                    <TabsContent value="inclusions" className="pt-4">
                        <ul className="space-y-2">
                           {inclusionsExclusions.inclusions.map((item, index) => (
                                <li key={index} className="flex items-center gap-2 text-sm">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>{item}</span>
                                </li>
                           ))}
                        </ul>
                    </TabsContent>
                    <TabsContent value="exclusions" className="pt-4">
                       <ul className="space-y-2">
                           {inclusionsExclusions.exclusions.map((item, index) => (
                                <li key={index} className="flex items-center gap-2 text-sm">
                                    <XCircle className="w-4 h-4 text-destructive" />
                                    <span>{item}</span>
                                </li>
                           ))}
                        </ul>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
