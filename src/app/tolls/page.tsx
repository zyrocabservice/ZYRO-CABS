
'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import type { TollPlaza } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Ticket } from 'lucide-react';

function TollsContent() {
    const searchParams = useSearchParams();
    const tollsParam = searchParams.get('tolls');
    let tollPlazas: TollPlaza[] = [];
    let parseError = false;

    try {
        if (tollsParam) {
            tollPlazas = JSON.parse(tollsParam);
        }
    } catch (error) {
        console.error("Failed to parse toll data:", error);
        parseError = true;
    }

    if (parseError) {
        return (
            <Alert variant="destructive">
                <Ticket className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    Could not display toll information. The data received was invalid.
                </AlertDescription>
            </Alert>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Toll Plazas on Route</CardTitle>
                <CardDescription>
                    This is an estimated list of toll plazas on your selected route.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Toll Number</TableHead>
                                <TableHead>Toll Place</TableHead>
                                <TableHead>State</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tollPlazas.length > 0 ? (
                                tollPlazas.map((plaza, index) => (
                                    <TableRow key={plaza['Plaza Code'] || index}>
                                        <TableCell>{plaza['Plaza Code']}</TableCell>
                                        <TableCell>{plaza['Plaza Name']}</TableCell>
                                        <TableCell>{plaza['Sate']}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24">
                                        No toll plazas were found for this route.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}

function TollsPageSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-3/4 mt-2" />
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </CardContent>
        </Card>
    )
}

export default function TollsPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
                <Suspense fallback={<TollsPageSkeleton />}>
                    <TollsContent />
                </Suspense>
            </div>
        </div>
    );
}
