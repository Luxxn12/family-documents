import { sql } from "@/lib/db"
import type { Document } from "@/lib/types"
import { del, put } from "@vercel/blob"
import { NextResponse } from "next/server"

const getUserIdFromHeaders = (headers: Headers) => headers.get("X-User-Id")

export async function POST(req: Request) {
  const userId = getUserIdFromHeaders(req.headers)
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized: User ID missing" }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get("file") as File
  const fileName = formData.get("fileName") as string
  let folderId = formData.get("folderId") as string | null

  if (folderId === "null" || folderId === "") {
    folderId = null
  }

  if (!file || !fileName) {
    console.error("Upload API: File or fileName is missing.")
    return NextResponse.json({ message: "File and file name are required" }, { status: 400 })
  }

  let blobUrl: string | undefined 

  try {
    const blobPath = `${userId}/${folderId || "root"}/${file.name}`
    const blob = await put(blobPath, file, {
      access: "public",
    })
    blobUrl = blob.url // Store the URL for cleanup if DB fails

    let newDocument: Document
    try {
      // IMPORTANT: Ensure both folder_id and owner_id are explicitly cast to UUID.
      // The owner_id was missing the ::uuid cast in previous versions.
      ;[newDocument] = await sql<Document[]>`
        INSERT INTO documents (name, original_file_name, file_type, url, folder_id, owner_id)
        VALUES (${fileName}, ${file.name}, ${file.type}, ${blob.url}, ${folderId}::uuid, ${userId}::uuid)
        RETURNING id, name, original_file_name AS "originalFileName", file_type AS "fileType", url, folder_id AS "folderId", owner_id AS "ownerId", uploaded_at AS "uploadedAt";
      `
    } catch (dbError: any) {
      console.error("Upload API: Database insertion error details:", dbError)
      if (blobUrl) {
        try {
          await del(blobUrl)
        } catch (cleanupError) {
          console.warn("Upload API: Failed to clean up blob after DB error:", cleanupError)
        }
      }
      return NextResponse.json(
        {
          message: "Failed to save document metadata to database. Please check server logs for details.",
          error: dbError.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({ message: "File uploaded successfully", document: newDocument }, { status: 201 })
  } catch (error: any) {
    console.error("Upload API: Error during file upload process (outer catch):", error)
    if (error instanceof Error) {
      console.error("Error name:", error.name)
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }
    return NextResponse.json(
      { message: "Failed to upload file due to server error.", error: error.message },
      { status: 500 },
    )
  }
}
