
'use client';

import type { InclusionsExclusions } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Separator } from "../ui/separator";

interface InclusionsExclusionsSettingsProps {
    data: InclusionsExclusions;
    onDataChange: (data: InclusionsExclusions) => void;
}

export default function InclusionsExclusionsSettings({ data, onDataChange }: InclusionsExclusionsSettingsProps) {

    const handleItemChange = (type: 'inclusions' | 'exclusions', index: number, value: string) => {
        const updatedItems = [...data[type]];
        updatedItems[index] = value;
        onDataChange({ ...data, [type]: updatedItems });
    };

    const handleAddItem = (type: 'inclusions' | 'exclusions') => {
        onDataChange({ ...data, [type]: [...data[type], ''] });
    };

    const handleRemoveItem = (type: 'inclusions' | 'exclusions', index: number) => {
        const updatedItems = data[type].filter((_, i) => i !== index);
        onDataChange({ ...data, [type]: updatedItems });
    };

    return (
        <div className="space-y-8">
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Inclusions</h3>
                    <Button size="sm" variant="outline" onClick={() => handleAddItem('inclusions')}>
                        <Plus className="mr-2 h-4 w-4" /> Add Item
                    </Button>
                </div>
                <div className="space-y-3">
                    {data.inclusions.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <Input
                                value={item}
                                onChange={(e) => handleItemChange('inclusions', index, e.target.value)}
                                placeholder="e.g., Driver & Fuel Charges"
                            />
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveItem('inclusions', index)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>

            <Separator />
            
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Exclusions</h3>
                    <Button size="sm" variant="outline" onClick={() => handleAddItem('exclusions')}>
                        <Plus className="mr-2 h-4 w-4" /> Add Item
                    </Button>
                </div>
                <div className="space-y-3">
                    {data.exclusions.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <Input
                                value={item}
                                onChange={(e) => handleItemChange('exclusions', index, e.target.value)}
                                placeholder="e.g., Parking charges"
                            />
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveItem('exclusions', index)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

    