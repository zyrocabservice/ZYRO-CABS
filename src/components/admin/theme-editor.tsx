

'use client';

import { useState, useEffect, useTransition } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { saveThemeColors } from '@/lib/actions';
import { Loader2 } from 'lucide-react';

function hslStringToHslObject(hslString: string) {
    if (!hslString) return { h: 0, s: 0, l: 0 };
    const [h, s, l] = hslString.split(' ').map(val => parseFloat(val.replace('%', '')));
    return { h, s, l };
}

function hslObjectToHslString(hslObject: { h: number, s: number, l: number }) {
    return `${hslObject.h} ${hslObject.s}% ${hslObject.l}%`;
}


export default function ThemeEditor() {
    const [primaryColor, setPrimaryColor] = useState('211 100% 50%');
    const [backgroundColor, setBackgroundColor] = useState('0 0% 98%');
    const [accentColor, setAccentColor] = useState('240 5.2% 95.9%');
    const [isSaving, startSaving] = useTransition();

    useEffect(() => {
        // This function runs on the client and gets the computed styles
        const computedStyle = getComputedStyle(document.documentElement);
        const primary = computedStyle.getPropertyValue('--primary').trim();
        const background = computedStyle.getPropertyValue('--background').trim();
        const accent = computedStyle.getPropertyValue('--accent').trim();

        if (primary) setPrimaryColor(primary);
        if (background) setBackgroundColor(background);
        if (accent) setAccentColor(accent);
    }, []);

    const handleSave = () => {
        startSaving(async () => {
            const result = await saveThemeColors({
                primary: primaryColor,
                background: backgroundColor,
                accent: accentColor,
            });

            if (result.success) {
                // Optionally, show a success message and reload to see changes
                alert('Theme saved successfully! The page will now reload.');
                window.location.reload();
            } else {
                alert(`Error saving theme: ${result.error}`);
            }
        });
    };

    const ColorInput = ({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) => {
        const { h, s, l } = hslStringToHslObject(value);
        const hexColor = `hsl(${h}, ${s}%, ${l}%)`;
        
        return (
            <div className="space-y-2">
                <Label>{label}</Label>
                <div className="flex items-center gap-2">
                    <Input
                        type="color"
                        value={hexColor}
                        onChange={(e) => {
                            // This is a simplification. Real HSL to RGB/Hex is more complex.
                            // Browser's color picker will give hex, which we can't directly convert back to HSL easily client-side.
                            // For this demo, we'll just update the live preview, but saving hex won't work with the current CSS var structure.
                            // A full implementation would require a color conversion library.
                            console.warn("Direct color picking is for preview only. Please edit HSL values for saving.");
                            document.documentElement.style.setProperty(`--${label.toLowerCase()}`, e.target.value);
                        }}
                        className="w-12 h-10 p-1"
                        style={{ border: `2px solid ${hexColor}` }}
                    />
                    <Input 
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="H S% L%"
                        className="font-mono"
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <p className="text-muted-foreground">
                Edit the HSL values for the main theme colors. Changes will be applied live to this page for preview.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <ColorInput label="Primary" value={primaryColor} onChange={setPrimaryColor} />
               <ColorInput label="Background" value={backgroundColor} onChange={setBackgroundColor} />
               <ColorInput label="Accent" value={accentColor} onChange={setAccentColor} />
            </div>
            <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Theme
            </Button>
        </div>
    );
}

