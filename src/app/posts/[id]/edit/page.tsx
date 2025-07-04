

"use client"

import { useAuth } from "@/hooks/use-auth";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPost, updatePost } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UploadCloud, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import type { Post } from "@/lib/types";

const postSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters.").max(100, "Title is too long."),
  content: z.string().min(20, "Content must be at least 20 characters."),
});

function EditPostLoading() {
    return (
        <div className="max-w-5xl mx-auto">
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-48 w-full" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                </CardContent>
            </Card>
        </div>
    );
}

export default function EditPostPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const { toast } = useToast();
  
  const [post, setPost] = useState<Post | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaDataUri, setMediaDataUri] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [mediaChanged, setMediaChanged] = useState(false);

  const form = useForm<z.infer<typeof postSchema>>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isAuthenticated) {
      router.replace(`/login?redirect=/posts/${postId}/edit`);
      return;
    }

    async function fetchPost() {
      try {
        const fetchedPost = await getPost(postId);
        if (!fetchedPost) {
          toast({ variant: "destructive", title: "Error", description: "Post not found." });
          router.replace('/');
          return;
        }

        const canEdit = user?.id === fetchedPost.author.id || user?.role === 'admin';
        if (!canEdit) {
            toast({ variant: "destructive", title: "Access Denied", description: "You are not authorized to edit this post." });
            router.replace(`/posts/${postId}`);
            return;
        }
        
        setPost(fetchedPost);
        form.reset({ title: fetchedPost.title, content: fetchedPost.content });
        if (fetchedPost.mediaUrl) {
            setMediaDataUri(fetchedPost.mediaUrl);
            setMediaType(fetchedPost.mediaType || null);
        }
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to load post data." });
        router.replace('/');
      } finally {
        setIsPageLoading(false);
      }
    }

    fetchPost();
  }, [postId, isAuthLoading, isAuthenticated, user, router, toast, form]);


  const handleMediaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setMediaChanged(true);
      if (file.type.startsWith('image/')) {
        setMediaType('image');
      } else if (file.type.startsWith('video/')) {
        setMediaType('video');
      } else {
        toast({ variant: "destructive", title: "Invalid File Type", description: "Please upload an image or video file." });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaDataUri(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleRemoveMedia = () => {
      setMediaChanged(true);
      setMediaDataUri(null);
      setMediaType(null);
  }

  async function onSubmit(values: z.infer<typeof postSchema>) {
    if (!user || !post) return;
    setIsSubmitting(true);

    let finalMediaUrl: string | null | undefined;
    let finalMediaType: 'image' | 'video' | null | undefined;

    if (mediaChanged) {
        finalMediaUrl = mediaDataUri; 
        finalMediaType = mediaType;
    } else {
        finalMediaUrl = undefined;
        finalMediaType = undefined;
    }

    try {
      const updatedPost = await updatePost(post.id, {
          title: values.title,
          content: values.content,
          mediaUrl: finalMediaUrl,
          mediaType: finalMediaType,
      });

      if (updatedPost) {
          toast({ title: "Success!", description: "Your post has been updated." });
          router.push(`/posts/${post.id}`);
          router.refresh();
      } else {
          throw new Error("Update failed on the server.");
      }

    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update post." });
      setIsSubmitting(false);
    }
  }
  
  if (isAuthLoading || isPageLoading) {
    return <EditPostLoading />;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Edit Post</CardTitle>
          <CardDescription>Make your changes and save the post.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Your amazing post title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormItem>
                <FormLabel>Featured Media</FormLabel>
                <FormControl>
                  <div className="relative">
                    <label htmlFor="media-upload" className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/50 transition-colors">
                        <Input
                        id="media-upload"
                        type="file"
                        className="hidden"
                        accept="image/*,video/*"
                        onChange={handleMediaChange}
                        disabled={isSubmitting}
                        />
                        {mediaDataUri && mediaType === 'image' ? (
                          <Image
                              src={mediaDataUri}
                              alt="Image preview"
                              fill
                              className="object-cover rounded-lg"
                          />
                        ) : mediaDataUri && mediaType === 'video' ? (
                          <video
                            src={mediaDataUri}
                            className="object-cover rounded-lg h-full w-full"
                            autoPlay
                            loop
                            muted
                          />
                        ) : (
                          <div className="text-center p-4">
                              <UploadCloud className="w-12 h-12 mx-auto text-muted-foreground" />
                              <p className="mt-4 text-sm text-muted-foreground">
                              <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Image (PNG, JPG) or Video (MP4)
                              </p>
                          </div>
                        )}
                    </label>
                    {mediaDataUri && (
                        <Button 
                            variant="destructive" 
                            size="icon" 
                            className="absolute top-2 right-2 rounded-full h-8 w-8 z-10"
                            onClick={handleRemoveMedia}
                            type="button"
                            disabled={isSubmitting}
                        >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Remove media</span>
                        </Button>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
              
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Write your story here..." {...field} rows={10} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
                <Button variant="outline" onClick={() => router.back()} disabled={isSubmitting} type="button">
                    Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
