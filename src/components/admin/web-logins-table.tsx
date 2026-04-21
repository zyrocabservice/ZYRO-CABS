
'use client';

import type { WebLogin } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { LogIn, Clock, Monitor, Smartphone, Tablet } from 'lucide-react';

interface WebLoginsTableProps {
  logins: WebLogin[];
}

interface ConsolidatedLogin {
    userId: string;
    photoUrl?: string;
    loginCount: number;
    lastLogin: Date;
    allLoginIds: string[];
    deviceType?: 'Desktop' | 'Mobile' | 'Tablet';
    deviceName?: string;
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

const getDeviceIcon = (deviceType: ConsolidatedLogin['deviceType']) => {
    switch (deviceType) {
        case 'Desktop': return Monitor;
        case 'Mobile': return Smartphone;
        case 'Tablet': return Tablet;
        default: return Monitor;
    }
}


export default function WebLoginsTable({ logins }: WebLoginsTableProps) {
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  const consolidatedLogins = useMemo(() => {
    const userMap = new Map<string, ConsolidatedLogin>();
    logins.forEach(login => {
        const key = login.userId || 'Unknown User'; // Group by name
        const existing = userMap.get(key);

        if (existing) {
            existing.loginCount += 1;
            if (login.timestamp > existing.lastLogin) {
                existing.lastLogin = login.timestamp;
                existing.deviceType = login.deviceType;
                existing.deviceName = login.deviceName;
                if (login.photoUrl) {
                    existing.photoUrl = login.photoUrl; // Update photo if a newer login has one
                }
            }
            existing.allLoginIds.push(login.id);
        } else {
            userMap.set(key, {
                userId: key,
                photoUrl: login.photoUrl,
                loginCount: 1,
                lastLogin: login.timestamp,
                allLoginIds: [login.id],
                deviceType: login.deviceType,
                deviceName: login.deviceName,
            });
        }
    });
    return Array.from(userMap.values()).sort((a,b) => b.lastLogin.getTime() - a.lastLogin.getTime());
  }, [logins]);

  return (
    <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {consolidatedLogins.map((user) => {
                const DeviceIcon = getDeviceIcon(user.deviceType);
                return (
                    <Card key={user.userId} className="relative transition-all">
                        <CardHeader className="flex-row items-center gap-4 space-y-0">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={user.photoUrl} alt={user.userId} />
                                <AvatarFallback>{getInitials(user.userId)}</AvatarFallback>
                            </Avatar>
                            <CardTitle>{user.userId}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <DetailRow icon={Clock} label="Last Login" value={format(user.lastLogin, 'PPpp')} />
                            <DetailRow icon={DeviceIcon} label="Device" value={user.deviceType} />
                            <div className="pt-2">
                               <Badge variant="secondary" className="flex items-center gap-2 w-fit">
                                    <LogIn className="w-4 h-4" />
                                    {user.loginCount} {user.loginCount === 1 ? 'Login' : 'Logins'}
                                 </Badge>
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
        {consolidatedLogins.length === 0 && (
            <div className="text-center py-16 border-dashed border-2 rounded-lg">
                <LogIn className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No Login Data</h3>
                <p className="mt-1 text-sm text-muted-foreground">User login activity will appear here.</p>
            </div>
        )}
    </div>
  );
}

    
