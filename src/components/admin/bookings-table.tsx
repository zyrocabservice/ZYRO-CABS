

'use client';

import type { Booking, BookingStatus } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { ArrowUpDown, FilePenLine } from 'lucide-react';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '../ui/input';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Checkbox } from '../ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '../ui/label';

type SortKey = 'createdAt' | 'customer.name' | 'status';
type SortDirection = 'asc' | 'desc';

interface BookingsTableProps {
  bookings: Booking[];
  onDataChange: (bookings: Booking[]) => void;
  sortKey: SortKey;
  sortDirection: SortDirection;
  onSort: (key: SortKey) => void;
  selectedBookingIds: string[];
  onSelectedBookingIdsChange: (ids: string[]) => void;
  canEdit: boolean;
}

const ALL_STATUSES: BookingStatus[] = ['pending', 'confirmed', 'completed', 'cancelled'];

export default function BookingsTable({ bookings, onDataChange, sortKey, sortDirection, onSort, selectedBookingIds, onSelectedBookingIdsChange, canEdit }: BookingsTableProps) {
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [driverName, setDriverName] = useState('');
  const [driverNo, setDriverNo] = useState('');
  const [carNo, setCarNo] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const isAllSelected = useMemo(() => {
    const visibleBookingIds = new Set(bookings.map(b => b.id));
    return selectedBookingIds.length > 0 && selectedBookingIds.every(id => visibleBookingIds.has(id));
  }, [bookings, selectedBookingIds]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectedBookingIdsChange(bookings.map(b => b.id));
    } else {
      onSelectedBookingIdsChange([]);
    }
  };

  const handleSelectOne = (bookingId: string, checked: boolean) => {
    if (checked) {
      onSelectedBookingIdsChange([...selectedBookingIds, bookingId]);
    } else {
      onSelectedBookingIdsChange(selectedBookingIds.filter(id => id !== bookingId));
    }
  };
  
  const handleFieldChange = (bookingId: string, field: keyof Booking, value: any) => {
    const updatedBookings = bookings.map(b =>
      b.id === bookingId ? { ...b, [field]: value } : b
    );
    onDataChange(updatedBookings);
  };

  const openEditDialog = (booking: Booking) => {
    setEditingBooking(booking);
    setDriverName(booking.driverName || '');
    setDriverNo(booking.driverNo || '');
    setCarNo(booking.carNo || '');
    setIsDialogOpen(true);
  };

  const handleSaveDetails = () => {
    if (!editingBooking) return;
    
    const updatedBookings = bookings.map(b => 
      b.id === editingBooking.id 
        ? { ...b, driverName, driverNo, carNo, status: b.status === 'pending' ? 'confirmed' : b.status }
        : b
    );
    onDataChange(updatedBookings);
    
    setIsDialogOpen(false);
    setEditingBooking(null);
  };


  const SortableHeader = ({ tKey, children }: { tKey: SortKey, children: React.ReactNode }) => {
    const isSorted = sortKey === tKey;
    return (
      <TableHead>
        <Button variant="ghost" onClick={() => onSort(tKey)} className="px-2">
          {children}
          <ArrowUpDown className={`ml-2 h-4 w-4 ${isSorted ? 'text-foreground' : 'text-muted-foreground/50'}`} />
        </Button>
      </TableHead>
    )
  }

  return (
    <>
    <div className="border rounded-lg overflow-hidden">
        <div className="relative overflow-y-auto min-h-[70vh] max-h-[70vh]">
            <Table>
                <TableHeader className="sticky top-0 z-10">
                    <TableRow className="bg-secondary hover:bg-secondary">
                        <TableHead className="px-4">
                            <Checkbox
                                checked={isAllSelected}
                                onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                aria-label="Select all"
                            />
                        </TableHead>
                        <TableHead>Booking ID</TableHead>
                        <SortableHeader tKey="customer.name">Name</SortableHeader>
                        <TableHead>Contact</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>From and To</TableHead>
                        <SortableHeader tKey="createdAt">Booked date</SortableHeader>
                        <TableHead>Pickup Date</TableHead>
                        <TableHead>Pickup Time</TableHead>
                        <TableHead>Passengers</TableHead>
                        <TableHead>Pricing</TableHead>
                        <TableHead>Offer (Applied or NA)</TableHead>
                        <TableHead>Toll & Taxes</TableHead>
                        <TableHead>Driver & Car</TableHead>
                        <SortableHeader tKey="status">Status</SortableHeader>
                        {canEdit && <TableHead className="text-right">Actions</TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {bookings.map((booking) => (
                        <TableRow key={booking.id} className={cn("hover:bg-transparent", selectedBookingIds.includes(booking.id) && 'bg-primary/10')}>
                            <TableCell className="px-4">
                                 <Checkbox
                                    checked={selectedBookingIds.includes(booking.id)}
                                    onCheckedChange={(checked) => handleSelectOne(booking.id, !!checked)}
                                    aria-label={`Select booking ${booking.id}`}
                                />
                            </TableCell>
                            <TableCell className="font-medium font-mono text-xs">{booking.id}</TableCell>
                            <TableCell>
                                <div className="font-medium">{booking.customer?.name || 'N/A'}</div>
                            </TableCell>
                            <TableCell>
                                <div className="text-sm text-muted-foreground">{booking.customer?.mobile || 'N/A'}</div>
                            </TableCell>
                            <TableCell>
                                <div className="text-xs text-muted-foreground">{booking.customer?.email || 'N/A'}</div>
                            </TableCell>
                            <TableCell>
                                <div className="font-medium truncate max-w-xs">{booking.pickupLocation}</div>
                                <div className="text-sm text-muted-foreground truncate max-w-xs">to {booking.dropLocation}</div>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                                {booking.createdAt ? format(new Date(booking.createdAt), 'PPpp') : 'N/A'}
                            </TableCell>
                            <TableCell>
                                {booking.pickupDate ? format(new Date(booking.pickupDate), 'PP') : 'N/A'}
                            </TableCell>
                            <TableCell>
                                {booking.pickupTime || 'N/A'}
                            </TableCell>
                            <TableCell>
                                {booking.passengers ? `${booking.passengers}` : 'N/A'}
                            </TableCell>
                            <TableCell>
                                {booking.estimatedFare ? `₹${booking.estimatedFare.toFixed(2)}` : 'N/A'}
                            </TableCell>
                             <TableCell>
                                N/A
                             </TableCell>
                             <TableCell>
                                <div className="text-xs">Toll: {booking.tollCharges || 'N/A'}</div>
                                <div className="text-xs">Tax: {booking.tax || 'N/A'}</div>
                            </TableCell>
                            <TableCell>
                                <div className="text-sm font-semibold">{booking.driverName || 'N/A'}</div>
                                <div className="text-sm text-muted-foreground">{booking.driverNo || 'N/A'}</div>
                                <div className="text-xs font-mono">{booking.carNo || 'N/A'}</div>
                            </TableCell>
                            <TableCell>
                                <Select value={booking.status} onValueChange={(newStatus) => handleFieldChange(booking.id, 'status', newStatus as BookingStatus)}>
                                    <SelectTrigger className="w-[140px] capitalize">
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ALL_STATUSES.map(status => (
                                            <SelectItem key={status} value={status} className="capitalize">
                                                {status.replace('_', ' ')}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </TableCell>
                            {canEdit && (
                              <TableCell className="text-right">
                                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(booking)}>
                                      <FilePenLine className="h-4 w-4" />
                                      <span className="sr-only">Edit Booking</span>
                                  </Button>
                              </TableCell>
                            )}
                        </TableRow>
                    ))}
                    {bookings.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={15} className="text-center h-24">
                                No bookings found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    </div>

     <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Booking Details</DialogTitle>
                <DialogDescription>
                    Update driver details for booking ID: {editingBooking?.id}
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                 <div className="space-y-2">
                    <Label htmlFor="driverName">Driver Name</Label>
                    <Input
                        id="driverName"
                        value={driverName}
                        onChange={(e) => setDriverName(e.target.value)}
                        placeholder="Driver's full name"
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="driverNo">Driver Number</Label>
                    <Input
                        id="driverNo"
                        value={driverNo}
                        onChange={(e) => setDriverNo(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                        placeholder="10-digit mobile number"
                        maxLength={10}
                        type="tel"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="carNo">Car Number</Label>
                    <Input
                        id="carNo"
                        value={carNo}
                        onChange={(e) => setCarNo(e.target.value.toUpperCase())}
                        placeholder="e.g., TN01AB1234"
                    />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveDetails}>Save Changes</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}
