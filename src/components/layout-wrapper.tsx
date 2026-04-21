
'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/header';


export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  if (isAdminPage) {
    return (
        <>
            {children}
        </>
    )
  }

  return (
     <>
        <Header />
        <main className="flex-grow">{children}</main>
    </>
  );
}
