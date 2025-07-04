
"use client"

import type { Post } from "@/lib/types";
import { Card, CardHeader } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, TriangleAlert } from "lucide-react";
import { CommentCard } from "./comment-card";
import Link from "next/link";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";

interface ProfilePostCardProps {
    post: Post;
}

export function ProfilePostCard({ post }: ProfilePostCardProps) {
    return (
        <Card>
            <Accordion type="single" collapsible>
                <AccordionItem value={post.id} className="border-b-0">
                    <CardHeader className="p-4">
                        <AccordionTrigger className="p-2 hover:bg-muted rounded-md transition-colors">
                            <div className="flex-1 text-left">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-lg">{post.title}</h3>
                                     {post.status === 'warned' && (
                                        <Badge variant="destructive" className="h-5">
                                            <TriangleAlert className="h-3 w-3 mr-1" />
                                            Warned
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Published on {format(new Date(post.createdAt), 'MMMM d, yyyy')}
                                </p>
                            </div>
                            <div className="flex items-center gap-6 mx-4">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Heart className="h-5 w-5" />
                                    <span className="font-medium">{post.likes}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <MessageSquare className="h-5 w-5" />
                                    <span className="font-medium">{post.comments.length}</span>
                                </div>
                            </div>
                        </AccordionTrigger>
                    </CardHeader>
                    <AccordionContent>
                        <div className="px-6 pb-6 space-y-4">
                            <div className="flex gap-2">
                                <Button asChild size="sm">
                                    <Link href={`/posts/${post.id}`}>View Post</Link>
                                </Button>
                                <Button asChild variant="outline" size="sm">
                                    <Link href={`/posts/${post.id}/edit`}>Edit Post</Link>
                                </Button>
                            </div>
                            <Separator />
                            <h4 className="font-semibold text-md">Comments</h4>
                             {post.comments.length > 0 ? (
                                <div className="space-y-4">
                                    {post.comments.map(comment => (
                                        <CommentCard key={comment.id} comment={comment} />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No comments yet.</p>
                            )}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </Card>
    );
}
