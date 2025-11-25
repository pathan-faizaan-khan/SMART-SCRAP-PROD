'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function ConditionalFooter() {
  const pathname = usePathname();
  
  // Don't show footer on dashboard pages
  const isDashboard = pathname?.startsWith('/dashboard');
  
  if (isDashboard) {
    return null;
  }
  
  return <Footer />;
}
