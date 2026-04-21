

'use client';

import type { TaxesAndCharges, StatePermitCharge, TaxItem } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Switch } from "../ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

interface TaxesChargesSettingsProps {
    details: TaxesAndCharges;
    onDataChange: (details: TaxesAndCharges) => void;
}

export default function TaxesChargesSettings({ details, onDataChange }: TaxesChargesSettingsProps) {

    const handleChange = (field: keyof TaxesAndCharges, value: string | StatePermitCharge[] | TaxItem[]) => {
        onDataChange({ ...details, [field]: value });
    };

    const handleStateChargeChange = (index: number, field: keyof StatePermitCharge, value: string | number) => {
        const updatedCharges = [...details.statePermitCharges];
        updatedCharges[index] = { ...updatedCharges[index], [field]: value };
        handleChange('statePermitCharges', updatedCharges);
    };

    const handleAddStateCharge = () => {
        const newCharges = [...details.statePermitCharges, { state: '', charge: '', capacity: undefined }];
        handleChange('statePermitCharges', newCharges);
    };

    const handleRemoveStateCharge = (index: number) => {
        const newCharges = details.statePermitCharges.filter((_, i) => i !== index);
        handleChange('statePermitCharges', newCharges);
    };
    
    const handleTaxChange = (index: number, field: keyof TaxItem, value: string | boolean) => {
        const updatedTaxes = [...details.taxes];
        updatedTaxes[index] = { ...updatedTaxes[index], [field]: value };
        handleChange('taxes', updatedTaxes);
    }
    
    const handleAddTax = () => {
        const newTax: TaxItem = { id: `tax-${Date.now()}`, name: '', value: '', enabled: true };
        handleChange('taxes', [...details.taxes, newTax]);
    }

    const handleRemoveTax = (id: string) => {
        const updatedTaxes = details.taxes.filter(tax => tax.id !== id);
        handleChange('taxes', updatedTaxes);
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>General Charges</CardTitle>
                    <CardDescription>Set application-wide fees and taxes.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                     <div className="space-y-2">
                        <Label htmlFor="tollCharges">Toll Charges (₹ per Km or 'As Applicable')</Label>
                        <Input 
                            id="tollCharges" 
                            type="text"
                            value={details.tollCharges.toString()}
                            onChange={(e) => handleChange('tollCharges', e.target.value)}
                            placeholder="e.g., 2.5 or As Applicable"
                        />
                    </div>
                     <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <Label className="font-semibold">Taxes</Label>
                                <p className="text-xs text-muted-foreground">Add or remove taxes to be applied to the fare.</p>
                            </div>
                            <Button size="sm" variant="outline" onClick={handleAddTax}>
                                <Plus className="mr-2 h-4 w-4" /> Add Tax
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {details.taxes.map((tax, index) => (
                                <div key={tax.id} className="flex items-center gap-2">
                                    <Input
                                        value={tax.name}
                                        onChange={(e) => handleTaxChange(index, 'name', e.target.value)}
                                        placeholder="Tax Name (e.g., GST)"
                                    />
                                    <Input
                                        type="text"
                                        value={tax.value.toString()}
                                        onChange={(e) => handleTaxChange(index, 'value', e.target.value)}
                                        placeholder="Value (e.g., 5%)"
                                    />
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            id={`tax-enabled-${tax.id}`}
                                            checked={tax.enabled}
                                            onCheckedChange={(checked) => handleTaxChange(index, 'enabled', checked)}
                                        />
                                        <Label htmlFor={`tax-enabled-${tax.id}`} className="text-xs">On</Label>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveTax(tax.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                     <CardTitle>State-Specific Permit Charges</CardTitle>
                    <CardDescription>Set charges for state permits. You can specify different charges for different vehicle capacities within the same state.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="flex justify-end mb-4">
                        <Button size="sm" variant="outline" onClick={handleAddStateCharge}>
                            <Plus className="mr-2 h-4 w-4" /> Add State Charge
                        </Button>
                    </div>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {details.statePermitCharges.map((item, index) => (
                            <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-2 border rounded-md">
                                <Input
                                    value={item.state}
                                    onChange={(e) => handleStateChargeChange(index, 'state', e.target.value)}
                                    placeholder="State Name (e.g., Karnataka)"
                                />
                                 <Input
                                    type="number"
                                    value={item.capacity || ''}
                                    onChange={(e) => handleStateChargeChange(index, 'capacity', parseInt(e.target.value, 10))}
                                    placeholder="Capacity (optional)"
                                />
                                <Input
                                    value={item.charge.toString()}
                                    onChange={(e) => handleStateChargeChange(index, 'charge', e.target.value)}
                                    placeholder="Charge (e.g., 500)"
                                />
                                <Button variant="ghost" size="icon" onClick={() => handleRemoveStateCharge(index)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        ))}
                        {details.statePermitCharges.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">No state-specific charges added.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
