"use client";

import type { Comment } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { format } from "date-fns";

interface CommentCardProps {
    comment: Comment;
}

export function CommentCard({ comment }: CommentCardProps) {
    return (
        <div className="flex items-start space-x-4">
            <Avatar>
                <AvatarImage src={comment.author.avatarUrl} alt={comment.author.username} />
                <AvatarFallback>{comment.author.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <div className="flex items-center space-x-2">
                    <span className="font-semibold">{comment.author.username}</span>
                    <time dateTime={comment.createdAt} className="text-xs text-muted-foreground">
                        {format(new Date(comment.createdAt), 'MMM d, yyyy')}
                    </time>
                </div>
                <p className="text-foreground/90 mt-1">{comment.content}</p>
            </div>
        </div>
    )
}
