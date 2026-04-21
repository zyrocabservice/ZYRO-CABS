
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Script from 'next/script';
import CookieConsent from '@/components/cookie-consent';
import AnalyticsConsentManager from '@/components/analytics-consent-manager';
import { ThemeProvider } from '@/components/theme-provider';
import HeaderWrapper from '@/components/header-wrapper';
import Footer from '@/components/footer';
import { getContactDetails } from '@/lib/actions';
import MaintenanceBanner from '@/components/maintenance-banner';


const ogDescription = "Your reliable ride, anytime, anywhere. We provide safe, comfortable, and affordable cab services across the city, ensuring a seamless travel experience for every passenger. Whether it’s a quick ride, airport transfer, or a full-day journey, Zyro Cabs guarantees punctuality, professional drivers, and a hassle-free booking process. Ride smart, ride with ZyroCabs.";
const ogImageUrl = "https://raw.githubusercontent.com/thethanjaiculture-dev/GetIn-Assests/main/ZyrocabBB.png";

export const metadata: Metadata = {
  metadataBase: new URL('https://zyrocabs.com'),
  alternates: {
    canonical: '/',
  },
  title: 'Zyro Cabs',
  description: ogDescription,
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      '/favicon.ico',
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Zyro Cabs',
    description: ogDescription,
    url: 'https://zyrocabs.com',
    siteName: 'Zyro Cabs',
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: 'Zyro Cabs Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zyro Cabs',
    description: ogDescription,
    images: [ogImageUrl],
  },
  other: {
    'fb:app_id': 'YOUR_FB_APP_ID',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const contactDetails = await getContactDetails();

  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
       <head>
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossOrigin="" />
      </head>
      <body className={`font-sans antialiased h-full flex flex-col bg-background`}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <HeaderWrapper />
            <main className="flex-grow">{children}</main>
            <Footer contactDetails={contactDetails} />
            <Toaster />
            <CookieConsent />
            <AnalyticsConsentManager />
            <MaintenanceBanner />
        </ThemeProvider>
      </body>
    </html>
  );
}
