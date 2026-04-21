
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Car, ContactDetails, ButtonSettings } from '@/lib/types';
import { saveTripPlanToSupabase } from '@/lib/actions';
import { Loader2 } from 'lucide-react';
import CountryCodeSelector from '@/components/ui/country-code-selector';
import { Skeleton } from './ui/skeleton';
import { countries } from '@/lib/countries';
import { useToast } from '@/hooks/use-toast';
import PlacesAutocompleteWrapper from './home/places-autocomplete-wrapper';
import { Input } from './ui/input';

interface FormErrors {
    name?: string;
    phone?: string;
    email?: string;
    carType?: string;
    passengers?: string;
    from?: string;
    to?: string;
}

interface BookingFlowProps {
    cars: Car[];
    contactDetails: ContactDetails;
    buttonSettings: ButtonSettings;
}

export default function BookingFlow({ cars, contactDetails, buttonSettings }: BookingFlowProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [email, setEmail] = useState('');
  const [carId, setCarId] = useState('');
  const [passengers, setPassengers] = useState('');
  const [numberOfDays, setNumberOfDays] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isMobile, setIsMobile] = useState(false);

  const selectedCar = cars.find(c => c.id === carId);
  const carCapacity = selectedCar ? selectedCar.capacity : 0;

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  useEffect(() => {
    // Reset passengers if the selected car's capacity is less than the current value
    if (selectedCar && passengers && parseInt(passengers, 10) > selectedCar.capacity) {
        setPassengers('');
    }
  }, [carId, passengers, selectedCar]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value.replace(/[^0-9]/g, '');

    const selectedCountry = countries.find(c => c.dial_code === countryCode);
    let maxLength = 15; // Default max length

    if (selectedCountry && selectedCountry.length) {
      if (Array.isArray(selectedCountry.length)) {
        maxLength = Math.max(...selectedCountry.length);
      } else {
        maxLength = selectedCountry.length;
      }
    }

    if (numericValue.length <= maxLength) {
      setPhone(numericValue);
    }
  };

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

  const validateForm = (): boolean => {
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
    if (!carId) errors.carType = 'Please select a car type.';
    if (!passengers) errors.passengers = 'Please enter number of passengers.';
    if (!from) errors.from = 'Please enter a pickup location.';
    if (!to) errors.to = 'Please enter a drop-off location.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactDetails || !buttonSettings || !validateForm()) {
        toast({
            title: "Missing Information",
            description: "Please fill out all fields to submit your trip plan.",
            variant: "destructive",
        });
        return;
    }
    setIsSubmitting(true);
    
    if (!selectedCar) {
        toast({
            title: "Invalid Car",
            description: "Please select a valid car type.",
            variant: "destructive"
        });
        setIsSubmitting(false);
        return;
    }

    const fullPhoneNumber = `${countryCode}${phone}`;

    await saveTripPlanToSupabase({
      name,
      phone: fullPhoneNumber,
      email,
      carType: selectedCar.carType,
      passengers,
      from,
      to,
      numberOfDays,
    });
    
    let redirectUrl: string;

    const fillTemplate = (template: string) => {
        return template
            .replace('{from}', encodeURIComponent(from))
            .replace('{to}', encodeURIComponent(to))
            .replace('{carType}', encodeURIComponent(selectedCar.carType))
            .replace('{passengers}', encodeURIComponent(passengers))
            .replace('{name}', encodeURIComponent(name))
            .replace('{phone}', encodeURIComponent(fullPhoneNumber))
            .replace('{email}', encodeURIComponent(email))
            .replace('{numberOfDays}', encodeURIComponent(numberOfDays));
    }


    switch(buttonSettings.bookNowAction) {
        case 'whatsapp':
            if (isMobile) {
              const message = fillTemplate(contactDetails.enquiryWhatsappMessage);
              redirectUrl = `https://wa.me/${contactDetails.whatsapp}?text=${message}`;
              window.open(redirectUrl, '_blank');
              toast({
                  title: "Trip Plan Submitted",
                  description: "We've received your request and will redirect you to continue the conversation.",
              });
            } else {
              toast({
                  title: "Trip Plan Submitted",
                  description: "We have received your request and will get back to you shortly.",
              });
            }
            break;
        case 'instagram':
            redirectUrl = `https://www.instagram.com/${contactDetails.instagram}`;
            window.open(redirectUrl, '_blank');
            toast({
                title: "Trip Plan Submitted",
                description: "We've received your request and will redirect you to continue the conversation.",
            });
            break;
        case 'email':
        default:
             const mailSubject = encodeURIComponent(
                contactDetails.emailSubject
                    .replace('{carType}', selectedCar.carType)
                    .replace('{tripType}', 'Trip Plan')
            );
            const mailBody = fillTemplate(contactDetails.emailBody);
            redirectUrl = `mailto:${contactDetails.email}?subject=${mailSubject}&body=${mailBody}`;
            window.open(redirectUrl, '_blank');
            toast({
                title: "Trip Plan Submitted",
                description: "We've received your request and will redirect you to continue the conversation.",
            });
            break;
    }
    
    setIsSubmitting(false);
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Plan Your Trip</CardTitle>
        <CardDescription>Fill in the details below to book your ride.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="Your full name" required value={name} onChange={e => { setName(e.target.value.replace(/[0-9]/g, '')); setFormErrors(p => ({...p, name: undefined})) }} />
               {formErrors.name && <p className="text-sm text-destructive">{formErrors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
                <div className="flex gap-2">
                    <CountryCodeSelector
                        value={countryCode}
                        onValueChange={setCountryCode}
                    />
                    <Input id="phone" name="phone" placeholder="Your phone number" type="tel" required value={phone} onChange={e => { handlePhoneChange(e); setFormErrors(p => ({...p, phone: undefined})) }} className="rounded-md" />
                </div>
                 {formErrors.phone && <p className="text-sm text-destructive">{formErrors.phone}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" placeholder="your@email.com" type="email" required value={email} onChange={e => { setEmail(e.target.value); setFormErrors(p => ({...p, email: undefined})) }} />
            {formErrors.email && <p className="text-sm text-destructive">{formErrors.email}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="carType">Type of Car</Label>
              <Select name="carType" onValueChange={v => {setCarId(v); setFormErrors(p => ({...p, carType: undefined}))}} value={carId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a car type" />
                </SelectTrigger>
                <SelectContent>
                  {cars.map(car => (
                    <SelectItem key={car.id} value={car.id}>{car.carType}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
               {formErrors.carType && <p className="text-sm text-destructive">{formErrors.carType}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="passengers">Number of Passengers</Label>
              <Select name="passengers" onValueChange={v => {setPassengers(v); setFormErrors(p => ({...p, passengers: undefined}))}} value={passengers} required disabled={!selectedCar}>
                  <SelectTrigger>
                      <SelectValue placeholder={!selectedCar ? "Select car first" : "Select..."} />
                  </SelectTrigger>
                  <SelectContent>
                      {carCapacity > 0 && Array.from({ length: carCapacity }, (_, i) => i + 1).map(num => (
                          <SelectItem key={num} value={num.toString()}>{num} {num === 1 ? 'Passenger' : 'Passengers'}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
               {formErrors.passengers && <p className="text-sm text-destructive">{formErrors.passengers}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="numberOfDays">Number of Days</Label>
              <Input id="numberOfDays" name="numberOfDays" type="number" min="1" placeholder="e.g., 3" value={numberOfDays} onChange={e => setNumberOfDays(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
             <div className="space-y-2">
                <Label htmlFor="from">From</Label>
                <PlacesAutocompleteWrapper placeholder="Leaving from" onLocationSelect={(addr) => { setFrom(addr); setFormErrors(p => ({...p, from: undefined})) }} />
                 {formErrors.from && <p className="text-sm text-destructive">{formErrors.from}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="to">To</Label>
                <PlacesAutocompleteWrapper placeholder="Going to" onLocationSelect={(addr) => { setTo(addr); setFormErrors(p => ({...p, to: undefined})) }} />
                 {formErrors.to && <p className="text-sm text-destructive">{formErrors.to}</p>}
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting} variant="primary">
             {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Submitting...' : 'Submit Ride Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
