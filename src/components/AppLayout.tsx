
'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, LayoutDashboard, Upload } from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/upload', label: 'Upload Document', icon: Upload },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <Bot className="w-8 h-8 text-primary" />
              <div className="flex flex-col">
                <h1 className="text-xl font-bold">SOWise</h1>
                <p className="text-xs text-muted-foreground">
                  SOW Auditor AI
                </p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <SidebarInset>
          <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
            <SidebarTrigger />
            <div className='flex-1'>
                {/* Header content can go here if needed */}
            </div>
          </header>
          <main className="flex flex-1 flex-col overflow-hidden">
            {children}
          </main>
        </SidebarInset>
      </div>
      <div className="md:hidden">
        {/* This is a bit of a hack to ensure the mobile sheet content has access to the nav items */}
        {/* In a real app, this would be handled by a more robust state management solution */}
        <div className="hidden">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </SidebarProvider>
  );
}
