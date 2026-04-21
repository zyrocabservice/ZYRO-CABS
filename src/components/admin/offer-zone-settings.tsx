

'use client';

import * as React from 'react';
import type { Offer } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import { Button } from '../ui/button';
import { Trash2, Calendar as CalendarIcon, Percent, DollarSign, Tag, Shield, Users, Globe } from 'lucide-react';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { format, parseISO } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { Textarea } from '../ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';

interface OfferZoneSettingsProps {
  offers: Offer[];
  onDataChange: (offers: Offer[]) => void;
}

const DatePicker = ({ date, onSelect, placeholder }: { date?: string, onSelect: (date?: Date) => void, placeholder: string }) => (
    <Popover>
        <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-full justify-start text-left font-normal truncate", !date && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(parseISO(date), 'PP') : <span>{placeholder}</span>}
            </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={date ? parseISO(date) : undefined} onSelect={onSelect} initialFocus />
        </PopoverContent>
    </Popover>
);

export default function OfferZoneSettings({ offers, onDataChange }: OfferZoneSettingsProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [newOfferDetails, setNewOfferDetails] = React.useState<Partial<Offer>>({
    title: '',
    description: '',
    code: '',
    offerType: 'coupon',
    targetAudience: 'all',
    discountType: 'percentage',
    discountValue: 0,
    isActive: true,
  });
  
  const handleInputChange = (offerId: string, field: keyof Offer, value: string | boolean | number | undefined) => {
    const updatedOffers = offers.map(offer => {
      if (offer.id === offerId) {
        const updatedOffer: Offer = { ...offer, [field]: value };
        // If changing to admin offer, clear the code
        if (field === 'offerType' && value === 'admin') {
            updatedOffer.code = '';
        }
        if (field === 'offerType' && value === 'coupon') {
            delete updatedOffer.targetAudience;
        }
        return updatedOffer;
      }
      return offer;
    });
    onDataChange(updatedOffers);
  };
  
  const handleAddNewOffer = () => {
    const newOffer: Offer = {
      id: `offer-${Date.now()}`,
      title: newOfferDetails.title || 'New Offer',
      description: newOfferDetails.description || '',
      code: newOfferDetails.offerType === 'admin' ? '' : (newOfferDetails.code || ''),
      offerType: newOfferDetails.offerType || 'coupon',
      targetAudience: newOfferDetails.offerType === 'admin' ? (newOfferDetails.targetAudience || 'all') : undefined,
      discountType: newOfferDetails.discountType || 'percentage',
      discountValue: newOfferDetails.discountValue || 0,
      startDate: newOfferDetails.startDate,
      endDate: newOfferDetails.endDate,
      isActive: newOfferDetails.isActive ?? true,
    };
    onDataChange([...offers, newOffer]);
    setNewOfferDetails({ title: '', description: '', code: '', offerType: 'coupon', discountType: 'percentage', discountValue: 0, isActive: true, targetAudience: 'all' });
    setIsDialogOpen(false);
  };
  
  const handleRemoveOffer = (offerId: string) => {
    const updatedOffers = offers.filter(offer => offer.id !== offerId);
    onDataChange(updatedOffers);
  };
  
  const formatDiscount = (offer: Offer) => {
    if (offer.discountType === 'fixed') {
        return `₹${offer.discountValue}`;
    }
    return `${offer.discountValue}%`;
  }

  return (
    <div className="space-y-4">
        <div className="flex justify-end">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button>Add New Offer</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Add a New Offer</DialogTitle>
                        <DialogDescription>
                            Provide the details for your new promotional offer.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                         <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="new-offer-type">Offer Type</Label>
                                <Select value={newOfferDetails.offerType} onValueChange={(value) => setNewOfferDetails(prev => ({...prev, offerType: value as 'coupon' | 'admin'}))}>
                                    <SelectTrigger id="new-offer-type">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="coupon">Coupon (User enters code)</SelectItem>
                                        <SelectItem value="admin">Admin Offer (Auto-applied)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {newOfferDetails.offerType === 'admin' && (
                                 <div className="space-y-2">
                                    <Label htmlFor="new-target-audience">Target Audience</Label>
                                    <Select value={newOfferDetails.targetAudience} onValueChange={(value) => setNewOfferDetails(prev => ({...prev, targetAudience: value as 'all' | 'signed-in'}))}>
                                        <SelectTrigger id="new-target-audience">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Users</SelectItem>
                                            <SelectItem value="signed-in">Signed-in Users Only</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-offer-title">Title</Label>
                            <Input
                                id="new-offer-title"
                                placeholder="e.g., Summer Discount"
                                value={newOfferDetails.title}
                                onChange={(e) => setNewOfferDetails(prev => ({ ...prev, title: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-offer-description">Description</Label>
                            <Textarea
                                id="new-offer-description"
                                placeholder="e.g., Get 10% off on all rides."
                                value={newOfferDetails.description}
                                onChange={(e) => setNewOfferDetails(prev => ({ ...prev, description: e.target.value }))}
                            />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="new-offer-code">Coupon Code</Label>
                            <Input
                                id="new-offer-code"
                                placeholder="e.g., SUMMER10"
                                value={newOfferDetails.code}
                                onChange={(e) => setNewOfferDetails(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                                disabled={newOfferDetails.offerType === 'admin'}
                            />
                             {newOfferDetails.offerType === 'admin' && <p className="text-xs text-muted-foreground">Coupon code is not needed for Admin Offers.</p>}
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                                <Label htmlFor="new-offer-discount-type">Discount Type</Label>
                                <Select value={newOfferDetails.discountType} onValueChange={(value) => setNewOfferDetails(prev => ({...prev, discountType: value as 'percentage' | 'fixed'}))}>
                                    <SelectTrigger id="new-offer-discount-type">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                                        <SelectItem value="fixed">Fixed Price (₹)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-offer-discount">Value</Label>
                                <Input
                                    id="new-offer-discount"
                                    type="number"
                                    placeholder={newOfferDetails.discountType === 'percentage' ? '10' : '100'}
                                    value={newOfferDetails.discountValue}
                                    onChange={(e) => setNewOfferDetails(prev => ({ ...prev, discountValue: parseFloat(e.target.value) || 0 }))}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Start Date (Optional)</Label>
                                <DatePicker 
                                    date={newOfferDetails.startDate}
                                    onSelect={(date) => setNewOfferDetails(prev => ({ ...prev, startDate: date?.toISOString() }))}
                                    placeholder="No start date"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>End Date (Optional)</Label>
                                <DatePicker
                                    date={newOfferDetails.endDate}
                                    onSelect={(date) => setNewOfferDetails(prev => ({ ...prev, endDate: date?.toISOString() }))}
                                    placeholder="No end date"
                                />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch id="is-active" checked={newOfferDetails.isActive} onCheckedChange={(checked) => setNewOfferDetails(prev => ({ ...prev, isActive: !!checked }))} />
                            <Label htmlFor="is-active">Offer is Active</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddNewOffer}>Save Offer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
        <div className="border rounded-lg overflow-hidden">
        <Table>
            <TableHeader>
                <TableRow className="bg-secondary hover:bg-secondary">
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Coupon Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
            {offers.length > 0 ? (
                offers.map((offer) => (
                    <TableRow key={offer.id}>
                        <TableCell>
                            <Input 
                                value={offer.title} 
                                onChange={(e) => handleInputChange(offer.id, 'title', e.target.value)}
                                className="font-medium"
                            />
                        </TableCell>
                         <TableCell>
                             <div className="flex flex-col gap-2">
                                <Select value={offer.offerType} onValueChange={(value) => handleInputChange(offer.id, 'offerType', value)}>
                                    <SelectTrigger className="w-36">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="coupon"><div className="flex items-center gap-2"><Tag/> Coupon</div></SelectItem>
                                        <SelectItem value="admin"><div className="flex items-center gap-2"><Shield/> Admin</div></SelectItem>
                                    </SelectContent>
                                </Select>
                                {offer.offerType === 'admin' && (
                                    <Select value={offer.targetAudience || 'all'} onValueChange={(value) => handleInputChange(offer.id, 'targetAudience', value)}>
                                        <SelectTrigger className="w-36">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all"><div className="flex items-center gap-2"><Globe className="text-blue-500" /> All Users</div></SelectItem>
                                            <SelectItem value="signed-in"><div className="flex items-center gap-2"><Users className="text-green-500" /> Signed-in</div></SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                             </div>
                        </TableCell>
                         <TableCell>
                            <Input 
                                value={offer.code} 
                                onChange={(e) => handleInputChange(offer.id, 'code', e.target.value.toUpperCase())}
                                className="font-mono"
                                disabled={offer.offerType === 'admin'}
                            />
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <Select value={offer.discountType} onValueChange={(value) => handleInputChange(offer.id, 'discountType', value)}>
                                    <SelectTrigger className="w-16">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="percentage"><Percent className="h-4 w-4" /></SelectItem>
                                        <SelectItem value="fixed"><DollarSign className="h-4 w-4" /></SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input 
                                    type="number"
                                    value={offer.discountValue} 
                                    onChange={(e) => handleInputChange(offer.id, 'discountValue', parseFloat(e.target.value) || 0)}
                                    className="w-24"
                                />
                            </div>
                        </TableCell>
                        <TableCell>
                           <div className="flex items-center gap-2">
                                <DatePicker
                                    date={offer.startDate}
                                    onSelect={(date) => handleInputChange(offer.id, 'startDate', date?.toISOString())}
                                    placeholder="Start Date"
                                />
                                <DatePicker
                                    date={offer.endDate}
                                    onSelect={(date) => handleInputChange(offer.id, 'endDate', date?.toISOString())}
                                    placeholder="End Date"
                                />
                           </div>
                        </TableCell>
                         <TableCell>
                            <Switch checked={offer.isActive} onCheckedChange={(checked) => handleInputChange(offer.id, 'isActive', checked)} />
                        </TableCell>
                        <TableCell className="text-right">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveOffer(offer.id)}
                            >
                                <Trash2 className="h-4 w-4 text-destructive" />
                                <span className="sr-only">Remove Offer</span>
                            </Button>
                        </TableCell>
                    </TableRow>
                ))
            ) : (
                <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">
                        No offers found. Click "Add New Offer" to begin.
                    </TableCell>
                </TableRow>
            )}
            </TableBody>
        </Table>
        </div>
    </div>
  );
}
