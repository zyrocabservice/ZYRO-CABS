
import type { Car } from '@/lib/types';

// This is the single source of truth for the initial car data.
// It's used to seed the database if the 'cars' collection is empty.
export const carData: Car[] = [
  { id: 'sedan', carType: 'Sedan Cars', description: 'sedan cars include Maruti Suzuki Dzire, Hyundai Aura, Honda Amaze, Tata Tigor, Volkswagen Virtus, Škoda Slavia, Hyundai Verna, Honda City, and Toyota Camry.', imageUrl: 'https://raw.githubusercontent.com/thethanjaiculture-dev/GetIn-Assests/main/SwiftDzireTrailPic.png', imageHint: "sedan car", capacity: 4, oneWayRate: 14, roundTripRate: 14, airportTransferRate: 17, driverAllowance: 300 },
  { id: 'suv', carType: 'SUV Cars', description: 'Our SUV lineup features the Hyundai Creta, Kia Seltos, Tata Nexon, Mahindra XUV700, and Toyota Fortuner.', imageUrl: 'https://raw.githubusercontent.com/thethanjaiculture-dev/GetIn-Assests/main/XUV700TrailPic.png', imageHint: "suv car", capacity: 6, oneWayRate: 20, roundTripRate: 18, airportTransferRate: 22, driverAllowance: 400 },
  { id: 'innova', carType: 'Innova Crysta', description: 'A spacious and comfortable choice for family trips, featuring the Toyota Innova Crysta.', imageUrl: 'https://raw.githubusercontent.com/thethanjaiculture-dev/GetIn-Assests/main/InnovaCrystaPic.png', imageHint: "innova car", capacity: 7, oneWayRate: 22, roundTripRate: 20, airportTransferRate: 25, driverAllowance: 500 },
];
