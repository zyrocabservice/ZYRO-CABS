

'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import type { NavLink } from '@/lib/nav-links';

interface AdminNavProps {
  activeTab: string;
  pendingBookingsCount: number;
  navItems: NavLink[];
}

export default function AdminNav({ activeTab, pendingBookingsCount, navItems }: AdminNavProps) {
  if (!navItems) {
    return null; // or a loading skeleton
  }
  
  return (
    <div>
      <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
        {navItems.map((item) => (
          <Link
            key={item.id}
            href={`/admin?tab=${item.id}`}
            className={cn(
              'whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2',
              activeTab === item.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            )}
          >
            {item.label}
            {item.id === 'bookings' && pendingBookingsCount > 0 && (
                <Badge variant="destructive" className="rounded-full h-5 w-5 p-0 flex items-center justify-center">
                    {pendingBookingsCount}
                </Badge>
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
}
