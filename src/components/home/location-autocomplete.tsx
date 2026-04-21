"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useEffect, useRef, useState, useCallback } from "react";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { Loader2, MapPin, History } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";

interface LocationAutocompleteProps {
  placeholder: string;
  onLocationSelect: (address: string, lat?: number, lng?: number) => void;
  defaultValue?: string;
}

const RECENT_SEARCHES_KEY = "zyro_recent_searches";

export default function LocationAutocomplete({
  placeholder,
  onLocationSelect,
  defaultValue = "",
}: LocationAutocompleteProps) {
  const [inputValue, setInputValue] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    setInputValue(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    // Load recent searches from localStorage
    const searches = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (searches) {
      setRecentSearches(JSON.parse(searches));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setInputValue(query);
    setShowSuggestions(true);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);
  };
  
  const addRecentSearch = (address: string) => {
    const updatedSearches = [
      address,
      ...recentSearches.filter(s => s !== address),
    ].slice(0, 5);
    setRecentSearches(updatedSearches);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updatedSearches));
  };

  const handleSelect = (address: string, lat?: number, lng?: number) => {
    setInputValue(address);
    setShowSuggestions(false);
    addRecentSearch(address);
    onLocationSelect(address, lat, lng);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
              placeholder={placeholder}
              value={inputValue}
              onChange={handleInput}
              onFocus={() => setShowSuggestions(true)}
              className="pl-10"
          />
          {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />}
      </div>
      {showSuggestions && (
        <div className="absolute top-full mt-2 w-full z-20">
          <Command className="rounded-lg border shadow-md bg-popover">
            <ScrollArea className="max-h-80">
              <CommandList>
                {inputValue === "" && recentSearches.length > 0 && (
                  <CommandGroup heading="Recent Searches">
                    {recentSearches.map((search) => (
                      <CommandItem
                        key={search}
                        onSelect={() => handleSelect(search)}
                        className="cursor-pointer"
                      >
                        <History className="mr-2 h-4 w-4 shrink-0" />
                        <span>{search}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {inputValue !== "" && suggestions.length > 0 && (
                  <CommandGroup heading="Suggestions">
                    {suggestions.map((suggestion, index) => {
                      const props = suggestion.properties;
                      const name = props.name;
                      const secondary = [props.city, props.state, props.country].filter(Boolean).join(', ');
                      const fullAddress = [name, secondary].filter(Boolean).join(', ');
                      
                      return (
                        <CommandItem
                          key={`${suggestion.properties.osm_id}-${index}`}
                          onSelect={() => handleSelect(fullAddress, suggestion.geometry.coordinates[1], suggestion.geometry.coordinates[0])}
                          className="cursor-pointer"
                        >
                          <MapPin className="mr-2 h-4 w-4 shrink-0 text-primary" />
                          <div>
                            <span className="font-medium">{name}</span>
                            <span className="text-muted-foreground ml-2 text-xs truncate">{secondary}</span>
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                )}
                {inputValue !== "" && !loading && suggestions.length === 0 && <CommandEmpty>No results found.</CommandEmpty>}
              </CommandList>
            </ScrollArea>
          </Command>
        </div>
      )}
    </div>
  );
}
