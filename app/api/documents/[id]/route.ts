import { pool, sql } from "@/lib/db"
import type { Document } from "@/lib/types"
import { del } from "@vercel/blob"
import { NextResponse } from "next/server"

const getUserId = (h: Headers) => h.get("X-User-Id") ?? ""

/* -------------------------------------------------------------------------- */
/* GET – return a single document's metadata                                  */
/* -------------------------------------------------------------------------- */
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const userId = getUserId(req.headers)
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const { id } = params

  try {
    const [doc] = await sql<Document[]>`
      SELECT id, name, original_file_name AS "originalFileName", file_type AS "fileType", url, folder_id AS "folderId", owner_id AS "ownerId", uploaded_at AS "uploadedAt"
      FROM documents
      WHERE id = ${id};
    `

    if (!doc || doc.ownerId !== userId) {
      return NextResponse.json({ message: "Document not found or unauthorized" }, { status: 404 })
    }

    return NextResponse.json({ document: doc }, { status: 200 })
  } catch (error: any) {
    console.error("Failed to fetch document metadata:", error)
    return NextResponse.json({ message: "Failed to fetch document metadata", error: error.message }, { status: 500 })
  }
}

/* -------------------------------------------------------------------------- */
/* PUT – rename or move document                                               */
/* -------------------------------------------------------------------------- */
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const userId = getUserId(req.headers)
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const { id } = params
  const { name, folderId } = (await req.json()) as {
    name?: string
    folderId?: string | null
  }

  try {
    // Ensure the document belongs to the user
    const {
      rows: [doc],
    } = await pool.query<Document>(
      `SELECT id, owner_id AS "ownerId"
         FROM documents
        WHERE id = $1`,
      [id],
    )

    if (!doc || doc.ownerId !== userId) {
      return NextResponse.json({ message: "Document not found or unauthorized" }, { status: 404 })
    }

    /* ---------------- Build dynamic SET clause safely ---------------- */
    const setParts: string[] = []
    const values: (string | null)[] = []

    if (typeof name === "string") {
      values.push(name)
      setParts.push(`name = $${values.length}`)
    }

    if (folderId !== undefined) {
      // Convert "null" or empty string to actual NULL
      const fId = folderId === "" || folderId === "null" ? null : folderId
      values.push(fId)
      setParts.push(`folder_id = $${values.length}`)
    }

    if (setParts.length === 0) {
      return NextResponse.json({ message: "No updates provided" }, { status: 400 })
    }

    // Add document id to the parameter list
    values.push(id)

    const {
      rows: [updated],
    } = await pool.query<Document>(
      `
        UPDATE documents
           SET ${setParts.join(", ")}
         WHERE id = $${values.length}
     RETURNING id,
               name,
               original_file_name AS "originalFileName",
               file_type   AS "fileType",
               url,
               folder_id   AS "folderId",
               owner_id    AS "ownerId",
               uploaded_at AS "uploadedAt";
      `,
      values,
    )

    return NextResponse.json({ document: updated }, { status: 200 })
  } catch (error: any) {
    console.error("Failed to update document:", error)
    return NextResponse.json({ message: "Failed to update document", error: error.message }, { status: 500 })
  }
}

/* -------------------------------------------------------------------------- */
/* DELETE – remove document + blob                                             */
/* -------------------------------------------------------------------------- */
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const userId = getUserId(req.headers)
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const { id } = params
  let doc: Document | undefined

  try {
    ;[doc] = await sql<Document[]>`SELECT id, owner_id AS "ownerId", url FROM documents WHERE id = ${id}`
    if (!doc || doc.ownerId !== userId) {
      return NextResponse.json({ message: "Document not found or unauthorized" }, { status: 404 })
    }

    // Delete from database
    await sql`DELETE FROM documents WHERE id = ${id};`

    // Remove blob file
    try {
      await del(doc.url)
    } catch (blobError) {
      console.warn(`Failed to delete blob for document ${id}:`, blobError)
      /* ignore if already gone or other blob issues */
    }

    return NextResponse.json({ message: "Document deleted" }, { status: 200 })
  } catch (error: any) {
    console.error("Failed to delete document:", error)
    return NextResponse.json({ message: "Failed to delete document", error: error.message }, { status: 500 })
  }
}
