// lib/types.ts

export type Role = "admin" | "member"

export interface User {
  id: string
  email: string
  password: string // ⚠️ plain-text for demo; NEVER do this in production
  role: Role
  created_at: string
}

export interface Folder {
  id: string
  name: string
  parentId: string | null
  ownerId: string
  createdAt: string
}

export interface Document {
  id: string
  name: string // User-provided display name
  originalFileName: string // Original file name with extension (e.g., "report.pdf")
  fileType: string
  url: string
  folderId: string | null
  ownerId: string
  uploadedAt: string
}
