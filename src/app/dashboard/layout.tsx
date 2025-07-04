"use client"

import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import React, { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LayoutGrid, LogOut, Menu, User as UserIcon } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


// NOTE: This component is duplicated from header.tsx due to file constraints.
// In a real-world scenario, this would be in its own shared file.
function UserMenu() {
    const { user, logout } = useAuth();

    if (!user) return null;

    const handleLogout = () => {
        logout();
    }
    
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatarUrl} alt={user.username} />
                        <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.username}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile">
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();


  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?redirect=${pathname}`);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  if (isLoading || !isAuthenticated) {
    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <aside className="hidden border-r bg-background md:block">
                <div className="flex h-full flex-col gap-2">
                    <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                        <Skeleton className="h-6 w-32" />
                    </div>
                    <div className="flex-1 py-4">
                        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-2">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </nav>
                    </div>
                </div>
            </aside>
            <main className="flex flex-1 flex-col p-4 lg:p-6">
                <Skeleton className="h-full w-full" />
            </main>
        </div>
    );
  }

  if (pathname.startsWith('/dashboard/admin') && user?.role !== 'admin') {
      return (
        <div className="flex h-screen items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p className="text-muted-foreground">You do not have permission to view this page.</p>
                <Button onClick={() => router.push('/')} className="mt-4">Go to Homepage</Button>
            </div>
        </div>
      )
  }

  // Render profile page without the sidebar for a cleaner look
  if (pathname.startsWith('/dashboard/profile')) {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 dashboard-layout">{children}</div>
    )
  }

  return (
      <div className="grid h-full w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] dashboard-layout">
        <aside className="hidden border-r bg-background md:block">
          <div className="flex h-full flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
              <Link href="/" className="flex items-center gap-2 font-bold text-primary">
                <LayoutGrid className="h-6 w-6" />
                <span className="">yegnawlo</span>
              </Link>
            </div>
            <div className="flex-1">
              <DashboardNav />
            </div>
          </div>
        </aside>
        <div className="flex h-full flex-col overflow-hidden">
          <header className="flex h-14 shrink-0 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 md:hidden"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col p-0">
                  <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                    <Link href="/" className="flex items-center gap-2 font-bold text-primary">
                        <LayoutGrid className="h-6 w-6" />
                        <span className="">yegnawlo</span>
                    </Link>
                  </div>
                  <nav className="grid gap-2 text-lg font-medium p-4">
                    <DashboardNav />
                  </nav>
              </SheetContent>
            </Sheet>

            <div className="w-full flex-1" />

            <UserMenu />
          </header>
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <div className="flex flex-col gap-4 lg:gap-6">
              {children}
            </div>
          </main>
        </div>
      </div>
  );
}
