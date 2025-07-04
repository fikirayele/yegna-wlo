"use client"

import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "./ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { Textarea } from "./ui/textarea";
import { createComment } from "@/lib/api";
import type { Comment } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useState } from "react";
import { Loader2, Smile } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useTheme } from "next-themes";
import type { EmojiClickData } from "emoji-picker-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

interface AddCommentFormProps {
    postId: string;
    onCommentAdded: (comment: Comment) => void;
}

const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty.").max(1000, "Comment is too long."),
});

export function AddCommentForm({ postId, onCommentAdded }: AddCommentFormProps) {
  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { theme } = useTheme();
  const router = useRouter();

  const form = useForm<z.infer<typeof commentSchema>>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: "",
    },
  });

  async function onSubmit(values: z.infer<typeof commentSchema>) {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const newComment = await createComment(postId, values.content, user);
      onCommentAdded(newComment);
      form.reset();
      toast({ title: "Success", description: "Your comment has been posted." });
      router.push('/');
      router.refresh();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to post comment." });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isAuthLoading) {
    return <Skeleton className="h-32 w-full" />;
  }
  
  if (!isAuthenticated) {
    return (
      <div className="text-center text-muted-foreground p-4 border rounded-lg">
        <Link href="/login" className="text-primary underline">Log in</Link> to post a comment.
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative">
                  <Textarea 
                    placeholder="Write a comment..." 
                    {...field}
                    rows={3}
                    className="pr-12"
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full"
                        type="button"
                      >
                        <Smile className="h-5 w-5 text-muted-foreground" />
                        <span className="sr-only">Add emoji</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                       <EmojiPicker
                          onEmojiClick={(emojiData: EmojiClickData) => {
                            field.onChange(field.value + emojiData.emoji);
                          }}
                          theme={theme === 'dark' ? 'dark' : 'light'}
                          lazyLoadEmojis
                        />
                    </PopoverContent>
                  </Popover>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Post Comment
        </Button>
      </form>
    </Form>
  );
}
