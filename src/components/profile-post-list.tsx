
"use client"

import type { Post } from "@/lib/types";
import { Skeleton } from "./ui/skeleton";
import { ProfilePostCard } from "./profile-post-card";

interface ProfilePostListProps {
    posts: Post[];
    isLoading: boolean;
}

function PostListSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
        </div>
    )
}

export function ProfilePostList({ posts, isLoading }: ProfilePostListProps) {
    if (isLoading) {
        return <PostListSkeleton />;
    }

    if (posts.length === 0) {
        return (
            <div className="text-center py-10 border-2 border-dashed rounded-lg">
                <h3 className="text-xl font-semibold">No Posts Yet</h3>
                <p className="text-muted-foreground mt-2">You haven't published any posts. Why not create one?</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {posts.map(post => (
                <ProfilePostCard key={post.id} post={post} />
            ))}
        </div>
    );
}
