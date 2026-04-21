'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, History, X, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const RECENT_SEARCHES_KEY = "zyro_recent_searches_v2";

interface LocationSearchContentProps {}

export default function LocationSearchContent({}: LocationSearchContentProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const field = searchParams.get('field') || 'from';
    const fromValue = searchParams.get('currentFrom') || '';
    const toValue = searchParams.get('currentTo') || '';

    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    const fetchSuggestions = useCallback(async (query: string) => {
        if (!query || query.length < 3) {
            setSuggestions([]);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5&lang=en`);
            const data = await response.json();
            setSuggestions(data.features || []);
        } catch (error) {
            console.error("Error fetching suggestions from Photon:", error);
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleInput = (val: string) => {
        setInputValue(val);

        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            fetchSuggestions(val);
        }, 300);
    };

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
        setSuggestions([]);
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
                        onChange={(e) => handleInput(e.target.value)}
                        className="pr-10"
                    />
                    {loading && (
                        <div className="absolute right-10 top-1/2 -translate-y-1/2">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                    )}
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
                     {suggestions.length > 0 && (
                        <ul className="space-y-2">
                           {suggestions.map((suggestion, index) => {
                                const props = suggestion.properties;
                                const name = props.name;
                                const secondary = [props.city, props.state, props.country].filter(Boolean).join(', ');
                                const fullAddress = [name, secondary].filter(Boolean).join(', ');
                                
                                return (
                                    <li key={`${props.osm_id}-${index}`}>
                                        <button
                                            onClick={() => handleSelect(fullAddress)}
                                            className="w-full text-left flex items-start gap-4 p-3 rounded-md hover:bg-muted"
                                        >
                                            <MapPin className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                                            <div>
                                                <p className="font-medium text-sm">{name}</p>
                                                <p className="text-xs text-muted-foreground">{secondary}</p>
                                            </div>
                                        </button>
                                    </li>
                                );
                           })}
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
                     {inputValue.length > 0 && !loading && suggestions.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground">
                            No locations found for &quot;{inputValue}&quot;
                        </div>
                     )}
                </div>
            </ScrollArea>
        </div>
    );
}
