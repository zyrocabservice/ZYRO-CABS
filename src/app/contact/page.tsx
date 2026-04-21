
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MessageSquare, Instagram, Loader2 } from 'lucide-react';
import { getContactDetails } from '@/lib/actions';
import { useEffect, useState } from 'react';
import type { ContactDetails } from '@/lib/types';
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function ContactPage() {
    const [contactDetails, setContactDetails] = useState<ContactDetails | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Simulate an API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        setIsSubmitting(false);
        toast({
            title: "Message Sent!",
            description: "We'll get back to you as soon as possible.",
        });
        (e.target as HTMLFormElement).reset();
    }

    useEffect(() => {
        async function fetchData() {
            setContactDetails(await getContactDetails());
        }
        fetchData();
    }, []);

    if (!contactDetails) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="grid md:grid-cols-2 gap-12 items-start">
                    <div>
                        <Skeleton className="h-8 w-1/2 mb-4" />
                        <Skeleton className="h-16 w-full mb-8" />
                        <div className="space-y-6">
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                        </div>
                    </div>
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        )
    }

  return (
    <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
                <h1 className="text-3xl font-bold mb-4">Get in Touch</h1>
                <p className="text-muted-foreground mb-8">
                    Have a question or want to book a custom trip? Fill out the form or use one of the contact methods below. We're here to help you 24/7.
                </p>
                <div className="space-y-6">
                    <a href={`mailto:${contactDetails.email}`} className="flex items-center gap-4 group">
                        <div className="bg-secondary p-3 rounded-full group-hover:bg-primary transition-colors">
                            <Mail className="w-6 h-6 text-primary group-hover:text-primary-foreground" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Email Us</h3>
                            <p className="text-muted-foreground group-hover:text-primary transition-colors">{contactDetails.email}</p>
                        </div>
                    </a>
                    <a href={`tel:${contactDetails.phone}`} className="flex items-center gap-4 group">
                         <div className="bg-secondary p-3 rounded-full group-hover:bg-primary transition-colors">
                            <Phone className="w-6 h-6 text-primary group-hover:text-primary-foreground" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Call Us</h3>
                            <p className="text-muted-foreground group-hover:text-primary transition-colors">{contactDetails.phone}</p>
                        </div>
                    </a>
                     <a href={`https://wa.me/${contactDetails.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                         <div className="bg-secondary p-3 rounded-full group-hover:bg-primary transition-colors">
                            <MessageSquare className="w-6 h-6 text-primary group-hover:text-primary-foreground" />
                        </div>
                        <div>
                            <h3 className="font-semibold">WhatsApp</h3>
                            <p className="text-muted-foreground group-hover:text-primary transition-colors">{contactDetails.whatsapp}</p>
                        </div>
                    </a>
                     <a href={`https://www.instagram.com/${contactDetails.instagram}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                         <div className="bg-secondary p-3 rounded-full group-hover:bg-primary transition-colors">
                            <Instagram className="w-6 h-6 text-primary group-hover:text-primary-foreground" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Follow Us</h3>
                            <p className="text-muted-foreground group-hover:text-primary transition-colors">@{contactDetails.instagram}</p>
                        </div>
                    </a>
                </div>
            </div>
             <Card className="w-full shadow-lg">
                <CardHeader>
                    <CardTitle>Send a Message</CardTitle>
                    <CardDescription>Fill out the form below and we'll get back to you as soon as possible.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" placeholder="Your Name" required onChange={(e) => { e.target.value = e.target.value.replace(/[0-9]/g, ''); }} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="your.email@example.com" required />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input id="subject" placeholder="e.g., Question about booking" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea id="message" placeholder="Your message..." required className="min-h-[120px]" />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
