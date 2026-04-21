'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, History, Mic, X } from 'lucide-react';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDebounce } from '@/hooks/use-debounce';

const RECENT_SEARCHES_KEY = "zyro_recent_searches_v2";

interface LocationSearchContentProps {}

export default function LocationSearchContent({}: LocationSearchContentProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const field = searchParams.get('field') || 'from';
    const fromValue = searchParams.get('currentFrom') || '';
    const toValue = searchParams.get('currentTo') || '';

    const [inputValue, setInputValue] = useState('');
    const debouncedInputValue = useDebounce(inputValue, 300);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    
    const {
        ready,
        suggestions: { status, data },
        setValue,
        clearSuggestions,
    } = usePlacesAutocomplete({
        requestOptions: {
            componentRestrictions: { country: "in" },
        },
        debounce: 0, // Debouncing is handled manually
    });

    useEffect(() => {
        if (debouncedInputValue) {
            setValue(debouncedInputValue);
        } else {
            clearSuggestions();
        }
    }, [debouncedInputValue, setValue, clearSuggestions]);

    useEffect(() => {
        const searches = localStorage.getItem(RECENT_SEARCHES_KEY);
        if (searches) {
            setRecentSearches(JSON.parse(searches));
        }
    }, []);

    const addRecentSearch = (address: string) => {
        const updatedSearches = [
            address,
            ...recentSearches.filter(s => s.toLowerCase() !== address.toLowerCase()),
        ].slice(0, 5); // Keep only the 5 most recent
        setRecentSearches(updatedSearches);
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updatedSearches));
    };

    const handleSelect = (description: string) => {
        addRecentSearch(description);

        const newParams = new URLSearchParams();
        if (field === 'from') {
            newParams.set('from', description);
            if (toValue) newParams.set('to', toValue);
        } else {
            newParams.set('to', description);
            if (fromValue) newParams.set('from', fromValue);
        }
        // Navigate back to the homepage with the selected location
        router.replace(`/?${newParams.toString()}`);
    };

    const handleBack = () => {
        // Go back to the homepage, preserving existing values
        const newParams = new URLSearchParams();
        if (fromValue) newParams.set('from', fromValue);
        if (toValue) newParams.set('to', toValue);
        router.replace(`/?${newParams.toString()}`);
    };
    
    const handleClearInput = () => {
        setInputValue('');
        clearSuggestions();
    }


    return (
        <div className="h-screen w-screen bg-background flex flex-col">
            <header className="flex items-center gap-2 p-4 border-b">
                <Button variant="ghost" size="icon" onClick={handleBack}>
                    <ArrowLeft />
                </Button>
                <div className="relative w-full">
                    <Input
                        autoFocus
                        placeholder={field === 'from' ? "Enter pickup location" : "Enter destination"}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="pr-10"
                        disabled={!ready}
                    />
                    {inputValue && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                            onClick={handleClearInput}
                        >
                            <X className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    )}
                </div>
            </header>
            <ScrollArea className="flex-1">
                <div className="p-4">
                     {status === 'OK' && data.length > 0 && (
                        <ul className="space-y-2">
                           {data.map(suggestion => (
                                <li key={suggestion.place_id}>
                                    <button
                                        onClick={() => handleSelect(suggestion.description)}
                                        className="w-full text-left flex items-start gap-4 p-3 rounded-md hover:bg-muted"
                                    >
                                        <MapPin className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-sm">{suggestion.structured_formatting.main_text}</p>
                                            <p className="text-xs text-muted-foreground">{suggestion.structured_formatting.secondary_text}</p>
                                        </div>
                                    </button>
                                </li>
                           ))}
                        </ul>
                     )}
                     {inputValue.length === 0 && recentSearches.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="text-sm font-semibold text-muted-foreground px-3">Recent Searches</h3>
                             <ul className="space-y-1">
                               {recentSearches.map((search, index) => (
                                    <li key={index}>
                                        <button
                                            onClick={() => handleSelect(search)}
                                            className="w-full text-left flex items-center gap-4 p-3 rounded-md hover:bg-muted"
                                        >
                                            <History className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                            <p className="text-sm">{search}</p>
                                        </button>
                                    </li>
                               ))}
                            </ul>
                        </div>
                     )}
                </div>
            </ScrollArea>
        </div>
    );
}
