'use client';

import { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import { format } from 'date-fns';

export default function MaintenanceBanner() {
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    // Only format date on client to avoid hydration mismatch
    setCurrentDate(format(new Date(), 'EEEE, MMMM do, yyyy'));
  }, []);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="mx-4 max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl dark:bg-slate-900 border dark:border-slate-800">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Settings className="h-8 w-8 text-primary animate-[spin_3s_linear_infinite]" />
        </div>
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Under Maintenance
        </h1>
        <p className="mb-6 text-slate-600 dark:text-slate-400">
          We are currently updating our systems to serve you better.
          Please check back later.
        </p>
        
        <div className="rounded-lg bg-orange-50 p-4 dark:bg-orange-950/30">
          <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
            Current Maintenance Date:
          </p>
          <p className="mt-1 text-lg font-semibold text-orange-900 dark:text-orange-200">
            {currentDate || 'Loading...'}
          </p>
        </div>
      </div>
    </div>
  );
}
