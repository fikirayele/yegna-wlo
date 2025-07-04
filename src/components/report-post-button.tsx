
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Flag, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { reportPost } from '@/lib/api';
import type { Report } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { cn } from '@/lib/utils';

interface ReportPostButtonProps {
  postId: string;
  postAuthorId: string;
  initialReports: Report[];
  variant?: 'button' | 'icon';
}

const reportReasons = [
    "Hate Speech",
    "Harassment or Bullying",
    "Spam or Scams",
    "Illegal Activities",
    "Graphic Violence",
    "Sexually Explicit Content",
    "Other",
];

export function ReportPostButton({ postId, postAuthorId, initialReports, variant = 'button' }: ReportPostButtonProps) {
  const { user, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasReported, setHasReported] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user && initialReports?.some(r => r.reporterId === user.id)) {
      setHasReported(true);
    }
  }, [user, initialReports]);
  
  if (!isAuthenticated || !user || user.id === postAuthorId) {
    return null;
  }
  
  const handleReport = async () => {
    if (!user || !selectedReason) return;
    setIsSubmitting(true);
    try {
      const result = await reportPost(postId, user.id, selectedReason);
      if (result.success) {
        toast({ title: 'Feedback Received', description: result.message });
        setHasReported(true);
        setIsDialogOpen(false);
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not submit your feedback.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleWrapperClick = (e: React.MouseEvent) => {
    // Prevent the parent Link component from navigating when this button is clicked
    e.preventDefault();
  };

  const dialogContent = (
     <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Report Post</DialogTitle>
          <DialogDescription>
            Please select a reason for reporting this post. Your feedback is important for maintaining a safe community.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            <RadioGroup onValueChange={setSelectedReason} defaultValue={selectedReason || undefined}>
                <div className="space-y-2">
                    {reportReasons.map((reason) => (
                        <div key={reason} className="flex items-center space-x-2">
                            <RadioGroupItem value={reason} id={`reason-${reason.replace(/\s/g, '-')}-${postId}`} />
                            <Label htmlFor={`reason-${reason.replace(/\s/g, '-')}-${postId}`}>{reason}</Label>
                        </div>
                    ))}
                </div>
            </RadioGroup>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="ghost">Cancel</Button>
          </DialogClose>
          <Button 
            type="button" 
            onClick={handleReport} 
            disabled={!selectedReason || isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Submit Report
          </Button>
        </DialogFooter>
      </DialogContent>
  );

  const triggerIcon = (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild disabled={hasReported}>
            <Button
              variant="outline"
              size="icon"
              disabled={hasReported}
              className={cn(
                  hasReported 
                  ? "text-destructive hover:text-destructive cursor-not-allowed border-destructive/50" 
                  : "text-muted-foreground hover:text-destructive hover:border-destructive/50"
              )}
            >
              <Flag className="h-4 w-4" />
              <span className="sr-only">Report Post</span>
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>{hasReported ? 'Reported' : 'Report Post'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  const triggerButton = (
      <DialogTrigger asChild disabled={hasReported}>
        <Button 
          variant="outline" 
          disabled={hasReported}
          className={cn(hasReported ? "border-destructive/50 bg-destructive/10 text-destructive hover:bg-destructive/20 cursor-not-allowed" : "")}
        >
          <Flag className="mr-2 h-4 w-4" />
          {hasReported ? 'Reported' : 'Report Post'}
        </Button>
      </DialogTrigger>
  );


  return (
    <div onClick={handleWrapperClick}>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            {variant === 'icon' ? triggerIcon : triggerButton}
            {!hasReported && dialogContent}
        </Dialog>
    </div>
  );
}
