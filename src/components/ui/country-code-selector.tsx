
"use client"

import * as React from "react"
import { countries, getCountryFlag, type Country } from "@/lib/countries"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "./input"

interface CountryCodeSelectorProps {
    value: string;
    onValueChange: (value: string) => void;
}

// Helper to create a unique value for each country item
const createUniqueValue = (country: Country) => `${country.dial_code}|${country.code}`;
// Helper to extract the dial code from the unique value
const getDialCodeFromValue = (value: string) => value.split('|')[0];
// Helper to find a country from a dial_code, preferring the primary country for that code
const findCountryFromDialCode = (dialCode: string) => {
    return countries.find(c => c.dial_code === dialCode);
}


export default function CountryCodeSelector({ value, onValueChange }: CountryCodeSelectorProps) {
    const [searchTerm, setSearchTerm] = React.useState("");

    const filteredCountries = React.useMemo(() => {
        if (!searchTerm) return countries;
        return countries.filter(country => 
            country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            country.dial_code.includes(searchTerm)
        );
    }, [searchTerm]);

    // Find the country object that corresponds to the current `value` (dial_code)
    const selectedCountry = React.useMemo(() => findCountryFromDialCode(value), [value]);
    
    // The internal value for the Select component needs to be unique
    const internalSelectValue = selectedCountry ? createUniqueValue(selectedCountry) : "";

    const handleValueChange = (uniqueValue: string) => {
        // When a new item is selected, we extract just the dial code to pass to the parent
        const dialCode = getDialCodeFromValue(uniqueValue);
        onValueChange(dialCode);
    };

    return (
        <Select value={internalSelectValue} onValueChange={handleValueChange}>
            <SelectTrigger className="w-28">
                <SelectValue placeholder="Select Code">
                    <div className="flex items-center gap-2">
                        {selectedCountry ? (
                            <>
                                <span>{getCountryFlag(selectedCountry.code)}</span>
                                <span>{selectedCountry.dial_code}</span>
                            </>
                        ) : "Code"}
                    </div>
                </SelectValue>
            </SelectTrigger>
            <SelectContent>
                 <div className="p-2">
                    <Input
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full"
                        // Prevent the popover from closing when typing in the search
                        onClick={(e) => e.stopPropagation()} 
                    />
                </div>
                <div className="max-h-60 overflow-y-auto">
                    {filteredCountries.map(country => (
                        <SelectItem key={createUniqueValue(country)} value={createUniqueValue(country)}>
                            <div className="flex items-center gap-2">
                                <span>{getCountryFlag(country.code)}</span>
                                <span>{country.name}</span>
                                <span className="text-muted-foreground">{country.dial_code}</span>
                            </div>
                        </SelectItem>
                    ))}
                </div>
            </SelectContent>
        </Select>
    )
}

    