
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CreditCard, Shield, Globe, MapPinned, Car } from "lucide-react";

const features = [
  {
    icon: ({ color, className }: { color: string, className?: string }) => <Clock className={className} style={{ color }} />,
    color: "#007AFF", // System Blue
    title: "24/7 Service",
    description: "Always on time, anytime you need us. Our 24/7 service ensures you're never stranded.",
  },
  {
    icon: ({ color, className }: { color: string, className?: string }) => <CreditCard className={className} style={{ color }} />,
    color: "#34C759", // System Green
    title: "Multiple Payment Choices",
    description: "UPI, Cash, Card, online etc.",
  },
  {
    icon: ({ color, className }: { color: string, className?: string }) => <Shield className={className} style={{ color }} />,
    color: "#FF3B30", // System Red
    title: "Trusted Drivers",
    description: "Your safety is our priority. All drivers are verified and trained for a secure ride.",
  },
  {
    icon: ({ color, className }: { color: string, className?: string }) => <Globe className={className} style={{ color }} />,
    color: "#FF9500", // System Orange
    title: "Ease for International customers",
    description: "Whatsapp / Telegram support",
  },
  {
    icon: ({ color, className }: { color: string, className?: string }) => <MapPinned className={className} style={{ color }} />,
    color: "#AF52DE", // System Purple
    title: "Multiple pickup and drop points",
    description: "Flexible pickup and drop options",
  },
    {
    icon: ({ color, className }: { color: string, className?: string }) => <Car className={className} style={{ color }} />,
    color: "#5AC8FA", // System Teal
    title: "Clean & Hygienic Cars",
    description: "We provide well-maintained and clean cars for your journey.",
  }
];

const FeatureCard = ({ feature }: { feature: (typeof features)[0] }) => (
    <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
        <CardHeader>
            {feature.icon({ color: feature.color, className: "w-10 h-10 mx-auto" })}
        </CardHeader>
        <CardContent className="space-y-2 flex-grow py-4 px-3">
            <CardTitle className="text-lg md:text-xl">{feature.title}</CardTitle>
            <p className="text-muted-foreground">{feature.description}</p>
        </CardContent>
    </Card>
);


export default function Features() {
  const firstRowFeatures = features.slice(0, 4);
  const secondRowFeatures = features.slice(4);

  return (
    <section className="py-12">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold">Features Of Zyro Cabs</h2>
        <p className="text-muted-foreground">Our Commitment to Your Journey</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        {firstRowFeatures.map((feature, index) => (
          <FeatureCard key={index} feature={feature} />
        ))}
      </div>
      {secondRowFeatures.length > 0 && (
        <div className={`mt-8 grid ${secondRowFeatures.length === 1 ? 'lg:grid-cols-1 justify-center' : 'grid-cols-2'} gap-8 lg:w-1/2 lg:mx-auto`}>
          {secondRowFeatures.map((feature, index) => (
             <div key={index} className={secondRowFeatures.length === 1 ? 'lg:w-1/2' : ''}>
                <FeatureCard feature={feature} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

