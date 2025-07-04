
import type { Post } from "@/lib/types";
import { RecommendedPostCard } from "./recommended-post-card";

interface RecommendedPostListProps {
  posts: Post[];
  currentPostId: string;
}

export function RecommendedPostList({ posts, currentPostId }: RecommendedPostListProps) {
    const recommendedPosts = posts.filter(p => p.id !== currentPostId);

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-bold font-headline">More Posts</h2>
            {recommendedPosts.map(post => (
                <RecommendedPostCard key={post.id} post={post} />
            ))}
        </div>
    )
}
