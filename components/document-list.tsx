"use client";

import { useState } from "react";
import {
  ImageIcon,
  FileText,
  File,
  Download,
  Trash2,
  Pencil,
  FolderIcon,
  MoreVertical,
  EyeIcon,
} from "lucide-react";
import { format } from "date-fns";
import type { JSX } from "react/jsx-runtime";
import type { Document, Folder } from "@/lib/types";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DocumentViewerModal } from "./document-viewer-modal";

interface Props {
  documents: Document[];
  folders: Folder[];
  currentFolderId: string | null;
  onDeleteDocument: (id: string) => void;
  onRenameDocument: (id: string, name: string) => void;
  onMoveDocument: (id: string, folderId: string | null) => void;
  onSearch: (query: string) => void;
}

export function DocumentList({
  documents,
  folders,
  currentFolderId,
  onDeleteDocument,
  onRenameDocument,
  onMoveDocument,
  onSearch,
}: Props) {
  const router = useRouter();

  const [query, setQuery] = useState("");

  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameName, setRenameName] = useState("");
  const [openRename, setOpenRename] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);

  const [moveId, setMoveId] = useState<string | null>(null);
  const [moveFolder, setMoveFolder] = useState<string | null>(null);
  const [openMove, setOpenMove] = useState(false);
  const [isMoving, setIsMoving] = useState(false);

  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [docToDelete, setDocToDelete] = useState<Document | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [openViewModal, setOpenViewModal] = useState(false); // State for view modal
  const [documentToView, setDocumentToView] = useState<Document | null>(null); // State for document to view

  const iconFor = (type: string) => {
    if (type.startsWith("image/"))
      return <ImageIcon className="h-8 w-8 text-accent" />;
    if (type === "application/pdf")
      return <FileText className="h-8 w-8 text-red-500" />;
    return <File className="h-8 w-8 text-muted-foreground" />;
  };

  const filtered = documents.filter((d) =>
    d.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleRenameDocument = async () => {
    if (renameId && renameName.trim()) {
      setIsRenaming(true);
      try {
        await onRenameDocument(renameId, renameName.trim());
        setOpenRename(false);
      } finally {
        setIsRenaming(false);
      }
    }
  };

  const handleMoveDocument = async () => {
    if (moveId !== null) {
      setIsMoving(true);
      try {
        await onMoveDocument(moveId, moveFolder);
        setOpenMove(false);
      } finally {
        setIsMoving(false);
      }
    }
  };

  const handleDeleteDocument = async () => {
    if (docToDelete) {
      console.log("handleDeleteDocument: Setting isDeleting to true");
      setIsDeleting(true);
      try {
        await onDeleteDocument(docToDelete.id);
        setDocToDelete(null);
        setOpenDeleteConfirm(false);
        console.log(
          "handleDeleteDocument: Deletion successful, isDeleting will be reset in finally"
        );
      } catch (error) {
        console.error("handleDeleteDocument: Error during deletion:", error);
      } finally {
        console.log("handleDeleteDocument: Setting isDeleting to false");
        setIsDeleting(false);
      }
    }
  };

  const handleViewDocument = (doc: Document) => {
    setDocumentToView(doc);
    setOpenViewModal(true);
  };

  const folderOptions = (parent: string | null, indent = ""): JSX.Element[] =>
    folders
      .filter((f) => f.parentId === parent)
      .flatMap((f) => [
        <option key={f.id} value={f.id}>
          {indent}
          {f.name}
        </option>,
        ...folderOptions(f.id, indent + "  "),
      ]);

  return (
    <div className="flex-1 p-4 md:p-6 bg-background text-foreground">
      <Input
        placeholder="Search documents..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onSearch(e.target.value);
        }}
        className="mb-6 max-w-md border-border bg-input text-foreground placeholder:text-muted-foreground shadow-sm focus:ring-ring"
      />

      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-10">
          No documents found in this folder.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((doc) => (
            <div
              key={doc.id}
              className="group relative flex flex-col items-center justify-between rounded-lg border border-border bg-card p-4 shadow-sm hover:shadow-md transition-all duration-200"
              // Removed onClick from here, now handled by dropdown menu
            >
              <div className="flex-shrink-0 mb-3">{iconFor(doc.fileType)}</div>
              <div className="flex-grow w-full text-center">
                <div
                  className="w-full truncate text-sm font-medium text-card-foreground"
                  title={doc.name}
                >
                  {doc.name}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {format(new Date(doc.uploadedAt), "MMM dd, yyyy")}
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-muted-foreground hover:bg-muted"
                    onClick={(e) => e.stopPropagation()} // Prevent card click when opening dropdown
                    disabled={isRenaming || isMoving || isDeleting}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-40 bg-popover text-popover-foreground border-border"
                >
                  {(doc.fileType === "application/pdf" ||
                    doc.fileType.startsWith("image/") ||
                    doc.fileType === "application/msword" ||
                    doc.fileType ===
                      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
                    doc.fileType === "application/vnd.ms-excel" ||
                    doc.fileType ===
                      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
                    doc.fileType === "application/vnd.ms-powerpoint" ||
                    doc.fileType ===
                      "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
                    doc.fileType === "text/plain" ||
                    doc.fileType === "text/csv") && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click
                        handleViewDocument(doc); // Open modal
                      }}
                      className="flex items-center hover:bg-muted focus:bg-muted"
                    >
                      <EyeIcon className="mr-2 h-4 w-4" /> View
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <a
                      href={`/api/files/${doc.id}`}
                      download={doc.originalFileName}
                      className="flex items-center hover:bg-muted focus:bg-muted"
                    >
                      <Download className="mr-2 h-4 w-4" /> Download
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      setRenameId(doc.id);
                      setRenameName(doc.name);
                      setOpenRename(true);
                    }}
                    disabled={isRenaming || isMoving || isDeleting}
                    className="hover:bg-muted focus:bg-muted"
                  >
                    <Pencil className="mr-2 h-4 w-4" /> Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      setMoveId(doc.id);
                      setMoveFolder(doc.folderId);
                      setOpenMove(true);
                    }}
                    disabled={isRenaming || isMoving || isDeleting}
                    className="hover:bg-muted focus:bg-muted"
                  >
                    <FolderIcon className="mr-2 h-4 w-4" /> Move
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:bg-destructive/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDocToDelete(doc);
                      setOpenDeleteConfirm(true);
                    }}
                    disabled={isRenaming || isMoving || isDeleting}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}

      {/* ---------------- rename ---------------- */}
      <Dialog open={openRename} onOpenChange={setOpenRename}>
        <DialogContent className="bg-card text-card-foreground border-border">
          <DialogHeader>
            <DialogTitle>Rename Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Label htmlFor="rename-doc" className="text-foreground">
              Name
            </Label>
            <Input
              id="rename-doc"
              value={renameName}
              onChange={(e) => setRenameName(e.target.value)}
              placeholder="Document name"
              disabled={isRenaming}
              className="bg-input text-foreground border-border focus:ring-ring"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenRename(false)}
              disabled={isRenaming}
              className="border-border text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRenameDocument}
              disabled={isRenaming || !renameName.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isRenaming ? "Renaming..." : "Rename"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------------- move ---------------- */}
      <Dialog open={openMove} onOpenChange={setOpenMove}>
        <DialogContent className="bg-card text-card-foreground border-border">
          <DialogHeader>
            <DialogTitle>Move Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Label htmlFor="move-doc" className="text-foreground">
              Destination Folder
            </Label>
            <select
              id="move-doc"
              className="w-full rounded-md border border-border p-2 bg-input text-foreground focus:ring-ring"
              value={moveFolder ?? ""}
              onChange={(e) =>
                setMoveFolder(e.target.value === "" ? null : e.target.value)
              }
              disabled={isMoving}
            >
              <option value="">Root (no folder)</option>
              {folderOptions(null)}
            </select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenMove(false)}
              disabled={isMoving}
              className="border-border text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              onClick={handleMoveDocument}
              disabled={isMoving}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isMoving ? "Moving..." : "Move"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------------- Delete Confirmation Dialog ---------------- */}
      <AlertDialog open={openDeleteConfirm} onOpenChange={setOpenDeleteConfirm}>
        <AlertDialogContent className="bg-card text-card-foreground border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This action cannot be undone. This will permanently delete the
              document "{docToDelete?.name}" from the server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              className="border-border text-foreground hover:bg-muted"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteDocument}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        isOpen={openViewModal}
        onOpenChange={setOpenViewModal}
        document={documentToView}
      />
    </div>
  );
}
