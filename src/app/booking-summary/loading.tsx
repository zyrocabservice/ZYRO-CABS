import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function BookingSummaryLoading() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="text-center">
                    <Skeleton className="h-8 w-64 mx-auto" />
                    <Skeleton className="h-4 w-80 mx-auto mt-2" />
                </div>
                <Card>
                    <CardContent className="p-4 md:p-6 grid md:grid-cols-2 gap-8 pt-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center my-2">
                                <div className="flex-1 text-left space-y-2">
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                                <Skeleton className="w-28 h-20 rounded-md" />
                            </div>
                            <Skeleton className="h-10 w-full" />
                            <div className="space-y-4 pt-4">
                                <div className="flex items-start gap-3">
                                    <Skeleton className="w-4 h-4 rounded-full mt-1" />
                                    <div className="w-full space-y-1">
                                        <Skeleton className="h-3 w-16" />
                                        <Skeleton className="h-5 w-full" />
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Skeleton className="w-4 h-4 rounded-full mt-1" />
                                     <div className="w-full space-y-1">
                                        <Skeleton className="h-3 w-12" />
                                        <Skeleton className="h-5 w-full" />
                                    </div>
                                </div>
                            </div>
                            <Skeleton className="h-px w-full" />
                             <div className="space-y-2">
                                <Skeleton className="h-5 w-1/3 mb-2" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Skeleton className="h-6 w-1/2 mx-auto" />
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-full" />
                                <Skeleton className="h-5 w-full" />
                                <Skeleton className="h-px w-full" />
                                <Skeleton className="h-5 w-full" />
                                <Skeleton className="h-5 w-full" />
                                <Skeleton className="h-5 w-full" />
                            </div>
                             <Skeleton className="h-px w-full" />
                             <div className="text-center space-y-2 pt-2">
                                <Skeleton className="h-5 w-1/2 mx-auto" />
                                <Skeleton className="h-10 w-1/3 mx-auto" />
                            </div>
                            <Skeleton className="h-12 w-full" />
                        </div>
                    </CardContent>
                </Card>
                <div className="mt-4 flex flex-col items-center gap-4">
                    <Skeleton className="h-10 w-40" />
                </div>
            </div>
        </div>
    );
}
