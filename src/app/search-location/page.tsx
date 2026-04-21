'use client';

import { Suspense } from 'react';
import LocationSearchContent from '@/components/location-search/location-search-content';
import { Skeleton } from '@/components/ui/skeleton';

export default function SearchLocationPage() {
    return (
        <Suspense fallback={<Skeleton className="h-screen w-screen" />}>
            <LocationSearchContent />
        </Suspense>
    );
}
