"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Fix for default marker icons in Leaflet with React
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

function MapUpdater({ bounds }: { bounds: L.LatLngBoundsExpression }) {
    const map = useMap();
    useEffect(() => {
        if (bounds) map.fitBounds(bounds, { padding: [50, 50] });
    }, [bounds, map]);
    return null;
}

export default function MapPage() {
  const [route, setRoute] = useState<[number, number][]>([]);
  const [coords, setCoords] = useState<{ origin?: [number, number], destination?: [number, number] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const origin = 'Chennai, India';
        const destination = 'Bangalore, India';

        // 1. Geocode origin and destination using Photon
        const geocode = async (addr: string): Promise<[number, number] | null> => {
            const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(addr)}&limit=1`);
            const data = await res.json();
            if (data.features?.length > 0) {
                const [lng, lat] = data.features[0].geometry.coordinates;
                return [lat, lng];
            }
            return null;
        };

        const [oCoords, dCoords] = await Promise.all([geocode(origin), geocode(destination)]);
        if (!oCoords || !dCoords) {
            setError("Could not find locations.");
            return;
        }

        setCoords({ origin: oCoords, destination: dCoords });

        // 2. Fetch route from OSRM
        const routeRes = await fetch(`http://router.project-osrm.org/route/v1/driving/${oCoords[1]},${oCoords[0]};${dCoords[1]},${dCoords[0]}?overview=full&geometries=geojson`);
        const routeData = await routeRes.json();
        
        if (routeData.code === 'Ok' && routeData.routes.length > 0) {
            const flippedCoords = routeData.routes[0].geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng] as [number, number]);
            setRoute(flippedCoords);
        } else {
            setError("Could not calculate route.");
        }
      } catch (err) {
        console.error("Leaflet Map Error:", err);
        setError("Failed to load map data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const bounds = coords.origin && coords.destination ? L.latLngBounds([coords.origin, coords.destination]) : undefined;

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Directions Map</h1>
        <Card className="overflow-hidden border shadow-lg rounded-xl">
          <div className="aspect-[2/1] w-full relative bg-muted">
            {loading && (
              <div className="absolute inset-0 z-10">
                  <Skeleton className="w-full h-full" />
              </div>
            )}
            
            {error && (
              <div className="absolute inset-0 bg-destructive/10 flex items-center justify-center text-center p-4 z-20">
                  <p className="text-destructive font-semibold">{error}</p>
              </div>
            )}
            
            {!loading && coords.origin && coords.destination && (
              <MapContainer 
                bounds={bounds}
                className="w-full h-full"
                style={{ background: '#f0f0f0' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {bounds && <MapUpdater bounds={bounds} />}
                
                <Marker position={coords.origin} icon={DefaultIcon}>
                  <Popup>Origin: Chennai</Popup>
                </Marker>
                
                <Marker position={coords.destination} icon={DefaultIcon}>
                  <Popup>Destination: Bangalore</Popup>
                </Marker>

                {route.length > 0 && (
                  <Polyline positions={route} color="var(--primary)" weight={5} opacity={0.7} />
                )}
              </MapContainer>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
