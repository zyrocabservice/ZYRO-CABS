
'use client';

import * as React from 'react';
import type { ImagePlaceholder } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '../ui/button';
import { Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { format, parseISO } from 'date-fns';

interface BannersTableProps {
  banners: ImagePlaceholder[];
  onDataChange: (banners: ImagePlaceholder[]) => void;
}

const isValidHttpUrl = (string: string) => {
    try {
        const url = new URL(string);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
        return false;
    }
};

const transformImageUrl = (url: string | null | undefined): string => {
    if (!url) return 'https://placehold.co/1200x400/EFEFEF/AAAAAA&text=No+URL';
    if (url.includes('github.com') && !url.includes('raw.githubusercontent.com')) {
        return url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
    }
    return url;
}

export default function BannersTable({ banners, onDataChange }: BannersTableProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [urlError, setUrlError] = React.useState<string | null>(null);
  const [newBannerDetails, setNewBannerDetails] = React.useState<Partial<ImagePlaceholder>>({
    imageUrl: '',
    description: '',
    imageHint: 'banner',
    redirectUrl: '',
    objectFit: 'cover',
    isBanner: true,
    duration: 5,
    startDate: undefined,
    endDate: undefined,
  });
  
  const handleInputChange = (bannerId: string, field: keyof ImagePlaceholder, value: string | boolean | number | undefined) => {
    let finalValue = value;
    
    const updatedBanners = banners.map(banner => {
      if (banner.id === bannerId) {
        return { ...banner, [field]: finalValue };
      }
      return banner;
    });
    onDataChange(updatedBanners);
  };

  const handleUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setNewBannerDetails(prev => ({ ...prev, imageUrl: url }));
    if (url && !isValidHttpUrl(url)) {
        setUrlError("Please provide a valid URL.");
    } else {
        setUrlError(null);
    }
  };
  

  const handleAddNewBanner = () => {
    if (urlError) {
        return;
    }
    const newBanner: ImagePlaceholder = {
      id: `new-banner-${Date.now()}`,
      description: newBannerDetails.description || '',
      imageUrl: newBannerDetails.imageUrl || '',
      imageHint: newBannerDetails.imageHint || 'banner',
      isBanner: newBannerDetails.isBanner,
      redirectUrl: newBannerDetails.redirectUrl,
      objectFit: newBannerDetails.objectFit || 'cover',
      duration: newBannerDetails.duration || 5,
      startDate: newBannerDetails.startDate,
      endDate: newBannerDetails.endDate,
    };
    onDataChange([...banners, newBanner]);
    // Reset state and close dialog
    setNewBannerDetails({ imageUrl: '', description: '', imageHint: 'banner', redirectUrl: '', objectFit: 'cover', isBanner: true, duration: 5, startDate: undefined, endDate: undefined });
    setUrlError(null);
    setIsDialogOpen(false);
  };
  
  const handleRemoveBanner = (bannerId: string) => {
    const updatedBanners = banners.filter(banner => banner.id !== bannerId);
    onDataChange(updatedBanners);
  }

  const formatValue = (value: string | number | null | undefined) => {
    if (value == null) return '';
    return value.toString();
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

  return (
    <div className="space-y-4">
        <div className="flex justify-end">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button>Add New Image</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Add a New Image</DialogTitle>
                        <DialogDescription>
                            Provide the details for your new image. You can specify if it's a hero banner or a gallery image.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="new-image-url">Image URL</Label>
                                <Input
                                    id="new-image-url"
                                    placeholder="https://example.com/image.png"
                                    value={newBannerDetails.imageUrl}
                                    onChange={handleUrlInputChange}
                                    className={cn(urlError && "border-destructive")}
                                />
                                {urlError && <p className="text-sm text-destructive">{urlError}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-description">Title</Label>
                                <Input
                                    id="new-description"
                                    placeholder="e.g., Summer Sale Banner"
                                    value={newBannerDetails.description}
                                    onChange={(e) => setNewBannerDetails(prev => ({ ...prev, description: e.target.value }))}
                                />
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="new-image-hint">Image Hint</Label>
                                    <Input
                                        id="new-image-hint"
                                        placeholder="e.g., travel promotion"
                                        value={newBannerDetails.imageHint}
                                        onChange={(e) => setNewBannerDetails(prev => ({ ...prev, imageHint: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="new-duration">Duration (s)</Label>
                                    <Input
                                        id="new-duration"
                                        type="number"
                                        placeholder="5"
                                        value={newBannerDetails.duration}
                                        onChange={(e) => setNewBannerDetails(prev => ({ ...prev, duration: parseInt(e.target.value, 10) || 5 }))}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Start Date (Optional)</Label>
                                    <DatePicker 
                                        date={newBannerDetails.startDate}
                                        onSelect={(date) => setNewBannerDetails(prev => ({ ...prev, startDate: date?.toISOString() }))}
                                        placeholder="No start date"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>End Date (Optional)</Label>
                                    <DatePicker
                                        date={newBannerDetails.endDate}
                                        onSelect={(date) => setNewBannerDetails(prev => ({ ...prev, endDate: date?.toISOString() }))}
                                        placeholder="No end date"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-redirect-url">Redirect Link (Optional)</Label>
                                <Input
                                    id="new-redirect-url"
                                    placeholder="/offers"
                                    value={newBannerDetails.redirectUrl}
                                    onChange={(e) => setNewBannerDetails(prev => ({ ...prev, redirectUrl: e.target.value }))}
                                />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="new-object-fit">Image Fit</Label>
                                <Select
                                    value={newBannerDetails.objectFit}
                                    onValueChange={(value) => setNewBannerDetails(prev => ({...prev, objectFit: value as 'cover' | 'contain'}))}
                                >
                                    <SelectTrigger id="new-object-fit">
                                        <SelectValue placeholder="Select fit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cover">Cover (Fills the container)</SelectItem>
                                        <SelectItem value="contain">Contain (Fits inside container)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="is-banner" checked={newBannerDetails.isBanner} onCheckedChange={(checked) => setNewBannerDetails(prev => ({ ...prev, isBanner: !!checked }))} />
                                <Label htmlFor="is-banner">Show in main hero banner carousel</Label>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Image Preview</Label>
                            <div className="relative w-full aspect-[16/9] rounded-md overflow-hidden border bg-muted">
                                {newBannerDetails.imageUrl && isValidHttpUrl(newBannerDetails.imageUrl) ? (
                                    <Image
                                        src={transformImageUrl(newBannerDetails.imageUrl)}
                                        alt="Banner preview"
                                        fill
                                        className={cn(newBannerDetails.objectFit === 'contain' ? 'object-contain' : 'object-cover')}
                                        sizes="50vw"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-muted-foreground">
                                        Enter a valid image URL to see a preview
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setIsDialogOpen(false); setUrlError(null); }}>Cancel</Button>
                        <Button onClick={handleAddNewBanner} disabled={!!urlError}>Save Image</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
        <div className="border rounded-lg overflow-hidden">
        <Table>
            <TableHeader>
                <TableRow className="bg-secondary hover:bg-secondary">
                    <TableHead className="w-[200px]">Image Preview</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Image Hint</TableHead>
                    <TableHead>Redirect Link</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
            {banners.length > 0 ? (
                banners.map((banner) => (
                    <TableRow key={banner.id} className="hover:bg-transparent">
                        <TableCell>
                            <div className="space-y-2">
                                <div className="relative w-full aspect-video">
                                    <Image 
                                        src={transformImageUrl(banner.imageUrl)}
                                        alt={banner.description || 'Banner image'}
                                        fill
                                        className={cn("rounded-md", banner.objectFit === 'contain' ? 'object-contain' : 'object-cover')}
                                        sizes="250px"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.srcset = 'https://placehold.co/400x250/EFEFEF/AAAAAA&text=Load+Error';
                                          target.src = 'https://placehold.co/400x250/EFEFEF/AAAAAA&text=Load+Error';
                                        }}
                                    />
                                </div>
                                <div>
                                  <Label htmlFor={`imageUrl-${banner.id}`} className="sr-only">Image URL</Label>
                                  <Input 
                                      id={`imageUrl-${banner.id}`}
                                      value={formatValue(banner.imageUrl)} 
                                      onChange={(e) => handleInputChange(banner.id, 'imageUrl', e.target.value)}
                                      className="text-xs"
                                      placeholder="Image URL"
                                  />
                                </div>
                            </div>
                        </TableCell>
                        <TableCell>
                            <Input 
                                value={formatValue(banner.description)} 
                                onChange={(e) => handleInputChange(banner.id, 'description', e.target.value)}
                                placeholder="e.g., Summer sale banner"
                            />
                        </TableCell>
                        <TableCell>
                            <Input 
                                value={formatValue(banner.imageHint)} 
                                onChange={(e) => handleInputChange(banner.id, 'imageHint', e.target.value)}
                                placeholder="e.g., travel promotion"
                            />
                        </TableCell>
                        <TableCell>
                            <Input 
                                value={formatValue(banner.redirectUrl)} 
                                onChange={(e) => handleInputChange(banner.id, 'redirectUrl', e.target.value)}
                                placeholder="e.g., /offers"
                            />
                        </TableCell>
                        <TableCell>
                           <div className="space-y-2">
                                <DatePicker
                                    date={banner.startDate}
                                    onSelect={(date) => handleInputChange(banner.id, 'startDate', date?.toISOString())}
                                    placeholder="Start Date"
                                />
                                <DatePicker
                                    date={banner.endDate}
                                    onSelect={(date) => handleInputChange(banner.id, 'endDate', date?.toISOString())}
                                    placeholder="End Date"
                                />
                           </div>
                        </TableCell>
                         <TableCell>
                            <div className="flex items-center space-x-2">
                                <Checkbox id={`isBanner-${banner.id}`} checked={banner.isBanner} onCheckedChange={(checked) => handleInputChange(banner.id, 'isBanner', !!checked)} />
                                <Label htmlFor={`isBanner-${banner.id}`} className="text-xs">Hero Banner</Label>
                            </div>
                        </TableCell>
                        <TableCell className="text-center">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveBanner(banner.id)}
                            >
                                <Trash2 className="h-4 w-4 text-destructive" />
                                <span className="sr-only">Remove Banner</span>
                            </Button>
                        </TableCell>
                    </TableRow>
                ))
            ) : (
                <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">
                        No images found. Click "Add New Image" to begin.
                    </TableCell>
                </TableRow>
            )}
            </TableBody>
        </Table>
        </div>
    </div>
  );
}
