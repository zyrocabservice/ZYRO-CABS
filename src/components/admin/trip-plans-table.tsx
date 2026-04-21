

'use client';

import type { TripPlan } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import { Checkbox } from '../ui/checkbox';
import { useMemo } from 'react';

interface TripPlansTableProps {
  tripPlans: TripPlan[];
  selectedIds: string[];
  onSelectedIdsChange: (ids: string[]) => void;
}

export default function TripPlansTable({ tripPlans, selectedIds, onSelectedIdsChange }: TripPlansTableProps) {
  const isAllSelected = useMemo(() => {
    const visibleIds = new Set(tripPlans.map(p => p.id));
    return selectedIds.length > 0 && selectedIds.every(id => visibleIds.has(id));
  }, [tripPlans, selectedIds]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectedIdsChange(tripPlans.map(p => p.id));
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

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="relative overflow-y-auto min-h-[45vh] max-h-[45vh]">
        <Table>
          <TableHeader className="sticky top-0 z-10">
            <TableRow className="bg-secondary hover:bg-secondary">
              <TableHead className="px-4">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={(checked) => handleSelectAll(!!checked)}
                  aria-label="Select all trip plans"
                />
              </TableHead>
              <TableHead>Request ID</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Car Type</TableHead>
              <TableHead>Passengers</TableHead>
              <TableHead>Days</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tripPlans.map((plan) => (
              <TableRow key={plan.id} className="hover:bg-transparent" data-state={selectedIds.includes(plan.id) ? 'selected' : ''}>
                <TableCell className="px-4">
                  <Checkbox
                    checked={selectedIds.includes(plan.id)}
                    onCheckedChange={(checked) => handleSelectOne(plan.id, !!checked)}
                    aria-label={`Select trip plan ${plan.id}`}
                  />
                </TableCell>
                <TableCell className="font-medium font-mono text-xs">{plan.id}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{plan.timestamp ? format(plan.timestamp, 'PPpp') : 'N/A'}</TableCell>
                <TableCell>{plan.name}</TableCell>
                <TableCell>{plan.phone}</TableCell>
                <TableCell>{plan.email}</TableCell>
                <TableCell>{plan.from}</TableCell>
                <TableCell>{plan.to}</TableCell>
                <TableCell>{plan.carType}</TableCell>
                <TableCell>{plan.passengers}</TableCell>
                <TableCell>{plan.numberOfDays}</TableCell>
              </TableRow>
            ))}
            {tripPlans.length === 0 && (
              <TableRow>
                <TableCell colSpan={11} className="text-center h-24">
                  No trip plan requests found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
