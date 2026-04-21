
'use client';

import type { CustomerDetail } from '@/lib/types';
import { Button } from '../ui/button';
import { ArrowUpDown, User, Mail, Phone, BookOpen } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';

type CustomerSortKey = 'name' | 'email' | 'bookingsCount';
type SortDirection = 'asc' | 'desc';

interface CustomerDetailsTableProps {
  customers: CustomerDetail[];
  sortKey: CustomerSortKey;
  sortDirection: SortDirection;
  onSort: (key: CustomerSortKey) => void;
  selectedIds: string[];
  onSelectedIdsChange: (ids: string[]) => void;
}

const DetailRow = ({ icon: Icon, value, label }: { icon: React.ElementType, value: string | undefined, label: string }) => {
    if (!value) return null;
    return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon className="w-4 h-4" />
             <span className="font-medium">{label}:</span>
            <span>{value}</span>
        </div>
    )
}

export default function CustomerDetailsTable({ customers, sortKey, sortDirection, onSort, selectedIds, onSelectedIdsChange }: CustomerDetailsTableProps) {
    const isAllSelected = useMemo(() => {
        const visibleIds = new Set(customers.map(c => c.id));
        return selectedIds.length > 0 && selectedIds.every(id => visibleIds.has(id));
    }, [customers, selectedIds]);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            onSelectedIdsChange(customers.map(c => c.id));
        } else {
            onSelectedIdsChange([]);
        }
    };

    const handleSelectOne = (id: string, checked: boolean) => {
        if (checked) {
            onSelectedIdsChange([...selectedIds, id]);
        } else {
            onSelectedIdsChange(selectedIds.filter(selectedId => selectedId !== id));
        }
    };

    if (customers.length === 0) {
        return (
            <div className="text-center py-16 border-dashed border-2 rounded-lg">
                <User className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No Customer Data</h3>
                <p className="mt-1 text-sm text-muted-foreground">Customer information will appear here as they book rides.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
             <div className="flex items-center gap-2 px-1">
                <Checkbox
                    id="select-all-customers"
                    checked={isAllSelected}
                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                    aria-label="Select all customers"
                />
                <label htmlFor="select-all-customers" className="text-sm font-medium">Select All</label>
            </div>
            <div className="space-y-4">
                {customers.map((customer) => (
                    <Card key={customer.id} className="relative transition-all" data-state={selectedIds.includes(customer.id) ? 'selected' : ''}>
                        <Checkbox
                            checked={selectedIds.includes(customer.id)}
                            onCheckedChange={(checked) => handleSelectOne(customer.id, !!checked)}
                            aria-label={`Select customer ${customer.name}`}
                            className="absolute top-4 right-4 h-5 w-5"
                        />
                        <CardHeader>
                            <h3 className="font-semibold text-lg">{customer.name}</h3>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                           <DetailRow icon={Mail} label="Email" value={customer.email} />
                           <DetailRow icon={Phone} label="Phone" value={customer.phone} />
                           <div className="flex items-center">
                             <Badge variant="secondary" className="flex items-center gap-2 w-fit">
                                <BookOpen className="w-4 h-4" />
                                {customer.bookingsCount} {customer.bookingsCount === 1 ? 'Booking' : 'Bookings'}
                             </Badge>
                           </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
  );
}
