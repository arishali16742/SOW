'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, LayoutDashboard, Upload, Settings, PanelLeft } from 'lucide-react';
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
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

export function AppLayout({ children }: { children: React.ReactNode }) {
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
              <DesktopNavItems navItems={navItems} />
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <SidebarInset>
          <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
            <MobileNav navItems={navItems} />
            <div className='flex-1'>
                {/* Header content can go here if needed */}
            </div>
          </header>
          <main className="flex flex-1 flex-col overflow-hidden">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

function DesktopNavItems({ navItems }: { navItems: { href: string, label: string, icon: React.ElementType }[] }) {
    const pathname = usePathname();
    return (
        <>
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
        </>
    )
}


function MobileNav({ navItems }: { navItems: { href: string, label: string, icon: React.ElementType }[] }) {
  const { openMobile, setOpenMobile } = useSidebar();
  const pathname = usePathname();

  return (
    <Sheet open={openMobile} onOpenChange={setOpenMobile}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <PanelLeft />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
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
      </SheetContent>
    </Sheet>
  );
}
