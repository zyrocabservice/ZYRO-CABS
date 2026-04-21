

'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface BookingFiltersProps {
  statuses: string[];
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  onClearFilters: () => void;
}

export default function BookingFilters({ statuses, selectedStatus, onStatusChange, onClearFilters }: BookingFiltersProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Status:</span>
        <Select value={selectedStatus} onValueChange={onStatusChange}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
                {statuses.map(status => (
                    <SelectItem key={status} value={status} className="capitalize">
                        {status.replace('_', ' ')}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
      </div>
      {selectedStatus !== 'all' && (
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <X className="mr-2 h-4 w-4" />
            Clear
        </Button>
      )}
    </div>
  );
}
