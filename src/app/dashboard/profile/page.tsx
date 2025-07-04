

"use client"

import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Camera, Loader2, Pencil, Rss, Settings, PlusCircle, Sun, UserPlus, Check, LogOut, Moon, Laptop, Users } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useState, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { getPostsByAuthor, updateUserProfile } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { ProfilePostList } from "@/components/profile-post-list"
import type { Post } from "@/lib/types"
import { Separator } from "@/components/ui/separator"
import { useTheme } from "next-themes"
import Link from "next/link"
import { Label } from "@/components/ui/label"

const profileSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters.")
    .max(20, "Username can be at most 20 characters.")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores."),
});


export default function ProfilePage() {
    const { user, isLoading, updateUserContext, accounts, logout, switchAccount } = useAuth()
    const { toast } = useToast()
    const router = useRouter()
    const { setTheme, theme } = useTheme();
    
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoadingPosts, setIsLoadingPosts] = useState(true);

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            username: "",
        },
    });

    useEffect(() => {
        if (user) {
            form.reset({ username: user.username });
            getPostsByAuthor(user.id)
                .then(userPosts => {
                    setPosts(userPosts);
                })
                .finally(() => {
                    setIsLoadingPosts(false);
                });
        }
    }, [user, form, isDialogOpen]);

    if (isLoading || !user) {
        return (
            <div className="space-y-8">
                <div className="flex justify-between items-center mb-8">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-24" />
                </div>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-24 w-24 rounded-full" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-10 w-48 mt-4" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && user) {
            setIsUploading(true);
            const reader = new FileReader();
            reader.onloadend = async () => {
                const dataUri = reader.result as string;
                try {
                    const updatedUser = await updateUserProfile(user.id, { avatarUrl: dataUri });
                    if (updatedUser) {
                        updateUserContext(updatedUser);
                        toast({ title: "Avatar Updated", description: "Your new profile picture has been saved." });
                    }
                } catch (error: any) {
                    toast({ variant: "destructive", title: "Upload Failed", description: error.message });
                } finally {
                    setIsUploading(false);
                }
            };
            reader.readAsDataURL(file);
        }
    };
    
    async function onUsernameSubmit(values: z.infer<typeof profileSchema>) {
        if (!user || user.username === values.username) {
            setIsDialogOpen(false);
            return;
        }
        setIsSubmitting(true);
        try {
            const updatedUser = await updateUserProfile(user.id, { username: values.username });
            if (updatedUser) {
                updateUserContext(updatedUser);
                toast({ title: "Success!", description: "Your username has been updated." });
                setIsDialogOpen(false);
            }
        } catch (error: any) {
             if (error.message.toLowerCase().includes('username already exists')) {
                form.setError("username", {
                    type: "manual",
                    message: "This username is already taken. Please choose another.",
                });
            } else {
                toast({ variant: "destructive", title: "Update Failed", description: error.message });
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="space-y-12">
             <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                </Button>
                <h1 className="text-3xl font-bold font-headline">My Profile</h1>
            </div>
            
            <Card>
                <CardHeader className="flex flex-col items-center p-6 sm:flex-row sm:items-center sm:gap-6">
                    <div className="relative group h-24 w-24 shrink-0 cursor-pointer" onClick={() => !isUploading && fileInputRef.current?.click()}>
                        <Avatar className="h-full w-full">
                            <AvatarImage src={user.avatarUrl} alt={user.username} />
                            <AvatarFallback className="text-3xl">{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            {isUploading ? (
                                <Loader2 className="h-8 w-8 text-white animate-spin" />
                            ) : (
                                <Camera className="h-8 w-8 text-white" />
                            )}
                        </div>
                    </div>
                     <div className="flex-1 text-center sm:text-left">
                        <CardTitle className="text-2xl mt-4 sm:mt-0">{user.username}</CardTitle>
                        <CardDescription>{user.email}</CardDescription>
                    </div>
                     <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline"><Pencil className="mr-2 h-4 w-4" /> Edit Profile</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit your profile</DialogTitle>
                                <DialogDescription>
                                    Make changes to your username here. Click save when you're done.
                                </DialogDescription>
                            </DialogHeader>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onUsernameSubmit)} className="space-y-4 py-4">
                                    <FormField
                                        control={form.control}
                                        name="username"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Username</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Your new username" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <DialogFooter>
                                        <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                        <Button type="submit" disabled={isSubmitting}>
                                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Save Changes
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" disabled={isUploading} />
            </Card>

            <Separator />
            
            <div>
                <div className="flex items-center justify-between gap-3 mb-6">
                     <div className="flex items-center gap-3">
                        <Rss className="h-6 w-6 text-primary" />
                        <h2 className="text-2xl font-bold font-headline">My Posts</h2>
                    </div>
                    <Button asChild>
                        <Link href="/posts/new">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            New Post
                        </Link>
                    </Button>
                </div>
                <ProfilePostList posts={posts} isLoading={isLoadingPosts} />
            </div>

            <Separator />

            <div>
                <div className="flex items-center gap-3 mb-6">
                    <Settings className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl font-bold font-headline">Settings</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Users className="h-5 w-5" />
                                <span>Account Management</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Switch Account</Label>
                                {accounts.map(acc => (
                                    <Button 
                                        key={acc.user.id} 
                                        variant="outline"
                                        className="w-full justify-start h-auto py-2"
                                        onClick={() => switchAccount(acc.user.id)} 
                                        disabled={acc.user.id === user.id}
                                    >
                                        <Avatar className="mr-3 h-8 w-8">
                                            <AvatarImage src={acc.user.avatarUrl} alt={acc.user.username} />
                                            <AvatarFallback>{acc.user.username.charAt(0).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <span className="flex-1 text-left font-medium">{acc.user.username}</span>
                                        {acc.user.id === user.id && (
                                            <Check className="ml-2 h-4 w-4 text-primary" />
                                        )}
                                    </Button>
                                ))}
                            </div>
                            
                            <div className="flex gap-2 pt-2">
                                <Button asChild variant="outline" className="w-full">
                                    <Link href="/login">
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Add Account
                                    </Link>
                                </Button>
                                <Button variant="outline" onClick={logout} className="w-full">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Log Out
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Sun className="h-5 w-5" />
                                <span>Appearance</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Label>Theme</Label>
                             <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <Button variant={theme === 'light' ? 'default' : 'outline'} onClick={() => setTheme('light')}>
                                    <Sun className="mr-2 h-4 w-4" /> Light
                                </Button>
                                <Button variant={theme === 'dark' ? 'default' : 'outline'} onClick={() => setTheme('dark')}>
                                    <Moon className="mr-2 h-4 w-4" /> Dark
                                </Button>
                                <Button variant={theme === 'system' ? 'default' : 'outline'} onClick={() => setTheme('system')}>
                                    <Laptop className="mr-2 h-4 w-4" /> System
                                </Button>
                            </div>
                            <p className="text-sm text-muted-foreground pt-2">
                                Choose how yegnawlo looks to you. Select a theme or sync with your system.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
