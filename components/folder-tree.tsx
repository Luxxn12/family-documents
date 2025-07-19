"use client"

import { useState } from "react"
import { FolderIcon, FileIcon, Plus, MoreVertical, Trash2, Pencil, XIcon } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
import type { Folder } from "@/lib/types"

interface Props {
  folders: Folder[]
  currentFolderId: string | null
  onSelectFolder: (id: string | null) => void
  onCreateFolder: (name: string, parent: string | null) => void
  onRenameFolder: (id: string, name: string) => void
  onDeleteFolder: (id: string) => void
  isOpen: boolean
  onClose: () => void
}

export function FolderTree({
  folders,
  currentFolderId,
  onSelectFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  isOpen,
  onClose,
}: Props) {
  /* ------------------------------------------------------------------ */
  /* UI state                                                            */
  /* ------------------------------------------------------------------ */
  const [name, setName] = useState("")
  const [openCreate, setOpenCreate] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const [renameName, setRenameName] = useState("")
  const [openRename, setOpenRename] = useState(false)
  const [renameId, setRenameId] = useState<string | null>(null)
  const [isRenaming, setIsRenaming] = useState(false)

  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false)
  const [folderToDelete, setFolderToDelete] = useState<Folder | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  /* ------------------------------------------------------------------ */
  /* Helpers                                                             */
  /* ------------------------------------------------------------------ */
  const handleCreateFolder = async () => {
    if (name.trim()) {
      setIsCreating(true)
      try {
        await onCreateFolder(name.trim(), currentFolderId)
        setName("")
        setOpenCreate(false)
      } finally {
        setIsCreating(false)
      }
    }
  }

  const handleRenameFolder = async () => {
    if (renameId && renameName.trim()) {
      setIsRenaming(true)
      try {
        await onRenameFolder(renameId, renameName.trim())
        setOpenRename(false)
      } finally {
        setIsRenaming(false)
      }
    }
  }

  const handleDeleteFolder = async () => {
    if (folderToDelete) {
      console.log("handleDeleteFolder: Setting isDeleting to true")
      setIsDeleting(true)
      try {
        await onDeleteFolder(folderToDelete.id)
        setFolderToDelete(null)
        setOpenDeleteConfirm(false)
        console.log("handleDeleteFolder: Deletion successful, isDeleting will be reset in finally")
      } catch (error) {
        console.error("handleDeleteFolder: Error during deletion:", error)
      } finally {
        console.log("handleDeleteFolder: Setting isDeleting to false")
        setIsDeleting(false)
      }
    }
  }

  const makeTree = (parentId: string | null) =>
    folders
      .filter((f) => f.parentId === parentId)
      .map((f) => (
        <div key={f.id} className="ml-4 border-l border-border pl-2">
          <div
            className={`group flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 transition-colors duration-200 ${
              currentFolderId === f.id
                ? "bg-primary text-primary-foreground font-medium"
                : "hover:bg-muted text-foreground"
            }`}
            onClick={() => onSelectFolder(f.id)}
          >
            <FolderIcon className="h-4 w-4 text-accent" />
            <span className="flex-1 truncate">{f.name}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-muted-foreground hover:bg-muted"
                  onClick={(e) => e.stopPropagation()}
                  disabled={isRenaming || isDeleting}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover text-popover-foreground border-border">
                <DropdownMenuItem
                  onClick={() => {
                    setRenameId(f.id)
                    setRenameName(f.name)
                    setOpenRename(true)
                  }}
                  disabled={isRenaming || isDeleting}
                  className="hover:bg-muted focus:bg-muted"
                >
                  <Pencil className="mr-2 h-4 w-4" /> Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:bg-destructive/20"
                  onClick={() => {
                    setFolderToDelete(f)
                    setOpenDeleteConfirm(true)
                  }}
                  disabled={isRenaming || isDeleting}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {makeTree(f.id)}
        </div>
      ))

  /* ------------------------------------------------------------------ */
  /* Render                                                              */
  /* ------------------------------------------------------------------ */
  return (
    <div
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-background border-r border-border p-4 flex flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Folders</h2>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setOpenCreate(true)}
            disabled={isCreating || isRenaming || isDeleting}
            className="text-muted-foreground hover:text-primary hover:bg-muted"
          >
            <Plus className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="md:hidden text-muted-foreground hover:text-destructive hover:bg-muted"
            aria-label="Close sidebar"
          >
            <XIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Root / All files */}
      <div
        className={`group flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 transition-colors duration-200 ${
          currentFolderId === null ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted text-foreground"
        }`}
        onClick={() => onSelectFolder(null)}
      >
        <FileIcon className="h-4 w-4 text-accent" />
        <span className="truncate">All Files</span>
      </div>

      <div className="mt-2 flex-1 overflow-y-auto">{makeTree(null)}</div>

      {/* ---------------- Create dialog ---------------- */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="bg-card text-card-foreground border-border">
          <DialogHeader>
            <DialogTitle>New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid items-center gap-2">
              <Label htmlFor="folder-name" className="text-foreground">
                Name
              </Label>
              <Input
                id="folder-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My new folder"
                disabled={isCreating}
                className="bg-input text-foreground border-border focus:ring-ring"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenCreate(false)}
              type="button"
              disabled={isCreating}
              className="border-border text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateFolder}
              disabled={isCreating || !name.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isCreating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------------- Rename dialog ---------------- */}
      <Dialog open={openRename} onOpenChange={setOpenRename}>
        <DialogContent className="bg-card text-card-foreground border-border">
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid items-center gap-2">
              <Label htmlFor="rename-name" className="text-foreground">
                Name
              </Label>
              <Input
                id="rename-name"
                value={renameName}
                onChange={(e) => setRenameName(e.target.value)}
                placeholder="Folder name"
                disabled={isRenaming}
                className="bg-input text-foreground border-border focus:ring-ring"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenRename(false)}
              type="button"
              disabled={isRenaming}
              className="border-border text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRenameFolder}
              disabled={isRenaming || !renameName.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isRenaming ? "Renaming..." : "Rename"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------------- Delete Confirmation Dialog ---------------- */}
      <AlertDialog open={openDeleteConfirm} onOpenChange={setOpenDeleteConfirm}>
        <AlertDialogContent className="bg-card text-card-foreground border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This action cannot be undone. This will permanently delete the folder "{folderToDelete?.name}" and all its
              contents (subfolders and documents).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="border-border text-foreground hover:bg-muted">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteFolder}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
