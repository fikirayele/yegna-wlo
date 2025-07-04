
"use client"

import type { Comment } from '@/lib/types';
import { useState } from 'react';
import { AddCommentForm } from './add-comment-form';
import { CommentCard } from './comment-card';
import { Separator } from './ui/separator';
import { MessageSquare } from 'lucide-react';

interface CommentSectionProps {
  postId: string;
  initialComments: Comment[];
}

export function CommentSection({ postId, initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(() =>
    [...initialComments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  );

  const handleCommentAdded = (newComment: Comment) => {
    setComments(prevComments => [newComment, ...prevComments]);
  }

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2 text-xl font-headline font-bold">
            <MessageSquare className="h-6 w-6 text-primary" />
            <h3>{comments.length} Comments</h3>
        </div>
      </div>
      <AddCommentForm postId={postId} onCommentAdded={handleCommentAdded} />
      <Separator className="my-8" />
      <div className="space-y-6">
        {comments.map(comment => (
          <CommentCard key={comment.id} comment={comment} />
        ))}
        {comments.length === 0 && (
          <p className="text-muted-foreground text-center py-4">Be the first to comment.</p>
        )}
      </div>
    </section>
  );
}
