import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import type { Document } from "@/lib/types"

// Helper to get user ID from headers
const getUserIdFromHeaders = (headers: Headers) => headers.get("X-User-Id")

export async function GET(req: Request) {
  const userId = getUserIdFromHeaders(req.headers)
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const folderId = searchParams.get("folderId")

  try {
    let documents: Document[]
    if (folderId === null || folderId === "null") {
      documents = await sql<Document[]>`
        SELECT id, name, original_file_name AS "originalFileName", file_type AS "fileType", url, folder_id AS "folderId", owner_id AS "ownerId", uploaded_at AS "uploadedAt"
        FROM documents
        WHERE owner_id = ${userId} AND folder_id IS NULL
        ORDER BY uploaded_at DESC;
      `
    } else {
      documents = await sql<Document[]>`
        SELECT id, name, original_file_name AS "originalFileName", file_type AS "fileType", url, folder_id AS "folderId", owner_id AS "ownerId", uploaded_at AS "uploadedAt"
        FROM documents
        WHERE owner_id = ${userId} AND folder_id = ${folderId}
        ORDER BY uploaded_at DESC;
      `
    }
    return NextResponse.json({ documents }, { status: 200 })
  } catch (error: any) {
    console.error("Failed to fetch documents:", error)
    return NextResponse.json({ message: "Failed to fetch documents", error: error.message }, { status: 500 })
  }
}
