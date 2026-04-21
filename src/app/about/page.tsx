
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, Shield, Heart, Globe } from 'lucide-react';
import Image from 'next/image';

const values = [
    {
        icon: <Shield className="w-8 h-8 text-primary" />,
        title: "Safety First",
        description: "Your safety is our top priority. All our drivers are police-verified, licensed, and undergo regular audits to ensure a secure and trustworthy ride, every time."
    },
    {
        icon: <Heart className="w-8 h-8 text-destructive" />,
        title: "Customer Commitment",
        description: "We are dedicated to providing a seamless and satisfying experience, from easy booking to comfortable journeys. Your feedback drives our improvement."
    },
    {
        icon: <Globe className="w-8 h-8 text-green-500" />,
        title: "Reliability",
        description: "Count on us for punctuality and dependable service. We provide 24/7 support to ensure you reach your destination without any hassles."
    }
];

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">About Zyro Cabs</h1>
            <p className="mt-4 text-lg text-muted-foreground">Your reliable ride, anytime, anywhere.</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
            <div>
                <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
                <p className="text-muted-foreground leading-relaxed">
                    To provide safe, comfortable, and affordable cab services that connect cities and people. We aim to be the most trusted name in inter-city travel, ensuring a seamless experience for every passenger. Whether it’s a quick airport transfer or a multi-day journey, Zyro Cabs guarantees punctuality, professional drivers, and a hassle-free booking process.
                </p>
            </div>
            <div>
                <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
                <p className="text-muted-foreground leading-relaxed">
                    To revolutionize inter-city travel by making it accessible, reliable, and convenient for everyone. We envision a future where distance is no longer a barrier, and every journey with Zyro Cabs is a delightful experience, powered by technology and a commitment to excellence.
                </p>
            </div>
        </div>

        <div>
            <h2 className="text-3xl font-bold text-center mb-8">Our Core Values</h2>
            <div className="grid md:grid-cols-3 gap-8">
                {values.map((value, index) => (
                    <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="mx-auto bg-secondary p-4 rounded-full w-fit">
                                {value.icon}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <CardTitle className="text-xl mb-2">{value.title}</CardTitle>
                            <p className="text-muted-foreground">{value.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    </div>
  );
}
