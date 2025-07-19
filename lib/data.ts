// lib/data.ts
// ---------------------------------------------------------------------------
// ⚠️  DEMO ONLY – Everything is stored in memory and lost on refresh/reload.
// ---------------------------------------------------------------------------

export type Role = "admin" | "member"

export interface User {
  id: string
  email: string
  password: string // ⚠️ plain-text for demo; NEVER do this in production
  role: Role
}

export interface Folder {
  id: string
  name: string
  parentId: string | null
  ownerId: string
}

export interface Document {
  id: string
  name: string
  fileType: string
  url: string
  folderId: string | null
  ownerId: string
  uploadedAt: string
}

/* -------------------------------------------------------------------------- */
/*                               Helpers / Data                               */
/* -------------------------------------------------------------------------- */

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10)

const users: User[] = []
let folders: Folder[] = []
let documents: Document[] = []

// Seed two demo users so you can log in immediately.
if (users.length === 0) {
  users.push({ id: uid(), email: "admin@example.com", password: "password", role: "admin" })
  users.push({ id: uid(), email: "member@example.com", password: "password", role: "member" })
}

/* -------------------------------------------------------------------------- */
/*                              Mock-DB Methods                               */
/* -------------------------------------------------------------------------- */

export const mockDb = {
  /* ------------------------------ Users ------------------------------- */
  users: {
    findByEmail: (email: string) => users.find((u) => u.email === email),
    findById: (id: string) => users.find((u) => u.id === id),
    create: (email: string, password: string, role: Role = "member"): User => {
      const user: User = { id: uid(), email, password, role }
      users.push(user)
      return user
    },
  },

  /* ----------------------------- Folders ------------------------------ */
  folders: {
    findAllByOwner: (ownerId: string) => folders.filter((f) => f.ownerId === ownerId),
    findById: (id: string) => folders.find((f) => f.id === id),
    create: (name: string, ownerId: string, parentId: string | null = null): Folder => {
      const folder: Folder = { id: uid(), name, parentId, ownerId }
      folders.push(folder)
      return folder
    },
    update: (id: string, newName: string) => {
      const folder = folders.find((f) => f.id === id)
      if (folder) folder.name = newName
      return folder
    },
    delete: (id: string) => {
      // gather ids of this folder and all nested children
      const toDelete = new Set<string>([id])
      let changed = true
      while (changed) {
        changed = false
        folders.forEach((f) => {
          if (f.parentId && toDelete.has(f.parentId) && !toDelete.has(f.id)) {
            toDelete.add(f.id)
            changed = true
          }
        })
      }
      const beforeFolders = folders.length
      const beforeDocs = documents.length
      folders = folders.filter((f) => !toDelete.has(f.id))
      documents = documents.filter((d) => !toDelete.has(d.folderId ?? ""))
      return folders.length < beforeFolders || documents.length < beforeDocs
    },
  },

  /* ---------------------------- Documents ---------------------------- */
  documents: {
    findAllByFolderAndOwner: (folderId: string | null, ownerId: string) =>
      documents.filter((d) => d.ownerId === ownerId && d.folderId === folderId),
    findById: (id: string) => documents.find((d) => d.id === id),
    create: (name: string, fileType: string, url: string, folderId: string | null, ownerId: string): Document => {
      const doc: Document = {
        id: uid(),
        name,
        fileType,
        url,
        folderId,
        ownerId,
        uploadedAt: new Date().toISOString(),
      }
      documents.push(doc)
      return doc
    },
    update: (id: string, updates: Partial<Pick<Document, "name" | "folderId">>) => {
      const doc = documents.find((d) => d.id === id)
      if (doc) Object.assign(doc, updates)
      return doc
    },
    delete: (id: string) => {
      const before = documents.length
      documents = documents.filter((d) => d.id !== id)
      return documents.length < before
    },
  },
}
