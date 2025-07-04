

"use client"

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createPost } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UploadCloud, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

const postSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters.").max(100, "Title is too long."),
  content: z.string().min(20, "Content must be at least 20 characters."),
});

export default function NewPostPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaDataUri, setMediaDataUri] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login?redirect=/posts/new');
    }
  }, [isLoading, isAuthenticated, router]);

  const form = useForm<z.infer<typeof postSchema>>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });
  
  const handleMediaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
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
    setMediaDataUri(null);
    setMediaType(null);
    // Also reset the file input
    const input = document.getElementById('media-upload') as HTMLInputElement;
    if (input) {
      input.value = '';
    }
  };

  async function onSubmit(values: z.infer<typeof postSchema>) {
    if (!user) return;
    setIsSubmitting(true);
    try {
      await createPost(
        values.title, 
        values.content, 
        user, 
        mediaDataUri ?? undefined,
        mediaType ?? undefined
      );
      toast({ title: "Success!", description: "Your new post has been published." });
      router.push(`/`);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to publish post." });
    } finally {
        setIsSubmitting(false);
    }
  }
  
  if (isLoading || !isAuthenticated) {
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

  return (
    <div className="max-w-5xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Create a New Post</CardTitle>
          <CardDescription>Share your thoughts with the world.</CardDescription>
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
                <FormLabel>Featured Media (Optional)</FormLabel>
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Publish Post
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
