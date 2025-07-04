"use client";

import Link from 'next/link';
import type { Post } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { format } from 'date-fns';
import { Video, Flag } from 'lucide-react';
import Image from 'next/image';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Link href={`/posts/${post.id}`} className="flex">
      <Card className="h-full w-full flex flex-col transition-all hover:shadow-lg hover:-translate-y-1 overflow-hidden">
        <div className="relative w-full aspect-video bg-muted">
          {post.mediaUrl && post.mediaType === 'image' ? (
              <Image
                  src={post.mediaUrl}
                  alt={post.title}
                  fill
                  className="object-cover"
                  data-ai-hint={post.mediaHint}
              />
          ) : post.mediaType === 'video' ? (
             <div className="flex items-center justify-center h-full">
                <Video className="h-16 w-16 text-muted-foreground" />
            </div>
          ) : null}
        </div>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="font-headline text-2xl line-clamp-2">{post.title}</CardTitle>
            {post.reports && post.reports.length > 0 && (
              <Flag className="h-5 w-5 text-destructive flex-shrink-0 mt-1" />
            )}
          </div>
          <CardDescription>
            <div className="flex items-center text-sm text-muted-foreground mt-2">
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage src={post.author.avatarUrl} alt={post.author.username} />
                <AvatarFallback>{post.author.username.charAt(0)}</AvatarFallback>
              </Avatar>
              <span>{post.author.username}</span>
              <span className="mx-2">•</span>
              <time dateTime={post.createdAt}>{format(new Date(post.createdAt), 'MMM d, yyyy')}</time>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-muted-foreground line-clamp-3">
            {post.content}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
