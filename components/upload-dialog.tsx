"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UploadIcon } from "lucide-react"

interface UploadDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onUploadSuccess: () => void
  currentFolderId: string | null
  userId: string | null // Add userId prop
}

// Define allowed MIME types
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.ms-excel", // .xls
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-powerpoint", // .ppt
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
  "text/plain", // .txt
  "text/csv", // .csv
  "image/png", // .png
  "image/jpeg", // .jpg, .jpeg
  "image/gif", // .gif
  "image/bmp", // .bmp
  "image/webp", // .webp
  "image/svg+xml", // .svg
]

export function UploadDialog({ isOpen, onOpenChange, onUploadSuccess, currentFolderId, userId }: UploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        setError(
          `File type not supported: ${file.type}. Please upload a PDF, document, spreadsheet, presentation, text, CSV, or image file.`,
        )
        setSelectedFile(null)
        setFileName("")
        return
      }
      setSelectedFile(file)
      setFileName(file.name.split(".").slice(0, -1).join(".")) // Pre-fill name without extension
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !fileName.trim()) {
      setError("Please select a file and provide a name.")
      return
    }
    if (!userId) {
      setError("User not authenticated. Please log in.")
      return
    }

    setIsUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append("file", selectedFile)
    formData.append("fileName", fileName.trim())
    // Ensure folderId is explicitly null if it's the root folder
    formData.append("folderId", currentFolderId || "null") // Send "null" string if currentFolderId is null

    try {
      const res = await fetch("/api/documents/upload", {
        method: "POST",
        headers: {
          "X-User-Id": userId, // Use the userId prop here
        },
        body: formData,
      })

      if (res.ok) {
        onUploadSuccess()
        setSelectedFile(null)
        setFileName("")
        onOpenChange(false)
      } else {
        const errorData = await res.json()
        setError(errorData.message || "Failed to upload file.")
      }
    } catch (err: any) {
      setError("Network error or server issue: " + err.message)
      console.error("Upload error:", err)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="file">File</Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              accept={ALLOWED_MIME_TYPES.join(",")} // Specify accepted file types
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="fileName">Document Name</Label>
            <Input
              id="fileName"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Enter document name"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={isUploading || !selectedFile || !fileName.trim() || !userId}>
            {isUploading ? "Uploading..." : "Upload"}
            <UploadIcon className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
