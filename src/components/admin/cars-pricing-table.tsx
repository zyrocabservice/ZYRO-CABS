
'use client';

import type { Car } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '../ui/button';
import { Trash2 } from 'lucide-react';
import { Label } from '../ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useState } from 'react';

interface CarsAndPricingTableProps {
  cars: Car[];
  onDataChange: (cars: Car[]) => void;
}

const isValidUrl = (url: string | null | undefined): boolean => {
    if (!url) return false;
    try {
        new URL(url);
        return url.startsWith('http://') || url.startsWith('https://');
    } catch (e) {
        return false;
    }
};

const transformImageUrl = (url: string | null | undefined): string => {
    if (!url) return 'https://placehold.co/400x250/EFEFEF/AAAAAA&text=No+URL';
    if (url.includes('github.com') && !url.includes('raw.githubusercontent.com')) {
        return url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
    }
    return url;
}

export default function CarsAndPricingTable({ cars, onDataChange }: CarsAndPricingTableProps) {
  const [carToDelete, setCarToDelete] = useState<Car | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  
  const handleInputChange = (carId: string, field: keyof Car, value: string) => {
    const updatedCars = cars.map(car => {
      if (car.id === carId) {
        const numericFields: (keyof Car)[] = ['capacity', 'oneWayRate', 'roundTripRate', 'airportTransferRate', 'driverAllowance'];
        const newValue = numericFields.includes(field) ? Number(value) : value;
        return { ...car, [field]: newValue };
      }
      return car;
    });
    onDataChange(updatedCars);
  };

  const handleAddNewCar = () => {
    const newCar: Car = {
      id: `new-car-${Date.now()}`,
      carType: '',
      description: '',
      imageUrl: 'https://placehold.co/400x250/EFEFEF/AAAAAA&text=New+Car',
      imageHint: "car",
      capacity: 0,
      oneWayRate: 0,
      roundTripRate: 0,
      airportTransferRate: 0,
      driverAllowance: 0,
    };
    onDataChange([...cars, newCar]);
  };
  
  const handleConfirmRemove = () => {
    if (carToDelete && deleteConfirmation.trim().toUpperCase() === 'DELETE') {
        const updatedCars = cars.filter(car => car.id !== carToDelete.id);
        onDataChange(updatedCars);
    }
    // Reset state after action
    setCarToDelete(null);
    setDeleteConfirmation('');
  }

  const handleCancelRemove = () => {
    setCarToDelete(null);
    setDeleteConfirmation('');
  }

  const formatValue = (value: number | string | null | undefined) => {
    if (value == null) return '';
    return value.toString();
  }

  return (
    <div className="space-y-4">
        <div className="flex justify-end">
            <Button onClick={handleAddNewCar}>Add New Car</Button>
        </div>
        <div className="border rounded-lg overflow-hidden">
        <Table>
            <TableHeader>
            <TableRow className="bg-secondary hover:bg-secondary">
                <TableHead className="w-[300px]">Car</TableHead>
                <TableHead className="text-center">Car Type</TableHead>
                <TableHead className="text-center">Capacity</TableHead>
                <TableHead className="text-center">One Way (/km)</TableHead>
                <TableHead className="text-center">Round Trip (/km)</TableHead>
                <TableHead className="text-center">Airport (/km)</TableHead>
                <TableHead className="text-center">Driver Allowance (₹)</TableHead>
                <TableHead className="text-center">Actions</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {cars.length > 0 ? (
                cars.map((car) => (
                    <TableRow key={car.id} className="hover:bg-transparent">
                        <TableCell>
                            <div className="space-y-2">
                                <div className="relative w-full aspect-video">
                                    <Image 
                                        src={isValidUrl(car.imageUrl) ? transformImageUrl(car.imageUrl) : 'https://placehold.co/400x250/EFEFEF/AAAAAA&text=Invalid+URL'}
                                        alt={car.carType || 'New Car'}
                                        fill
                                        className="rounded-md object-contain"
                                        sizes="250px"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.srcset = 'https://placehold.co/400x250/EFEFEF/AAAAAA&text=Load+Error';
                                          target.src = 'https://placehold.co/400x250/EFEFEF/AAAAAA&text=Load+Error';
                                        }}
                                    />
                                </div>
                                <div>
                                  <Label htmlFor={`imageUrl-${car.id}`} className="sr-only">Image URL</Label>
                                  <Input 
                                      id={`imageUrl-${car.id}`}
                                      value={formatValue(car.imageUrl)} 
                                      onChange={(e) => handleInputChange(car.id, 'imageUrl', e.target.value)}
                                      className="text-xs"
                                      placeholder="Image URL"
                                  />
                                </div>
                            </div>
                        </TableCell>
                    <TableCell className="font-medium text-center">
                        <Input 
                            value={formatValue(car.carType)} 
                            onChange={(e) => handleInputChange(car.id, 'carType', e.target.value)}
                            className="text-center"
                            placeholder="e.g., Sedan"
                        />
                    </TableCell>
                    <TableCell className="text-center">
                        <Input 
                            type="number"
                            value={formatValue(car.capacity)} 
                            onChange={(e) => handleInputChange(car.id, 'capacity', e.target.value)}
                            className="text-center w-20 mx-auto"
                        />
                    </TableCell>
                    <TableCell className="text-center">
                        <Input 
                            type="number"
                            value={formatValue(car.oneWayRate)} 
                            onChange={(e) => handleInputChange(car.id, 'oneWayRate', e.target.value)}
                            className="text-center w-24 mx-auto"
                        />
                    </TableCell>
                    <TableCell className="text-center">
                        <Input 
                            type="number"
                            value={formatValue(car.roundTripRate)} 
                            onChange={(e) => handleInputChange(car.id, 'roundTripRate', e.target.value)}
                            className="text-center w-24 mx-auto"
                        />
                    </TableCell>
                    <TableCell className="text-center">
                        <Input 
                            type="number"
                            value={formatValue(car.airportTransferRate)} 
                            onChange={(e) => handleInputChange(car.id, 'airportTransferRate', e.target.value)}
                            className="text-center w-24 mx-auto"
                        />
                    </TableCell>
                    <TableCell className="text-center">
                        <Input 
                            type="number"
                            value={formatValue(car.driverAllowance)} 
                            onChange={(e) => handleInputChange(car.id, 'driverAllowance', e.target.value)}
                            className="text-center w-24 mx-auto"
                        />
                    </TableCell>
                    <TableCell className="text-center">
                         <AlertDialog onOpenChange={(open) => !open && handleCancelRemove()}>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setCarToDelete(car)}
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                    <span className="sr-only">Remove Car</span>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the <strong>{carToDelete?.carType || 'this car'}</strong>.
                                        <br/><br/>
                                        Please type <strong className="text-destructive font-mono">DELETE</strong> to confirm.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <Input
                                    value={deleteConfirmation}
                                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                                    placeholder='Type "DELETE" to confirm'
                                    autoFocus
                                />
                                <AlertDialogFooter>
                                    <AlertDialogCancel onClick={handleCancelRemove}>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={handleConfirmRemove} 
                                      disabled={deleteConfirmation.trim().toUpperCase() !== 'DELETE'}
                                      className="bg-destructive hover:bg-destructive/90"
                                    >
                                        Confirm
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                    </TableRow>
                ))
            ) : (
                <TableRow>
                <TableCell colSpan={8} className="text-center h-24">
                    No cars found. Click "Add New Car" to begin.
                </TableCell>
                </TableRow>
            )}
            </TableBody>
        </Table>
        </div>
    </div>
  );
}
