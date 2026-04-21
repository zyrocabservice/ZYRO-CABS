

'use client';

import type { RedirectLinking } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';

// This component is no longer used as the redirect linking system has been simplified.
// It can be removed in a future cleanup.

interface RedirectLinkingsTableProps {
  data: RedirectLinking[];
}

export default function RedirectLinkingsTable({ data }: RedirectLinkingsTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary hover:bg-secondary">
            <TableHead>Page</TableHead>
            <TableHead>Link</TableHead>
            <TableHead className="text-right">Clicks</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data && data.length > 0 ? (
            data.map((item) => (
              <TableRow key={item.id} className="hover:bg-transparent">
                <TableCell className="font-medium">{item.page}</TableCell>
                <TableCell>
                  <Link href={item.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
                    <span className="truncate max-w-xs">{item.link}</span>
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </TableCell>
                <TableCell className="text-right font-mono">{item.clicks}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="text-center h-24">
                No redirect and linking data available.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
