'use client';

import { usePathname } from 'next/navigation';
import TopNav from './TopNav';

export default function ConditionalTopNav() {
  const pathname = usePathname();
  
  // Completely hide the TopNav in admin mode for full separation
  if (pathname?.startsWith('/admin')) {
    return null;
  }
  
  return <TopNav />;
}
