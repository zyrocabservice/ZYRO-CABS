"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Skeleton } from '../ui/skeleton';

// Fix for default marker icons in Leaflet with React
const TollIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/thethanjaiculture-dev/GetIn-Assests/main/Toll-Photoroom.png-Photoroom.png',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
});

interface TollMapProps {
  locations: { lat: number, lng: number, name: string }[];
  apiKey?: string;
}

function MapUpdater({ bounds }: { bounds?: L.LatLngBoundsExpression }) {
    const map = useMap();
    useEffect(() => {
        if (bounds) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [bounds, map]);
    return null;
}

export default function TollMap({ locations }: TollMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Skeleton className="w-full h-full" />;
  }

  const defaultCenter: [number, number] = [10.7905, 78.7047];
  
  let bounds: L.LatLngBoundsExpression | undefined = undefined;
  if (locations.length > 0) {
    bounds = locations.map(loc => [loc.lat, loc.lng] as [number, number]);
  }

  return (
    <div className="w-full h-full relative border rounded-lg overflow-hidden">
        <MapContainer 
          center={defaultCenter} 
          zoom={7} 
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {bounds && <MapUpdater bounds={bounds} />}
          
          {locations.map((loc, idx) => (
            <Marker 
                key={`${loc.lat}-${loc.lng}-${idx}`} 
                position={[loc.lat, loc.lng]} 
                icon={TollIcon}
            >
              <Popup>{loc.name}</Popup>
            </Marker>
          ))}
        </MapContainer>
    </div>
  );
}
