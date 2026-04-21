"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Skeleton } from '../ui/skeleton';
import type { TollPlaza } from '@/lib/types';

// Fix for default marker icons in Leaflet with React
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const OriginIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const DestinationIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const TollIcon = L.icon({
    url: 'https://raw.githubusercontent.com/thethanjaiculture-dev/GetIn-Assests/main/Toll-Photoroom.png-Photoroom.png',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
} as any);

interface DirectionsMapProps {
  origin: string;
  destination: string;
  tollPlazas?: TollPlaza[];
}

function MapUpdater({ bounds }: { bounds: L.LatLngBoundsExpression }) {
    const map = useMap();
    useEffect(() => {
        if (bounds) map.fitBounds(bounds, { padding: [50, 50] });
    }, [bounds, map]);
    return null;
}

export default function DirectionsMap({ origin, destination, tollPlazas = [] }: DirectionsMapProps) {
  const [route, setRoute] = useState<[number, number][]>([]);
  const [coords, setCoords] = useState<{ origin?: [number, number], destination?: [number, number] }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Geocode origin and destination using Photon
        const geocode = async (addr: string): Promise<[number, number] | null> => {
            if (/^-?[\d.]+(,\s*-?[\d.]+)+$/.test(addr)) {
                const [lat, lng] = addr.split(',').map(Number);
                return [lat, lng];
            }
            const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(addr)}&limit=1`);
            const data = await res.json();
            if (data.features?.length > 0) {
                const [lng, lat] = data.features[0].geometry.coordinates;
                return [lat, lng];
            }
            return null;
        };

        const [oCoords, dCoords] = await Promise.all([geocode(origin), geocode(destination)]);
        if (!oCoords || !dCoords) return;

        setCoords({ origin: oCoords, destination: dCoords });

        // 2. Fetch route from OSRM
        const routeRes = await fetch(`http://router.project-osrm.org/route/v1/driving/${oCoords[1]},${oCoords[0]};${dCoords[1]},${dCoords[0]}?overview=full&geometries=geojson`);
        const routeData = await routeRes.json();
        if (routeData.code === 'Ok' && routeData.routes.length > 0) {
            const flippedCoords = routeData.routes[0].geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng] as [number, number]);
            setRoute(flippedCoords);
        }
      } catch (err) {
        console.error("Leaflet Map Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [origin, destination]);

  if (loading || !coords.origin || !coords.destination) {
    return <Skeleton className="w-full h-full" />;
  }

  const bounds = L.latLngBounds([coords.origin, coords.destination]);

  return (
    <MapContainer 
      bounds={bounds}
      className="w-full h-full"
      style={{ background: '#f0f0f0' }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapUpdater bounds={bounds} />
      
      <Marker position={coords.origin} icon={OriginIcon}>
        <Popup>Pickup: {origin}</Popup>
      </Marker>
      
      <Marker position={coords.destination} icon={DestinationIcon} >
        <Popup>Dropoff: {destination}</Popup>
      </Marker>

      {route.length > 0 && (
        <Polyline positions={route} color="var(--primary)" weight={5} opacity={0.7} />
      )}

      {tollPlazas.map((plaza, idx) => (
        <Marker 
          key={idx} 
          position={[plaza.Latitude, plaza.Longitude]} 
          icon={DefaultIcon}
        >
          <Popup>
            <strong>{plaza['Plaza Name']}</strong><br />
            {plaza['Sate']}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
