"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Upload } from "lucide-react"

import { getUserId } from "@/lib/auth"
import { Header } from "@/components/header"
import { FolderTree } from "@/components/folder-tree"
import { DocumentList } from "@/components/document-list"
import { UploadDialog } from "@/components/upload-dialog"
import { Button } from "@/components/ui/button"
import type { Folder, Document } from "@/lib/types"

export default function DashboardPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)

  const [folders, setFolders] = useState<Folder[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const [openUpload, setOpenUpload] = useState(false)

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
        setFolders([]) // Clear folders on error to prevent stale data
      }
    } catch (error) {
      console.error("Network error fetching folders:", error)
      setFolders([]) // Clear folders on network error
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
        setDocuments([]) // Clear documents on error
      }
    } catch (error) {
      console.error("Network error fetching documents:", error)
      setDocuments([]) // Clear documents on network error
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
        await Promise.all([fetchFolders(uid), fetchDocs(uid, folder)])
        console.log("Data refresh complete.")
      } catch (error) {
        console.error("Error during data refresh (Promise.all):", error)
        // Optionally, show a toast or error message to the user
      }
    },
    [fetchFolders, fetchDocs],
  )

  /* ------------------------------------------------------------------ */
  /* Initial load & folder change                                        */
  /* ------------------------------------------------------------------ */
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

  /* ------------------------------------------------------------------ */
  /* Folder handlers                                                     */
  /* ------------------------------------------------------------------ */
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
        // Consider showing a user-friendly error message here
      }
    } catch (error) {
      console.error("Network error creating folder:", error)
      // Consider showing a user-friendly error message here
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
          setCurrentFolderId(null) // If current folder is deleted, go to root
          console.log("Current folder deleted, setting currentFolderId to null.")
        }
        await refreshAll(userId, currentFolderId) // Always refresh after successful deletion
      } else {
        const errorText = await res.text()
        console.error(`Failed to delete folder ${id}:`, res.status, errorText)
        // Consider showing a user-friendly error message here
      }
    } catch (error) {
      console.error(`Network error deleting folder ${id}:`, error)
      // Consider showing a user-friendly error message here
    }
  }

  /* ------------------------------------------------------------------ */
  /* Document handlers                                                   */
  /* ------------------------------------------------------------------ */
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
        // Consider showing a user-friendly error message here
      }
    } catch (error) {
      console.error(`Network error deleting document ${id}:`, error)
      // Consider showing a user-friendly error message here
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

  /* ------------------------------------------------------------------ */
  /* Render                                                              */
  /* ------------------------------------------------------------------ */
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

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
          }}
          onCreateFolder={createFolder}
          onRenameFolder={renameFolder}
          onDeleteFolder={deleteFolder}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <div className="flex flex-1 flex-col overflow-auto">
          <div className="flex items-center justify-between border-b border-border p-4 bg-background sticky top-0 z-10 shadow-sm">
            <h1 className="text-2xl font-bold text-foreground">
              {currentFolderId ? (folders.find((f) => f.id === currentFolderId)?.name ?? "Unknown") : "All Files"}
            </h1>
            <Button
              onClick={() => setOpenUpload(true)}
              className="bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg transition-shadow"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
          </div>

          <DocumentList
            documents={documents}
            folders={folders}
            currentFolderId={currentFolderId}
            onDeleteDocument={deleteDoc}
            onRenameDocument={renameDoc}
            onMoveDocument={moveDoc}
            onSearch={() => {}}
          />
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
