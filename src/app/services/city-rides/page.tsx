
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

export default function CityRidesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">Explore Your City with Zyro</h1>
                <p className="text-lg text-muted-foreground mb-6">
                    Need a ride within the city? Zyro Cabs offers reliable, comfortable, and affordable city ride packages. Whether you're heading to a business meeting, running errands, or exploring local attractions, we've got you covered.
                </p>
                <ul className="space-y-4 text-muted-foreground mb-8">
                    <li className="flex items-start">
                        <span className="text-primary mr-2">✔</span>
                        <span>Flexible hourly packages to suit your needs.</span>
                    </li>
                    <li className="flex items-start">
                        <span className="text-primary mr-2">✔</span>
                        <span>Clean, well-maintained vehicles with professional drivers.</span>
                    </li>
                    <li className="flex items-start">
                        <span className="text-primary mr-2">✔</span>
                        <span>Perfect for sightseeing, shopping sprees, or multiple stops.</span>
                    </li>
                </ul>
                <Button asChild size="lg">
                    <Link href="/book">Book a City Ride Now</Link>
                </Button>
            </div>
            <div className="relative h-80 rounded-lg overflow-hidden">
                 <Image 
                    src="https://picsum.photos/seed/cityride/800/600" 
                    alt="City Ride"
                    fill
                    className="object-cover"
                    data-ai-hint="city taxi"
                />
            </div>
        </div>
    </div>
  );
}
