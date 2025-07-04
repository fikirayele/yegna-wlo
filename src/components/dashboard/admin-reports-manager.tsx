
"use client"

import { useState } from "react";
import { deletePost, updateUser, dismissReports, warnPostAsAdmin, strikeUserForPost } from "@/lib/api";
import type { Post, Report, User } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, ShieldBan, Trash2, ShieldCheck, ArrowUpDown, TriangleAlert, ShieldX } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./data-table";

interface AdminReportsManagerProps {
  initialReportedPosts: Post[];
}

const aggregateReports = (reports: Report[]): Record<string, number> => {
    if (!reports || reports.length === 0) return {};
    return reports.reduce((acc, report) => {
        acc[report.reason] = (acc[report.reason] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
};


export function AdminReportsManager({ initialReportedPosts }: AdminReportsManagerProps) {
  const [reportedPosts, setReportedPosts] = useState<Post[]>(() =>
    [...initialReportedPosts].sort((a, b) => (b.reports?.length || 0) - (a.reports?.length || 0))
  );
  const { toast } = useToast();

  const handleDeletePost = async (postId: string) => {
    try {
        const result = await deletePost(postId);
        if (result.success) {
          setReportedPosts(prev => prev.filter((post) => post.id !== postId));
          toast({ title: "Success", description: "The post has been successfully deleted." });
        } else {
          throw new Error("Server rejected delete request.");
        }
    } catch (error: any) {
        toast({ variant: "destructive", title: "Error", description: error.message || "Failed to delete the post." });
    }
  };
  
  const handleBlockUser = async (user: User) => {
    try {
        const updatedUser = await updateUser(user.id, { status: 'blocked' });
        if (!updatedUser) throw new Error("Server rejected update request.");
        toast({ title: "Success", description: `User ${user.username} has been blocked.` });
    } catch (error: any) {
        toast({ variant: "destructive", title: "Error", description: error.message || `Failed to block user ${user.username}.` });
    }
  };
  
  const handleStrikeAndWarn = async (postId: string) => {
    try {
      const result = await strikeUserForPost(postId);
      if (result.success) {
        setReportedPosts(prev => prev.filter((p) => p.id !== postId));
        toast({ title: "Action Taken", description: result.message });
      } else {
        throw new Error(result.message || "Server rejected strike request.");
      }
    } catch (error: any) {
        toast({ variant: "destructive", title: "Error", description: error.message || "Failed to issue a strike for this post." });
    }
  };

  const handleWarnPost = async (postId: string) => {
    try {
      const result = await warnPostAsAdmin(postId);
      if (result.success) {
        setReportedPosts(prev => prev.filter((p) => p.id !== postId));
        toast({ title: "Success", description: "The post has been warned and cleared from the queue." });
      } else {
        throw new Error("Server rejected warn request.");
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to issue a warning for the post." });
    }
  };

  const handleDismissReports = async (postId: string) => {
    try {
      const result = await dismissReports(postId);
      if (result.success) {
        setReportedPosts(prev => prev.filter((post) => post.id !== postId));
        toast({ title: "Success", description: "The reports for this post have been dismissed." });
      } else {
        throw new Error("Server rejected dismiss request.");
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to dismiss reports." });
    }
  };

  const columns: ColumnDef<Post>[] = [
    {
      accessorKey: "title",
      header: "Post Title",
      cell: ({ row }) => (
        <Link href={`/posts/${row.original.id}`} className="hover:underline font-medium max-w-xs truncate block" target="_blank" rel="noopener noreferrer">
          {row.original.title}
        </Link>
      ),
    },
    {
      accessorKey: "author",
      header: "Author",
      cell: ({ row }) => row.original.author.username,
    },
    {
      accessorKey: "reports",
      header: ({ column }) => (
        <div className="flex justify-center">
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Reports
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center">
            <Badge variant="destructive">{row.original.reports.length}</Badge>
        </div>
      ),
      sortingFn: (rowA, rowB) => (rowA.original.reports?.length || 0) - (rowB.original.reports?.length || 0),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const post = row.original;
        const aggregated = aggregateReports(post.reports);
        const sortedReasons = Object.entries(aggregated).sort(([, a], [, b]) => b - a);

        return (
          <div className="text-right space-x-1">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm"><Eye className="mr-2 h-4 w-4" /> View</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Reports for: {post.title}</DialogTitle>
                  <DialogDescription>
                    Aggregated reasons users reported this content, sorted by frequency.
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-60 mt-4 -mr-4 pr-4">
                  <div className="space-y-4">
                    {sortedReasons.map(([reason, count], index) => (
                      <div key={reason}>
                        <div className="flex justify-between items-center">
                            <p className="font-semibold text-sm">{reason}</p>
                            <Badge variant="secondary">{count} {count > 1 ? 'reports' : 'report'}</Badge>
                        </div>
                        {index < sortedReasons.length - 1 && <Separator className="mt-4" />}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-600">
                  <ShieldCheck className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Dismiss Reports?</AlertDialogTitle>
                  <AlertDialogDescription>This will clear all reports from this post, removing it from the queue. This indicates the content does not violate guidelines.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDismissReports(post.id)}>Confirm Dismiss</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-yellow-500 hover:text-yellow-600">
                  <TriangleAlert className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Issue Content Warning?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will mark the post with a public warning for guideline violations and clear it from the report queue. **This action does not issue a strike to the user.** Are you sure?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleWarnPost(post.id)}>Confirm Warn</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-orange-500 hover:text-orange-600">
                  <ShieldX className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Issue Strike & Warning?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will issue a strike to the user and publicly warn the post. If the user reaches the strike limit, their account will be blocked. This action is severe. Are you sure?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleStrikeAndWarn(post.id)}>Confirm Strike</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Post?</AlertDialogTitle>
                  <AlertDialogDescription>This will permanently delete the post. This action cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDeletePost(post.id)}>Confirm Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                  <ShieldBan className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Block User: {post.author.username}?</AlertDialogTitle>
                  <AlertDialogDescription>This will block the user's account, preventing them from logging in. This action can be reversed from the User Management page.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleBlockUser(post.author)}>Confirm Block</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

          </div>
        );
      },
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reported Content Queue</CardTitle>
        <CardDescription>Review posts flagged by the community. Posts are sorted by the highest number of reports first.</CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable 
          columns={columns} 
          data={reportedPosts} 
          searchKey="title"
          searchPlaceholder="Search by post title..."
          noResultsMessage="No reported posts at the moment."
        />
      </CardContent>
    </Card>
  );
}
