
"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Users, LayoutDashboard, ShieldAlert, Home } from "lucide-react";

export function DashboardNav() {
  const pathname = usePathname();

  const baseClasses = "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary";
  const activeClasses = "bg-accent text-primary font-semibold";

  const getLinkClasses = (href: string, exact: boolean = false) => {
    const isActive = exact ? pathname === href : pathname.startsWith(href);
    return cn(baseClasses, isActive && activeClasses);
  }
  
  return (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
        <Link href="/dashboard/admin" className={getLinkClasses("/dashboard/admin", true)}>
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
        </Link>
        <Link href="/dashboard/admin/reports" className={getLinkClasses("/dashboard/admin/reports")}>
            <ShieldAlert className="h-4 w-4" />
            Reported Content
        </Link>
        <Link href="/dashboard/admin/users" className={getLinkClasses("/dashboard/admin/users")}>
            <Users className="h-4 w-4" />
            User Management
        </Link>
        <Link href="/" className={getLinkClasses("/", true)}>
            <Home className="h-4 w-4" />
            Latest Posts
        </Link>
    </nav>
  )
}
