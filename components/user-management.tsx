"use client"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Role, User } from "@/lib/types"
import { format } from "date-fns"
import { Loader2, MoreVertical, Trash2 } from "lucide-react"; // Import Trash2 icon
import { useCallback, useEffect, useState } from "react"

interface UserManagementProps {
  userId: string
  currentUserRole: Role
  onUserRoleChange: () => void // Callback to refresh user list in parent
}

export function UserManagement({ userId, currentUserRole, onUserRoleChange }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUpdatingRole, setIsUpdatingRole] = useState<string | null>(null) // User ID being updated
  const [isDeletingUser, setIsDeletingUser] = useState<string | null>(null) // User ID being deleted

  const [openConfirmRoleDialog, setOpenConfirmRoleDialog] = useState(false)
  const [userToChangeRole, setUserToChangeRole] = useState<{ user: User; newRole: Role } | null>(null)

  const [openDeleteConfirmDialog, setOpenDeleteConfirmDialog] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/users", {
        headers: { "X-User-Id": userId },
      })
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
      } else {
        const errorData = await res.json()
        setError(errorData.message || "Failed to fetch users.")
      }
    } catch (err: any) {
      setError("Network error fetching users: " + err.message)
      console.error("Fetch users error:", err)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (currentUserRole === "admin") {
      fetchUsers()
    }
  }, [currentUserRole, fetchUsers])

  const handleChangeRole = async (user: User, newRole: Role) => {
    if (currentUserRole !== "admin") {
      setError("You do not have permission to change user roles.")
      return
    }

    // Set user to change and open confirmation dialog
    setUserToChangeRole({ user, newRole })
    setOpenConfirmRoleDialog(true)
  }

  const confirmRoleChange = async () => {
    if (!userToChangeRole) return

    const { user, newRole } = userToChangeRole
    setIsUpdatingRole(user.id)
    setError(null)

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": userId,
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (res.ok) {
        await fetchUsers() // Refresh the list
        onUserRoleChange() // Notify parent if needed
      } else {
        const errorData = await res.json()
        setError(errorData.message || "Failed to update user role.")
      }
    } catch (err: any) {
      setError("Network error updating user role: " + err.message)
      console.error("Update user role error:", err)
    } finally {
      setIsUpdatingRole(null)
      setOpenConfirmRoleDialog(false)
      setUserToChangeRole(null)
    }
  }

  const handleDeleteUser = async (user: User) => {
    if (currentUserRole !== "admin") {
      setError("You do not have permission to delete users.")
      return
    }
    setUserToDelete(user)
    setOpenDeleteConfirmDialog(true)
  }

  const confirmDeleteUser = async () => {
    if (!userToDelete) return

    setIsDeletingUser(userToDelete.id)
    setError(null)

    try {
      const res = await fetch(`/api/users/${userToDelete.id}`, {
        method: "DELETE",
        headers: {
          "X-User-Id": userId,
        },
      })

      if (res.ok) {
        await fetchUsers() // Refresh the list
      } else {
        const errorData = await res.json()
        setError(errorData.message || "Failed to delete user.")
      }
    } catch (err: any) {
      setError("Network error deleting user: " + err.message)
      console.error("Delete user error:", err)
    } finally {
      setIsDeletingUser(null)
      setOpenDeleteConfirmDialog(false)
      setUserToDelete(null)
    }
  }

  if (currentUserRole !== "admin") {
    return (
      <div className="p-6 text-center text-muted-foreground">You do not have permission to view user management.</div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <span className="ml-2 text-muted-foreground">Loading users...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-center text-destructive">
        Error: {error}
        <Button variant="outline" onClick={fetchUsers} className="ml-4 bg-transparent">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 bg-background text-foreground">
      <h2 className="text-xl font-bold mb-4">User Management</h2>
      {users.length === 0 ? (
        <p className="text-center text-muted-foreground py-10">No users found.</p>
      ) : (
        <div className="rounded-md border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted hover:bg-muted">
                <TableHead className="w-[200px] text-muted-foreground">Email</TableHead>
                <TableHead className="text-muted-foreground">Role</TableHead>
                <TableHead className="text-muted-foreground">Created At</TableHead>
                <TableHead className="text-right text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        user.role === "admin" ? "bg-accent/20 text-accent" : "bg-secondary/20 text-secondary-foreground"
                      }`}
                    >
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(user.created_at), "MMM dd, yyyy HH:mm")}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:bg-muted"
                          disabled={isUpdatingRole === user.id || isDeletingUser === user.id || user.id === userId} // Disable for self
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-40 bg-popover text-popover-foreground border-border"
                      >
                        {user.role === "member" && (
                          <DropdownMenuItem
                            onClick={() => handleChangeRole(user, "admin")}
                            disabled={isUpdatingRole === user.id || user.id === userId}
                            className="hover:bg-muted focus:bg-muted"
                          >
                            {isUpdatingRole === user.id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              "Make Admin"
                            )}
                          </DropdownMenuItem>
                        )}
                        {user.role === "admin" && (
                          <DropdownMenuItem
                            onClick={() => handleChangeRole(user, "member")}
                            disabled={isUpdatingRole === user.id || user.id === userId}
                            className="hover:bg-muted focus:bg-muted"
                          >
                            {isUpdatingRole === user.id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              "Make Member"
                            )}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-destructive focus:bg-destructive/20"
                          onClick={() => handleDeleteUser(user)}
                          disabled={isDeletingUser === user.id || user.id === userId} // Disable for self
                        >
                          {isDeletingUser === user.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="mr-2 h-4 w-4" />
                          )}{" "}
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Confirmation Dialog for Role Change */}
      <AlertDialog open={openConfirmRoleDialog} onOpenChange={setOpenConfirmRoleDialog}>
        <AlertDialogContent className="bg-card text-card-foreground border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Confirm Role Change</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to change the role of{" "}
              <span className="font-semibold">{userToChangeRole?.user.email}</span> to{" "}
              <span className="font-semibold">{userToChangeRole?.newRole}</span>?
              {userToChangeRole?.user.id === userId && userToChangeRole?.newRole === "member" && (
                <p className="text-destructive mt-2">
                  Warning: You are attempting to demote yourself. Ensure there is at least one other admin.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!isUpdatingRole} className="border-border text-foreground hover:bg-muted">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={confirmRoleChange}
              disabled={!!isUpdatingRole}
            >
              {!!isUpdatingRole ? "Updating..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation Dialog for User Deletion */}
      <AlertDialog open={openDeleteConfirmDialog} onOpenChange={setOpenDeleteConfirmDialog}>
        <AlertDialogContent className="bg-card text-card-foreground border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This action cannot be undone. This will permanently delete the user{" "}
              <span className="font-semibold">{userToDelete?.email}</span> and all their associated documents and
              folders.
              {userToDelete?.role === "admin" && (
                <p className="text-destructive mt-2">
                  Warning: You are attempting to delete an admin user. Ensure there is at least one other admin
                  remaining.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!isDeletingUser} className="border-border text-foreground hover:bg-muted">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDeleteUser}
              disabled={!!isDeletingUser}
            >
              {!!isDeletingUser ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
