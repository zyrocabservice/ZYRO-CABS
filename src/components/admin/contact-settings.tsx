
'use client';

import type { ContactDetails } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import CountryCodeSelector from "../ui/country-code-selector";
import { useState, useEffect } from "react";
import { countries } from "@/lib/countries";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

interface ContactSettingsProps {
    details: ContactDetails;
    onDataChange: (details: ContactDetails) => void;
}

export default function ContactSettings({ details, onDataChange }: ContactSettingsProps) {
    const [countryCode, setCountryCode] = useState('+91');
    const [phoneNumber, setPhoneNumber] = useState('');

    useEffect(() => {
        const country = countries
            .filter(c => details.phone.startsWith(c.dial_code))
            .sort((a, b) => b.dial_code.length - a.dial_code.length)[0];

        if (country) {
            setCountryCode(country.dial_code);
            setPhoneNumber(details.phone.substring(country.dial_code.length));
        } else {
            setCountryCode('+91');
            setPhoneNumber(details.phone);
        }
    }, [details.phone]);
    
    const handlePhoneValueChange = (newCountryCode: string, newPhoneNumber: string) => {
        setCountryCode(newCountryCode);
        setPhoneNumber(newPhoneNumber);
        onDataChange({ ...details, phone: `${newCountryCode}${newPhoneNumber}` });
    }

    const handleChange = (field: keyof ContactDetails, value: string) => {
        onDataChange({ ...details, [field]: value });
    };

    const handleTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
        const textarea = e.currentTarget;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Contact Channels</CardTitle>
                    <CardDescription>
                        Set the main contact points for your business.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <div className="flex gap-2">
                                <CountryCodeSelector
                                    value={countryCode}
                                    onValueChange={(newCode) => handlePhoneValueChange(newCode, phoneNumber)}
                                />
                                <Input 
                                    id="phone" 
                                    value={phoneNumber}
                                    onChange={(e) => handlePhoneValueChange(countryCode, e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input 
                                id="email" 
                                type="email"
                                value={details.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="whatsapp">WhatsApp Number (no country code)</Label>
                            <Input 
                                id="whatsapp" 
                                value={details.whatsapp}
                                onChange={(e) => handleChange('whatsapp', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="instagram">Instagram Handle (username only)</Label>
                            <Input 
                                id="instagram" 
                                value={details.instagram}
                                onChange={(e) => handleChange('instagram', e.target.value)}
                            />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="facebook">Facebook Handle (username or ID)</Label>
                            <Input 
                                id="facebook" 
                                value={details.facebook || ''}
                                onChange={(e) => handleChange('facebook', e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>WhatsApp Templates</CardTitle>
                    <CardDescription>
                        Customize the default messages sent via WhatsApp. Use placeholders like {'{carType}'} for dynamic content.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="enquiryWhatsappMessage">Quick Enquiry (from Car Card)</Label>
                        <Textarea 
                            id="enquiryWhatsappMessage"
                            value={details.enquiryWhatsappMessage}
                            onChange={(e) => handleChange('enquiryWhatsappMessage', e.target.value)}
                            onInput={handleTextareaInput}
                            rows={4}
                            className="font-mono overflow-hidden"
                             placeholder="Hi, I'd like to enquire about a {carType}..."
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Email Templates</CardTitle>
                    <CardDescription>
                       Customize the default subject and body for emails. Use the same placeholders as WhatsApp templates.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="emailSubject">Default Email Subject</Label>
                        <Input 
                            id="emailSubject"
                            value={details.emailSubject}
                            onChange={(e) => handleChange('emailSubject', e.target.value)}
                            placeholder="Enquiry for {carType}"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="emailBody">Quick Enquiry Body (from Car Card)</Label>
                        <Textarea 
                            id="emailBody"
                            value={details.emailBody}
                            onChange={(e) => handleChange('emailBody', e.target.value)}
                            onInput={handleTextareaInput}
                            rows={6}
                            className="font-mono overflow-hidden"
                            placeholder="Hello, I would like to enquire about a {carType}..."
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
