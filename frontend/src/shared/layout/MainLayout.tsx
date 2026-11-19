import type { ReactNode } from 'react';
import Navbar from '@/shared/components/Navbar';
export function MainLayout({children}:{children:ReactNode}) {
 return <div className="min-h-screen bg-canvas text-ink"><Navbar/><main className="mx-auto max-w-6xl px-5 py-9">{children}</main></div>;
}
