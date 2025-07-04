
"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { cn } from "@/lib/utils";

export function PostActions({ initialLikes, postId }: { initialLikes: number, postId: string }) {
    const { isAuthenticated } = useAuth();
    const { toast } = useToast();
    const [likes, setLikes] = useState(initialLikes || 0);
    const [likeStatus, setLikeStatus] = useState<'liked' | 'disliked' | null>(null);

    const handleAction = (action: 'like' | 'dislike') => {
        if (!isAuthenticated) {
            toast({
                variant: 'destructive',
                title: 'Authentication Required',
                description: 'You must be logged in to interact with posts.',
            });
            return;
        }

        if (action === 'like') {
            if (likeStatus === 'liked') {
                setLikes(likes - 1);
                setLikeStatus(null);
            } else {
                setLikes(likeStatus === 'disliked' ? likes + 2 : likes + 1);
                setLikeStatus('liked');
            }
        } else { // dislike
            if (likeStatus === 'disliked') {
                setLikeStatus(null);
            } else {
                if (likeStatus === 'liked') {
                    setLikes(likes - 1);
                }
                setLikeStatus('disliked');
            }
        }
    };

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center rounded-full bg-muted">
                <Button variant="ghost" className="rounded-l-full px-4" onClick={() => handleAction('like')}>
                    <ThumbsUp className={cn('h-5 w-5', likeStatus === 'liked' && 'fill-current text-primary')} />
                    <span className="ml-2 text-sm font-semibold">{likes}</span>
                </Button>
                <div className="h-6 w-px bg-border" />
                <Button variant="ghost" className="rounded-r-full px-4" onClick={() => handleAction('dislike')}>
                    <ThumbsDown className={cn('h-5 w-5', likeStatus === 'disliked' && 'fill-current')} />
                </Button>
            </div>
        </div>
    );
}
