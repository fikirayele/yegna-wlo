
import type { Post } from "@/lib/types";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { Video } from "lucide-react";

interface RecommendedPostCardProps {
    post: Post;
}

export function RecommendedPostCard({ post }: RecommendedPostCardProps) {
    return (
        <Link href={`/posts/${post.id}`} className="flex gap-3 group">
            <div className="relative aspect-video w-40 shrink-0 rounded-lg overflow-hidden bg-muted">
                {post.mediaUrl && post.mediaType === 'image' ? (
                    <Image
                        src={post.mediaUrl}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        data-ai-hint={post.mediaHint}
                        sizes="160px"
                    />
                ) : post.mediaType === 'video' ? (
                     <div className="flex items-center justify-center h-full">
                        <Video className="h-8 w-8 text-muted-foreground" />
                    </div>
                ) : null}
            </div>
            <div className="flex flex-col py-1">
                <h3 className="font-semibold text-sm line-clamp-2 leading-tight group-hover:text-primary transition-colors">{post.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{post.author.username}</p>
                <time dateTime={post.createdAt} className="text-xs text-muted-foreground">
                    {format(new Date(post.createdAt), "MMM d, yyyy")}
                </time>
            </div>
        </Link>
    );
}
