'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bot,
  LayoutDashboard,
  Upload,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/upload', label: 'Upload Document', icon: Upload },
  ];

  return (
    <div className="min-h-screen w-full flex">
      <aside className="w-64 flex-shrink-0 border-r bg-card hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b">
          <Bot className="w-8 h-8 text-primary" />
          <div className='ml-2'>
            <h1 className="text-xl font-bold">SOW Auditor AI</h1>
            <p className="text-xs text-muted-foreground">Document Compliance Analysis</p>
          </div>
        </div>
        <nav className="flex-1 px-4 py-4">
            <span className="px-2 text-xs font-semibold uppercase text-muted-foreground">Navigation</span>
          <ul className="space-y-1 mt-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-foreground transition-all hover:bg-secondary',
                    pathname === item.href ? 'bg-secondary font-semibold' : 'font-medium'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
