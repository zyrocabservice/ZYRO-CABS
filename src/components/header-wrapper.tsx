
'use client';

import { usePathname } from 'next/navigation';
import Header from './header';

export default function HeaderWrapper() {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  if (isAdminPage) {
    return null;
  }

  return (
    <>
      <Header />
    </>
  );
}
