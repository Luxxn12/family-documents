import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import type { Folder, Document } from "@/lib/types"

const getUserId = (h: Headers) => h.get("X-User-Id") ?? ""

/* -------------------------------------------------------------------------- */
/* PUT – rename folder                                                         */
/* -------------------------------------------------------------------------- */
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const userId = getUserId(req.headers)
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const { id } = params
  const { name } = await req.json()

  if (!name) {
    return NextResponse.json({ message: "Folder name is required" }, { status: 400 })
  }

  try {
    const [folder] = await sql<Folder[]>`SELECT id, owner_id AS "ownerId" FROM folders WHERE id = ${id}`
    if (!folder || folder.ownerId !== userId) {
      return NextResponse.json({ message: "Folder not found or unauthorized" }, { status: 404 })
    }

    const [updatedFolder] = await sql<Folder[]>`
      UPDATE folders
      SET name = ${name}
      WHERE id = ${id}
      RETURNING id, name, parent_id AS "parentId", owner_id AS "ownerId", created_at AS "createdAt";
    `
    return NextResponse.json({ folder: updatedFolder }, { status: 200 })
  } catch (error: any) {
    console.error("Failed to rename folder:", error)
    return NextResponse.json({ message: "Failed to rename folder", error: error.message }, { status: 500 })
  }
}

/* -------------------------------------------------------------------------- */
/* DELETE – remove folder (and nested contents via CASCADE)                   */
/* -------------------------------------------------------------------------- */
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const userId = getUserId(req.headers)
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const { id } = params

  try {
    const [folder] = await sql<Folder[]>`SELECT id, owner_id AS "ownerId" FROM folders WHERE id = ${id}`
    if (!folder || folder.ownerId !== userId) {
      return NextResponse.json({ message: "Folder not found or unauthorized" }, { status: 404 })
    }

    // Get URLs of documents within this folder and its children to delete from Vercel Blob
    const documentsToDelete = await sql<Document[]>`
      WITH RECURSIVE subfolders AS (
        SELECT id FROM folders WHERE id = ${id}
        UNION ALL
        SELECT f.id FROM folders f JOIN subfolders sf ON f.parent_id = sf.id
      )
      SELECT d.url FROM documents d
      WHERE d.folder_id IN (SELECT id FROM subfolders) OR d.id IN (
          SELECT id FROM documents WHERE folder_id IS NULL AND id = ${id}
      );
    `

    // Delete folder and its contents (documents, subfolders) from the database
    // The CASCADE on `folders.parent_id` handles nested folders.
    // The `ON DELETE CASCADE` for `documents.owner_id` will delete docs if user is deleted,
    // but here we are deleting a folder, so we need to handle documents explicitly.
    // For documents in this folder, `ON DELETE SET NULL` on `documents.folder_id` is applied.
    // To fully remove documents, we must delete them first.
    await sql`
      DELETE FROM documents WHERE folder_id IN (
          WITH RECURSIVE subfolders AS (
            SELECT id FROM folders WHERE id = ${id}
            UNION ALL
            SELECT f.id FROM folders f JOIN subfolders sf ON f.parent_id = sf.id
          )
          SELECT id FROM subfolders
      );
    `
    await sql`DELETE FROM folders WHERE id = ${id};`

    // Delete blobs associated with the documents
    const { del } = await import("@vercel/blob") // Dynamic import for server-side Blob operations
    await Promise.all(documentsToDelete.map((doc) => del(doc.url).catch(console.warn)))

    return NextResponse.json({ message: "Folder and its contents deleted" }, { status: 200 })
  } catch (error: any) {
    console.error("Failed to delete folder:", error)
    return NextResponse.json({ message: "Failed to delete folder", error: error.message }, { status: 500 })
  }
}
