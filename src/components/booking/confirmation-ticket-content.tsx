
'use client';

import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { Users, MapPin, CheckCircle } from 'lucide-react';
import { Separator } from '../ui/separator';

const DetailRow = ({ label, value, valueClass, subValue }: { label: string; value: string | React.ReactNode; valueClass?: string; subValue?: string }) => (
    <div className="flex justify-between items-center text-sm py-1">
        <p className="text-muted-foreground">{label}</p>
        <div className="text-right">
            <p className={`font-medium ${valueClass}`}>{value}</p>
            {subValue && <p className="text-xs text-muted-foreground">{subValue}</p>}
        </div>
    </div>
);

export default function ConfirmationPageContent({ params }: { params: URLSearchParams }) {
    const from = params.get('from') || 'N/A';
    const to = params.get('to') || 'N/A';
    const carType = params.get('carType') || 'N/A';
    const carImageUrl = params.get('carImageUrl') || 'https://placehold.co/400x250/EFEFEF/AAAAAA&text=Car';
    const capacity = params.get('capacity') || 'N/A';
    const distance = parseFloat(params.get('distance') || '0');
    const baseRate = parseFloat(params.get('baseRate') || '0');
    const totalBaseFare = parseFloat(params.get('totalBaseFare') || '0');
    const driverFee = parseFloat(params.get('driverFee') || '0');
    const totalAmount = parseFloat(params.get('totalAmount') || '0');
    const tollCharges = parseFloat(params.get('tollCharges') || '0');
    const tax = parseFloat(params.get('tax') || '0');
    const subTotal = parseFloat(params.get('subTotal') || '0');


    return (
        <Card className="shadow-none border-none animate-pop-in overflow-hidden">
            <CardContent className="p-0 space-y-4">
                <div className="grid grid-cols-[1fr_auto] gap-4 items-start">
                    <div>
                        <h3 className="font-bold text-lg">{carType}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1"><Users className="w-4 h-4"/> {capacity} people + 1 driver</span>
                            <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {distance.toFixed(1)} km</span>
                        </div>
                    </div>
                    <div className="relative w-24 h-16 rounded-md overflow-hidden">
                        <Image src={carImageUrl} alt={carType} fill className="object-contain"/>
                    </div>
                </div>

                <div className="relative pl-4">
                    <div className="absolute left-[5px] top-1.5 bottom-1.5 w-0.5 bg-muted-foreground/50 border-muted-foreground/50 border-dashed"></div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-3 h-3 rounded-full bg-primary ring-4 ring-background z-10"></div>
                        <div>
                            <p className="text-xs text-muted-foreground">Pickup</p>
                            <p className="font-semibold">{from}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                         <div className="w-3 h-3 rounded-full bg-primary ring-4 ring-background z-10"></div>
                        <div>
                            <p className="text-xs text-muted-foreground">Drop</p>
                            <p className="font-semibold">{to}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>100% of drivers are police verified, licensed and audited</span>
                </div>

                <div className="space-y-1">
                    <DetailRow label="Base km" value={`${distance.toFixed(1)} km`} />
                    <DetailRow label="Base Fare Per Km" value={`₹${baseRate.toFixed(2)}`} />
                    <DetailRow label="Total Base Fare" value={`₹${totalBaseFare.toFixed(2)}`} subValue={`(${distance.toFixed(1)}km X ₹${baseRate})`} />
                    <DetailRow label="Driver allowance" value={`₹${driverFee.toFixed(2)}`} />
                    <DetailRow label="Toll Charges" value={tollCharges > 0 ? `₹${tollCharges.toFixed(2)}` : 'Not Applicable'} />
                    <DetailRow label="Permit" value="Not Applicable" />
                    <DetailRow label="Tax" value={tax > 0 ? `₹${tax.toFixed(2)}` : 'Not Applicable'} />
                    <DetailRow label="Total" value={`₹${subTotal.toFixed(2)}`} />
                </div>
                
                <Separator />

                <div className="text-center space-y-1">
                    <p className="font-bold text-lg">Total Amount</p>
                    <p className="text-xs text-muted-foreground">Inclusive of GST</p>
                    <p className="font-bold text-3xl text-primary">₹{totalAmount.toFixed(2)}</p>
                </div>

                <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm space-y-1">
                    <p className="flex items-center gap-2"><CheckCircle className="w-4 h-4 flex-shrink-0" /> Toll, Permit, vehicle all charges included</p>
                    <p className="flex items-center gap-2"><CheckCircle className="w-4 h-4 flex-shrink-0" /> Total price can increase or decrease based on the distance travelled</p>
                </div>

                 <div className="bg-yellow-50 text-yellow-700 p-3 rounded-md text-sm">
                    <p>Private parking, roof carrier, pet charges extra</p>
                </div>
                
            </CardContent>
        </Card>
    );
}


