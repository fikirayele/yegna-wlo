
"use client"

import { AuthForm } from "@/components/auth-forms";
import { Suspense } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function AuthFormSkeleton() {
    return (
        <Card className="w-full max-w-sm">
            <CardHeader className="text-center space-y-2">
                <Skeleton className="h-7 w-24 mx-auto" />
                <Skeleton className="h-4 w-full max-w-xs mx-auto" />
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-10 w-full mt-4" />
                <div className="mt-4 text-center">
                    <Skeleton className="h-4 w-48 mx-auto" />
                </div>
            </CardContent>
        </Card>
    )
}

export default function RegisterPage() {
    return (
        <div className="flex flex-1 items-center justify-center">
            <Suspense fallback={<AuthFormSkeleton />}>
                <AuthForm type="register" />
            </Suspense>
        </div>
    );
}
