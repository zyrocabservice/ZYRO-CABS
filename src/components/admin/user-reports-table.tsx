

'use client';

import type { UserReport } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { Checkbox } from '../ui/checkbox';

interface UserReportsTableProps {
  reports: UserReport[];
  selectedIds: string[];
  onSelectedIdsChange: (ids: string[]) => void;
}

const DetailRow = ({ label, value }: { label: string; value?: string }) => {
    if (!value) return null;
    return (
        <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
            <span className="font-semibold text-muted-foreground">{label}:</span>
            <span>{value}</span>
        </div>
    )
};

const ReportRow = ({ report, isSelected, onSelect }: { report: UserReport, isSelected: boolean, onSelect: (checked: boolean) => void }) => {
    const [isOpen, setIsOpen] = useState(false);

    const getCategoryVariant = (category: UserReport['category']) => {
        switch (category) {
        case 'driver': return 'destructive';
        case 'payment': return 'default';
        case 'missing': return 'destructive';
        case 'service': return 'secondary';
        default: return 'outline';
        }
    }

    return (
        <>
            <TableRow className="hover:bg-transparent" data-state={isSelected ? 'selected' : ''}>
                <TableCell className="px-4">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => onSelect(!!checked)}
                    aria-label={`Select report ${report.reportId}`}
                  />
                </TableCell>
                <TableCell className="font-mono text-xs">{report.reportId}</TableCell>
                <TableCell className="text-xs">{report.timestamp ? format(report.timestamp, 'PPpp') : 'N/A'}</TableCell>
                <TableCell>
                    <div className="font-medium">{report.name}</div>
                    <div className="text-muted-foreground text-xs">{report.email}</div>
                </TableCell>
                <TableCell>
                    <Badge variant={getCategoryVariant(report.category)} className="capitalize">{report.category.replace('_', ' ')}</Badge>
                </TableCell>
                <TableCell>
                    <Button variant="ghost" size="sm" className="w-full justify-start p-0" onClick={() => setIsOpen(!isOpen)}>
                         {isOpen ? <ChevronDown className="mr-2 h-4 w-4" /> : <ChevronRight className="mr-2 h-4 w-4" />}
                        {isOpen ? 'Hide' : 'View'} Report
                    </Button>
                </TableCell>
            </TableRow>
            {isOpen && (
                 <TableRow>
                    <TableCell colSpan={6} className="p-0">
                        <div className="p-4 bg-muted/50 space-y-4">
                            <div>
                                <h4 className="font-semibold mb-2">Report Details</h4>
                                <p className="text-sm">{report.report}</p>
                            </div>
                            <div className="space-y-1">
                                <DetailRow label="Booking ID" value={report.bookingId} />
                                <DetailRow label="Vehicle Number" value={report.vehicleNumber} />
                                <DetailRow label="Driver Mobile" value={report.driverMobile} />
                                <DetailRow label="Trip Date" value={report.tripDate} />
                                <DetailRow label="Payment Number" value={report.paymentNumber} />
                                <DetailRow label="Transaction ID" value={report.transactionId} />
                                <DetailRow label="Payment Date" value={report.paymentDate} />
                            </div>
                        </div>
                    </TableCell>
                </TableRow>
            )}
        </>
    )
}

export default function UserReportsTable({ reports, selectedIds, onSelectedIdsChange }: UserReportsTableProps) {
  const isAllSelected = useMemo(() => {
    const visibleIds = new Set(reports.map(r => r.id!));
    return selectedIds.length > 0 && selectedIds.every(id => visibleIds.has(id));
  }, [reports, selectedIds]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectedIdsChange(reports.map(r => r.id!));
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
        <div className="relative overflow-y-auto min-h-[55vh] max-h-[55vh]">
            <Table>
                <TableHeader className="sticky top-0 z-10">
                    <TableRow className="bg-secondary hover:bg-secondary">
                        <TableHead className="px-4">
                            <Checkbox
                                checked={isAllSelected}
                                onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                aria-label="Select all reports"
                            />
                        </TableHead>
                        <TableHead>Report ID</TableHead>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Details</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {reports.map((report) => (
                       <ReportRow key={report.id!} report={report} isSelected={selectedIds.includes(report.id!)} onSelect={(checked) => handleSelectOne(report.id!, checked)} />
                    ))}
                    {reports.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center h-24">
                                No user reports found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    </div>
  );
}
