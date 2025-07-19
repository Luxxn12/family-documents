"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Upload, Users } from "lucide-react" 

import { getUserId } from "@/lib/auth"
import { Header } from "@/components/header"
import { FolderTree } from "@/components/folder-tree"
import { DocumentList } from "@/components/document-list"
import { UploadDialog } from "@/components/upload-dialog"
import { Button } from "@/components/ui/button"
import { UserManagement } from "@/components/user-management" 
import type { Folder, Document, Role } from "@/lib/types" 

export default function DashboardPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [currentUserRole, setCurrentUserRole] = useState<Role | null>(null) 
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null)

  const [folders, setFolders] = useState<Folder[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const [openUpload, setOpenUpload] = useState(false)
  const [activeTab, setActiveTab] = useState<"documents" | "users">("documents")

  /* ------------------------------------------------------------------ */
  /* Data fetching helpers                                               */
  /* ------------------------------------------------------------------ */
  const fetchFolders = useCallback(async (uid: string) => {
    try {
      const res = await fetch("/api/folders", { headers: { "X-User-Id": uid } })
      if (res.ok) {
        const data = await res.json()
        setFolders(data.folders as Folder[])
      } else {
        console.error("Failed to fetch folders:", res.status, await res.text())
        setFolders([])
      }
    } catch (error) {
      console.error("Network error fetching folders:", error)
      setFolders([])
    }
  }, [])

  const fetchDocs = useCallback(async (uid: string, folder: string | null) => {
    const q = folder ? `?folderId=${folder}` : ""
    try {
      const res = await fetch(`/api/documents${q}`, {
        headers: { "X-User-Id": uid },
      })
      if (res.ok) {
        const data = await res.json()
        setDocuments(data.documents as Document[])
      } else {
        console.error("Failed to fetch documents:", res.status, await res.text())
        setDocuments([])
      }
    } catch (error) {
      console.error("Network error fetching documents:", error)
      setDocuments([])
    }
  }, [])

  const fetchCurrentUserDetails = useCallback(async (uid: string) => {
    try {
      const res = await fetch(`/api/users/${uid}`, {
        headers: { "X-User-Id": uid },
      })
      if (res.ok) {
        const data = await res.json()
        setCurrentUserRole(data.user.role)
        setCurrentUserEmail(data.user.email)
      } else {
        console.error("Failed to fetch current user details:", res.status, await res.text())
        setCurrentUserRole(null)
        setCurrentUserEmail(null)
      }
    } catch (error) {
      console.error("Network error fetching current user details:", error)
      setCurrentUserRole(null)
      setCurrentUserEmail(null)
    }
  }, [])

  const refreshAll = useCallback(
    async (uid: string, folder: string | null) => {
      if (!uid) {
        console.warn("refreshAll called without userId.")
        return
      }
      console.log("Refreshing all data...")
      try {
        await Promise.all([fetchFolders(uid), fetchDocs(uid, folder), fetchCurrentUserDetails(uid)])
        console.log("Data refresh complete.")
      } catch (error) {
        console.error("Error during data refresh (Promise.all):", error)
      }
    },
    [fetchFolders, fetchDocs, fetchCurrentUserDetails],
  )

 
  useEffect(() => {
    const uid = getUserId()
    if (!uid) {
      router.replace("/login")
      return
    }
    setUserId(uid)
    refreshAll(uid, currentFolderId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, currentFolderId])

  const createFolder = async (name: string, parent: string | null) => {
    if (!userId) return
    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": userId,
        },
        body: JSON.stringify({ name, parentId: parent }),
      })
      if (res.ok) {
        await refreshAll(userId, currentFolderId)
      } else {
        console.error("Failed to create folder:", res.status, await res.text())
      }
    } catch (error) {
      console.error("Network error creating folder:", error)
    }
  }

  const renameFolder = async (id: string, name: string) => {
    if (!userId) return
    try {
      const res = await fetch(`/api/folders/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": userId,
        },
        body: JSON.stringify({ name }),
      })
      if (res.ok) {
        await refreshAll(userId, currentFolderId)
      } else {
        console.error("Failed to rename folder:", res.status, await res.text())
      }
    } catch (error) {
      console.error("Network error renaming folder:", error)
    }
  }

  const deleteFolder = async (id: string) => {
    if (!userId) return
    console.log(`Attempting to delete folder ${id}...`)
    try {
      const res = await fetch(`/api/folders/${id}`, {
        method: "DELETE",
        headers: { "X-User-Id": userId },
      })
      if (res.ok) {
        console.log(`Folder ${id} deleted successfully.`)
        if (currentFolderId === id) {
          setCurrentFolderId(null)
          console.log("Current folder deleted, setting currentFolderId to null.")
        }
        await refreshAll(userId, currentFolderId)
      } else {
        const errorText = await res.text()
        console.error(`Failed to delete folder ${id}:`, res.status, errorText)
      }
    } catch (error) {
      console.error(`Network error deleting folder ${id}:`, error)
    }
  }

  const deleteDoc = async (id: string) => {
    if (!userId) return
    console.log(`Attempting to delete document ${id}...`)
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: "DELETE",
        headers: { "X-User-Id": userId },
      })
      if (res.ok) {
        console.log(`Document ${id} deleted successfully.`)
        await refreshAll(userId, currentFolderId)
      } else {
        const errorText = await res.text()
        console.error(`Failed to delete document ${id}:`, res.status, errorText)
      }
    } catch (error) {
      console.error(`Network error deleting document ${id}:`, error)
    }
  }

  const renameDoc = async (id: string, name: string) => {
    if (!userId) return
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": userId,
        },
        body: JSON.stringify({ name }),
      })
      if (res.ok) {
        await refreshAll(userId, currentFolderId)
      } else {
        console.error("Failed to rename document:", res.status, await res.text())
      }
    } catch (error) {
      console.error("Network error renaming document:", error)
    }
  }

  const moveDoc = async (id: string, folderId: string | null) => {
    if (!userId) return
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": userId,
        },
        body: JSON.stringify({ folderId }),
      })
      if (res.ok) {
        await refreshAll(userId, currentFolderId)
      } else {
        console.error("Failed to move document:", res.status, await res.text())
      }
    } catch (error) {
      console.error("Network error moving document:", error)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        userEmail={currentUserEmail}
        userRole={currentUserRole}
      />

      <main className="flex flex-1 overflow-hidden">
        {/* Mobile sidebar backdrop */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setIsSidebarOpen(false)} />
        )}

        <FolderTree
          folders={folders}
          currentFolderId={currentFolderId}
          onSelectFolder={(id) => {
            setCurrentFolderId(id)
            setIsSidebarOpen(false)
            setActiveTab("documents")
          }}
          onCreateFolder={createFolder}
          onRenameFolder={renameFolder}
          onDeleteFolder={deleteFolder}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <div className="flex flex-1 flex-col overflow-auto">
          <div className="flex items-center justify-between border-b border-border p-4 bg-background sticky top-0 z-10 shadow-sm">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-foreground">
                {activeTab === "documents"
                  ? currentFolderId
                    ? (folders.find((f) => f.id === currentFolderId)?.name ?? "Unknown")
                    : "All Files"
                  : "User Management"}
              </h1>
              {currentUserRole === "admin" && (
                <div className="flex gap-2">
                  <Button
                    variant={activeTab === "documents" ? "default" : "ghost"}
                    onClick={() => setActiveTab("documents")}
                    className={
                      activeTab === "documents"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }
                  >
                    Documents
                  </Button>
                  <Button
                    variant={activeTab === "users" ? "default" : "ghost"}
                    onClick={() => setActiveTab("users")}
                    className={
                      activeTab === "users"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Users
                  </Button>
                </div>
              )}
            </div>
            {activeTab === "documents" && (
              <Button
                onClick={() => setOpenUpload(true)}
                className="bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg transition-shadow"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
            )}
          </div>

          {activeTab === "documents" && (
            <DocumentList
              documents={documents}
              folders={folders}
              currentFolderId={currentFolderId}
              onDeleteDocument={deleteDoc}
              onRenameDocument={renameDoc}
              onMoveDocument={moveDoc}
              onSearch={() => {}}
            />
          )}

          {activeTab === "users" && userId && currentUserRole && (
            <UserManagement
              userId={userId}
              currentUserRole={currentUserRole}
              onUserRoleChange={() => refreshAll(userId, currentFolderId)} // Refresh all data after role change
            />
          )}
        </div>
      </main>

      {/* upload dialog */}
      <UploadDialog
        isOpen={openUpload}
        onOpenChange={setOpenUpload}
        onUploadSuccess={() => {
          if (userId) refreshAll(userId, currentFolderId)
        }}
        currentFolderId={currentFolderId}
        userId={userId}
      />
    </div>
  )
}
