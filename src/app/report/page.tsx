

'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Image from "next/image";
import LottieAnimation from "@/components/home/lottie-animation";
import { saveReportToSupabase } from "@/lib/actions";
import CountryCodeSelector from "@/components/ui/country-code-selector";
import { countries } from "@/lib/countries";
import { useToast } from "@/hooks/use-toast";

type ReportCategory = "driver" | "payment" | "service" | "missing" | "";

interface FormErrors {
    vehicleNumber?: string;
    driverMobile?: string;
    mobile?: string;
}

export default function ReportPage() {
    const [category, setCategory] = useState<ReportCategory>("");
    const [tripDate, setTripDate] = useState<Date>();
    const [paymentDate, setPaymentDate] = useState<Date>();
    const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mobileNumber, setMobileNumber] = useState("");
    const [countryCode, setCountryCode] = useState("+91");
    const [errors, setErrors] = useState<FormErrors>({});
    const { toast } = useToast();

    const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const numericValue = value.replace(/[^0-9]/g, '');

        const selectedCountry = countries.find(c => c.dial_code === countryCode);
        let maxLength = 15;

        if (selectedCountry && selectedCountry.length) {
            if (Array.isArray(selectedCountry.length)) {
                maxLength = Math.max(...selectedCountry.length);
            } else {
                maxLength = selectedCountry.length;
            }
        }

        if (numericValue.length <= maxLength) {
            setMobileNumber(numericValue);
        }
    };

    const isMobileNumberValid = () => {
        if (!mobileNumber) return false;
        const selectedCountry = countries.find(c => c.dial_code === countryCode);
        if (selectedCountry && selectedCountry.length) {
            const phoneLength = mobileNumber.length;
            if (Array.isArray(selectedCountry.length)) {
                return selectedCountry.length.includes(phoneLength);
            } else {
                return phoneLength === selectedCountry.length;
            }
        }
        return mobileNumber.length > 0;
    }

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        const formData = new FormData(document.querySelector('form')!);
        const category = formData.get('category');

        if (category === 'driver' || category === 'missing') {
            const vehicleNumber = formData.get('vehicleNumber') as string;
            if (vehicleNumber) {
                const vehicleRegex = /^[A-Z]{2}[ -]?[0-9]{1,2}[ -]?[A-Z]{1,2}[ -]?[0-9]{1,4}$/i;
                if (!vehicleRegex.test(vehicleNumber)) {
                    newErrors.vehicleNumber = "Invalid vehicle number format.";
                }
            }
            
            const driverMobile = formData.get('driverMobile') as string;
            if (driverMobile) {
                const mobileRegex = /^[0-9]{10}$/;
                if (!mobileRegex.test(driverMobile)) {
                    newErrors.driverMobile = "Driver mobile must be 10 digits.";
                }
            }
        }

        if (!isMobileNumberValid()) {
            const selectedCountry = countries.find(c => c.dial_code === countryCode);
            if (selectedCountry && selectedCountry.length) {
                if (Array.isArray(selectedCountry.length)) {
                    newErrors.mobile = `Must be ${selectedCountry.length.join(' or ')} digits.`;
                } else {
                    newErrors.mobile = `Must be ${selectedCountry.length} digits.`;
                }
            } else {
                 newErrors.mobile = 'Mobile number is not valid.';
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast({
                title: "Validation Failed",
                description: "Please correct the errors before submitting.",
                variant: "destructive",
            });
            return;
        }
        
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());
        data.mobile = `${countryCode}${mobileNumber}`;
        
        const result = await saveReportToSupabase(data as any);
        setIsSubmitting(false);

        if (result.success) {
            setShowSuccessAnimation(true);
            setTimeout(() => {
                setShowSuccessAnimation(false);
                // Reset form fields
                (e.target as HTMLFormElement).reset();
                setCategory("");
                setTripDate(undefined);
                setPaymentDate(undefined);
                setMobileNumber("");
                setCountryCode("+91");
                setErrors({});
            }, 3000);
        } else {
            toast({
                title: "Submission Failed",
                description: "Failed to submit report: " + result.error,
                variant: "destructive",
            });
        }
    }
    
    const renderCategoryFields = () => {
        switch (category) {
            case 'driver':
            case 'missing':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="vehicleNumber">Vehicle Number</Label>
                            <Input 
                                id="vehicleNumber" 
                                name="vehicleNumber" 
                                placeholder="e.g., TN-01-AB-1234"
                                onChange={() => setErrors(prev => ({...prev, vehicleNumber: undefined}))}
                             />
                             {errors.vehicleNumber && <p className="text-sm text-destructive">{errors.vehicleNumber}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="driverMobile">Driver Mobile No</Label>
                            <Input 
                                id="driverMobile" 
                                name="driverMobile" 
                                type="tel" 
                                placeholder="Driver's contact number" 
                                onChange={() => setErrors(prev => ({...prev, driverMobile: undefined}))}
                            />
                            {errors.driverMobile && <p className="text-sm text-destructive">{errors.driverMobile}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tripDate">Trip Date</Label>
                             <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !tripDate && "text-muted-foreground"
                                    )}
                                    >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {tripDate ? format(tripDate, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                    mode="single"
                                    selected={tripDate}
                                    onSelect={setTripDate}
                                    initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <Input type="hidden" name="tripDate" value={tripDate ? format(tripDate, 'yyyy-MM-dd') : ''} />
                        </div>
                    </div>
                );
            case 'payment':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="paymentNumber">Payment Number</Label>
                            <Input id="paymentNumber" name="paymentNumber" placeholder="Your payment phone number" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="transactionId">UPI Transaction ID</Label>
                            <Input id="transactionId" name="transactionId" placeholder="UPI transaction reference" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="paymentDate">Payment Date</Label>
                             <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !paymentDate && "text-muted-foreground"
                                    )}
                                    >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {paymentDate ? format(paymentDate, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                    mode="single"
                                    selected={paymentDate}
                                    onSelect={setPaymentDate}
                                    initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                             <Input type="hidden" name="paymentDate" value={paymentDate ? format(paymentDate, 'yyyy-MM-dd') : ''} />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    }


    return (
        <div className="container mx-auto px-4 py-12">
            <div className="w-full max-w-2xl mx-auto">
                {showSuccessAnimation && (
                    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 text-center">
                        <h2 className="text-2xl font-bold text-primary">Report Submitted Successfully</h2>
                        <div className="w-48 h-48">
                           <LottieAnimation animationUrl="https://raw.githubusercontent.com/thethanjaiculture-dev/GetIn-Assests/main/Alert%20Icon%20Exclamation.json" loop={false} />
                        </div>
                        <p className="text-lg mt-4">Thanks for Reporting</p>
                    </div>
                )}
                 <div className="relative w-full aspect-video mb-6">
                    <Image 
                        src="https://raw.githubusercontent.com/thethanjaiculture-dev/GetIn-Assests/main/unnamed.png" 
                        alt="Report an issue"
                        fill
                        className="object-contain rounded-lg"
                        sizes="(max-width: 768px) 100vw, 672px"
                    />
                </div>
                 <Card className="w-full shadow-lg">
                    <CardHeader>
                        <CardTitle>Submit a Report</CardTitle>
                        <CardDescription>Have an issue with a ride or a driver? Let us know.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" name="name" placeholder="Your Name" required onChange={(e) => { e.target.value = e.target.value.replace(/[0-9]/g, ''); }} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" name="email" type="email" placeholder="your.email@example.com" required />
                                </div>
                            </div>

                             <div className="space-y-2">
                                <Label htmlFor="mobile">Mobile Number</Label>
                                <div className="flex gap-2">
                                    <CountryCodeSelector
                                        value={countryCode}
                                        onValueChange={setCountryCode}
                                    />
                                    <Input 
                                        id="mobile" 
                                        name="mobile" 
                                        type="tel" 
                                        placeholder="Your mobile number" 
                                        required 
                                        value={mobileNumber}
                                        onChange={(e) => { handleMobileChange(e); setErrors(p => ({...p, mobile: undefined})) }}
                                    />
                                </div>
                                {errors.mobile && <p className="text-sm text-destructive">{errors.mobile}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Issue Category</Label>
                                <Select name="category" onValueChange={(value) => { setCategory(value as ReportCategory); setErrors({}); }} value={category} required>
                                    <SelectTrigger id="category">
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="driver">Driver Related</SelectItem>
                                        <SelectItem value="payment">Payment Related</SelectItem>
                                        <SelectItem value="service">Service Related Issue</SelectItem>
                                        <SelectItem value="missing">Things Missing</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            {renderCategoryFields()}

                            <div className="space-y-2">
                                <Label htmlFor="report">Describe the Issue</Label>
                                <Textarea id="report" name="report" placeholder="Please provide as much detail as possible..." required className="min-h-[150px]" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bookingId">Booking ID (Optional)</Label>
                                <Input id="bookingId" name="bookingId" placeholder="e.g., ZC12345" />
                            </div>
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Submit Report
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

    