"use client";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface EditPostButtonProps {
    postAuthorId: string;
    postId: string;
}

export function EditPostButton({ postAuthorId, postId }: EditPostButtonProps) {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated || !user) return null;
  
  const canEdit = user.id === postAuthorId || user.role === 'admin';
  
  if (!canEdit) return null;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button asChild variant="outline" size="icon">
            <Link href={`/posts/${postId}/edit`}>
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit Post</span>
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Edit Post</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
