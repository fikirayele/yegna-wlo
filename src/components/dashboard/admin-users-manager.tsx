

"use client"

import { useState } from "react"
import type { User, UserRole, UserStatus } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "./data-table";
import type { ColumnDef } from "@tanstack/react-table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { ArrowUpDown, Pencil, Trash2, CheckCircle2, Loader2, ShieldAlert } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { deleteUser, updateUser } from "@/lib/api"
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
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


interface AdminUsersManagerProps {
  initialUsers: User[];
}

export function AdminUsersManager({ initialUsers }: AdminUsersManagerProps) {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [newRole, setNewRole] = useState<UserRole>("user");
    const [newStatus, setNewStatus] = useState<UserStatus>("active");

    const { user: currentUser } = useAuth();
    const { toast } = useToast();

    const handleDeleteUser = async (userId: string) => {
        if (userId === currentUser?.id) {
            toast({ variant: "destructive", title: "Error", description: "You cannot delete your own account." });
            return;
        }

        const result = await deleteUser(userId);
        if (result.success) {
            setUsers(prev => prev.filter(user => user.id !== userId));
            toast({ title: "User Deleted", description: "The user has been successfully deleted." });
        } else {
            toast({ variant: "destructive", title: "Error", description: "Failed to delete user." });
        }
    };
    
    const handleEditOpen = (user: User) => {
        setSelectedUser(user);
        setNewRole(user.role);
        setNewStatus(user.status);
        setIsEditDialogOpen(true);
    };

    const handleUpdateUser = async () => {
        if (!selectedUser) return;
        setIsSubmitting(true);
        const updatedUser = await updateUser(selectedUser.id, { role: newRole, status: newStatus });
        setIsSubmitting(false);

        if (updatedUser) {
            setUsers(prev => prev.map(user => user.id === updatedUser.id ? updatedUser : user));
            toast({ title: "User Updated", description: "User details have been changed successfully." });
            setIsEditDialogOpen(false);
            setSelectedUser(null);
        } else {
            toast({ variant: "destructive", title: "Error", description: "Failed to update user." });
        }
    };

    const columns: ColumnDef<User>[] = [
      {
        accessorKey: "username",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              User
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => {
          const user = row.original
          return (
            <div className="flex items-center gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatarUrl} alt={user.username} />
                <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <div className="font-medium">{user.username}</div>
                <div className="text-sm text-muted-foreground">{user.email}</div>
              </div>
            </div>
          )
        }
      },
      {
        accessorKey: "role",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Role
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const role = row.getValue("role") as UserRole;
          if (role === 'admin') {
            return <Badge className="capitalize bg-purple-600 hover:bg-purple-700">{role}</Badge>
          }
          return <div className="capitalize ml-4">{role}</div>
        }
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Status
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          if (status === 'active') {
            return (
                <Badge variant="outline" className="border-green-500/50 bg-green-500/10 text-green-400 capitalize">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  {status}
                </Badge>
            )
          }
          if (status === 'blocked') {
             return (
                <Badge variant="destructive" className="capitalize">
                  <ShieldAlert className="mr-1 h-3 w-3" />
                  {status}
                </Badge>
            )
          }
          return <Badge variant="secondary" className="capitalize">{status}</Badge>
        }
      },
      {
        accessorKey: "strikes",
        header: ({ column }) => (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Strikes
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
          const strikes = row.original.strikes || 0;
          return (
            <div className="text-center font-medium">
                {strikes > 0 ? (
                    <Badge variant="destructive">{strikes}</Badge>
                ) : (
                    <span className="text-muted-foreground">{strikes}</span>
                )}
            </div>
          )
        }
      },
      {
        id: "actions",
        cell: ({ row }) => {
            const user = row.original;
            if (user.id === currentUser?.id) {
                return (
                    <div className="flex items-center justify-end">
                        <div className="text-sm text-muted-foreground font-medium pr-4">Current User</div>
                    </div>
                )
            }

            return (
                <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEditOpen(user)}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user's account,
                            posts, and comments.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                             className={cn(buttonVariants({ variant: "destructive" }))}
                             onClick={() => handleDeleteUser(user.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                </div>
            )
        },
      },
    ]

  return (
    <>
      <Card>
          <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage all users in the system.</CardDescription>
          </CardHeader>
          <CardContent>
              <DataTable 
                columns={columns} 
                data={users} 
                searchKey="username"
                searchPlaceholder="Search users by name..."
              />
          </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Edit User: {selectedUser?.username}</DialogTitle>
                  <DialogDescription>
                      Change the role and status for this user.
                  </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="role" className="text-right">
                          Role
                      </Label>
                      <Select value={newRole} onValueChange={(value: UserRole) => setNewRole(value)}>
                          <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                      </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="status" className="text-right">
                          Status
                      </Label>
                      <Select value={newStatus} onValueChange={(value: UserStatus) => setNewStatus(value)}>
                          <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="blocked">Blocked</SelectItem>
                          </SelectContent>
                      </Select>
                  </div>
              </div>
              <DialogFooter>
                   <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleUpdateUser} disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </>
  );
}
