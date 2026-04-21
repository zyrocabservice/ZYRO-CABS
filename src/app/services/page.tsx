
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, CornerUpLeft, Plane } from 'lucide-react';
import Link from 'next/link';

const services = [
  {
    icon: <ArrowRight className="w-8 h-8 text-primary" />,
    title: "One-Way Trips",
    description: "Perfect for traveling from one city to another without the hassle of returning. Book a one-way cab and enjoy a comfortable and direct journey to your destination.",
    href: "/book"
  },
  {
    icon: <CornerUpLeft className="w-8 h-8 text-green-500" />,
    title: "Round Trips",
    description: "Ideal for outstation trips where you need a cab for one or more days. Our round trip service lets you keep the car with you, giving you the freedom to explore at your own pace.",
    href: "/book"
  },
  {
    icon: <Plane className="w-8 h-8 text-blue-500" />,
    title: "Airport Transfers",
    description: "Reliable and punctual airport pickup and drop services. We track your flight schedules to ensure timely service, making your airport travel seamless and stress-free.",
    href: "/book"
  },
];

export default function ServicesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Our Services</h1>
            <p className="mt-4 text-lg text-muted-foreground">Reliable and convenient cab options for every need.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
                <Link href={service.href} key={index}>
                    <Card className="text-center hover:shadow-lg transition-shadow h-full">
                        <CardHeader>
                            <div className="mx-auto bg-secondary p-4 rounded-full w-fit">
                                {service.icon}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <CardTitle className="text-xl mb-2">{service.title}</CardTitle>
                            <p className="text-muted-foreground">{service.description}</p>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    </div>
  );
}
