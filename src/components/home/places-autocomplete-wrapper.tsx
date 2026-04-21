"use client";

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const LocationAutocomplete = dynamic(() => import('./location-autocomplete'), {
    ssr: false,
    loading: () => <Skeleton className="h-10 w-full" />
});

interface PlacesAutocompleteWrapperProps {
  placeholder: string;
  onLocationSelect: (address: string, lat?: number, lng?: number) => void;
  defaultValue?: string;
}

export default function PlacesAutocompleteWrapper(props: PlacesAutocompleteWrapperProps) {
    return <LocationAutocomplete {...props} />;
}
