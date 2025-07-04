
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function DashboardRedirectPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'admin') {
        router.replace('/dashboard/admin');
      } else {
        router.replace('/');
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
