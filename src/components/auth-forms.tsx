
"use client"

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { loginUser, registerUser } from "@/lib/api";
import type { User } from "@/lib/types";

interface AuthFormProps {
  type: 'login' | 'register';
}

const loginSchema = z.object({
  username: z.string().min(1, "Username is required."),
  password: z.string().min(1, "Password is required."),
});

const registerSchema = z.object({
    username: z.string()
      .min(3, "Username must be at least 3 characters.")
      .max(20, "Username can be at most 20 characters.")
      .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores."),
    password: z.string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/, "Password must contain at least one letter and one number."),
});

export function AuthForm({ type }: AuthFormProps) {
  const isLogin = type === 'login';
  const schema = isLogin ? loginSchema : registerSchema;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    setIsLoading(true);
    try {
      let loggedInUser: User;
      if (isLogin) {
        const user = await loginUser(values.username, values.password);
        if (!user) {
          throw new Error("Invalid username or password.");
        }
        loggedInUser = user;
        login(user, 'mock-jwt-token');
        toast({
            title: "Login Successful",
            description: "Welcome back!",
        });
      } else {
        const newUser = await registerUser(values.username, values.password);
        loggedInUser = newUser;
        login(newUser, 'mock-jwt-token');
        toast({
            title: "Registration Successful",
            description: "Your account has been created.",
        });
      }
      
      const redirectUrl = searchParams.get('redirect');
      if (redirectUrl) {
          router.replace(redirectUrl);
      } else {
          if (loggedInUser.role === 'admin') {
            router.replace('/dashboard/admin');
          } else {
            router.replace('/');
          }
      }

    } catch (error: any) {
       toast({
            variant: "destructive",
            title: isLogin ? "Authentication Failed" : "Registration Failed",
            description: error.message || "An unexpected error occurred.",
        });
        setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-2xl">{isLogin ? 'Log In' : 'Register'}</CardTitle>
        {isLogin && (
          <CardDescription>
            Log in as 'TechGuru' (admin) or a user like 'CreativeWriter' or 'GamerGeek'. The password for all is 'password123'.
          </CardDescription>
        )}
        {!isLogin && (
          <CardDescription>
            Create an account to start blogging.
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-left">Username</FormLabel>
                  <FormControl>
                    <Input placeholder="your_username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-left">Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
               {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLogin ? 'Log In' : 'Create Account'}
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <Link href={isLogin ? '/register' : '/login'} className="underline">
            {isLogin ? 'Register' : 'Log In'}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
