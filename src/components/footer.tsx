
'use client';

import Link from 'next/link';
import { Mail, Phone, MessageSquare, Instagram, Facebook } from 'lucide-react';
import type { ContactDetails } from '@/lib/types';

interface FooterProps {
  contactDetails: ContactDetails | null;
}

export default function Footer({ contactDetails }: FooterProps) {
  if (!contactDetails) {
    return (
        <footer className="bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 py-4 animate-pulse">
            <div className="h-6 bg-primary/50 rounded w-1/3 mx-auto md:mx-0"></div>
          </div>
        </footer>
    );
  }

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="px-4 md:px-6 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex justify-center md:justify-start items-center gap-4 text-sm opacity-80 order-2 md:order-1 md:w-1/3">
             <Link href="/about" className="hover:underline">About Us</Link>
             <Link href="/contact" className="hover:underline">Contact Us</Link>
             <Link href="/terms" className="hover:underline">Terms</Link>
             <Link href="/privacy" className="hover:underline">Privacy</Link>
          </div>
          <div className="text-center text-xs opacity-80 order-3 md:order-2 md:w-1/3">
             <p>&copy; {new Date().getFullYear()} ZyroCabs. All rights reserved.</p>
          </div>
          <div className="flex items-center justify-center md:justify-end gap-4 order-1 md:order-3 md:w-1/3">
              {contactDetails.facebook && (
                <a href={`https://www.facebook.com/${contactDetails.facebook}`} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                    <Facebook className="w-5 h-5 hover:opacity-80 transition-opacity" />
                </a>
              )}
              <a href={`https://www.instagram.com/${contactDetails.instagram}`} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <Instagram className="w-5 h-5 hover:opacity-80 transition-opacity" />
              </a>
              <a href={`mailto:${contactDetails.email}`} aria-label="Email">
                  <Mail className="w-5 h-5 hover:opacity-80 transition-opacity" />
              </a>
              <a href={`https://wa.me/${contactDetails.whatsapp}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                  <MessageSquare className="w-5 h-5 hover:opacity-80 transition-opacity" />
              </a>
              <a href={`tel:${contactDetails.phone}`} aria-label="Phone">
                  <Phone className="w-5 h-5 hover:opacity-80 transition-opacity" />
              </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
