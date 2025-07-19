import { NextResponse } from "next/server"
import { put, del } from "@vercel/blob" // Import 'del' for cleanup
import { sql } from "@/lib/db"
import type { Document } from "@/lib/types"

// Helper to get user ID from headers
const getUserIdFromHeaders = (headers: Headers) => headers.get("X-User-Id")

export async function POST(req: Request) {
  const userId = getUserIdFromHeaders(req.headers)
  console.log("Upload API: Received X-User-Id:", userId) // Log userId
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized: User ID missing" }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get("file") as File
  const fileName = formData.get("fileName") as string // User-provided display name
  let folderId = formData.get("folderId") as string | null

  console.log("Upload API: Incoming fileName (display name):", fileName)
  console.log("Upload API: Incoming folderId (raw from form):", formData.get("folderId"))

  // Convert "null" string or empty string to actual null for database
  if (folderId === "null" || folderId === "") {
    folderId = null
  }
  console.log("Upload API: Processed folderId (for DB):", folderId)

  if (!file || !fileName) {
    console.error("Upload API: File or fileName is missing.")
    return NextResponse.json({ message: "File and file name are required" }, { status: 400 })
  }

  console.log("Upload API: File details - original name:", file.name, "type:", file.type, "size:", file.size)

  let blobUrl: string | undefined // To store blob URL for potential cleanup

  try {
    // Construct a unique path for the blob, including the original file extension
    // Use file.name for the actual blob path to ensure uniqueness and correct extension
    const blobPath = `${userId}/${folderId || "root"}/${file.name}`
    console.log("Upload API: Blob path to use:", blobPath)

    // Upload file to Vercel Blob
    const blob = await put(blobPath, file, {
      access: "public",
    })
    blobUrl = blob.url // Store the URL for cleanup if DB fails
    console.log("Upload API: Blob uploaded successfully. URL:", blobUrl)

    let newDocument: Document
    try {
      // IMPORTANT: Ensure both folder_id and owner_id are explicitly cast to UUID.
      // The owner_id was missing the ::uuid cast in previous versions.
      ;[newDocument] = await sql<Document[]>`
        INSERT INTO documents (name, original_file_name, file_type, url, folder_id, owner_id)
        VALUES (${fileName}, ${file.name}, ${file.type}, ${blob.url}, ${folderId}::uuid, ${userId}::uuid)
        RETURNING id, name, original_file_name AS "originalFileName", file_type AS "fileType", url, folder_id AS "folderId", owner_id AS "ownerId", uploaded_at AS "uploadedAt";
      `
      console.log("Upload API: Document metadata inserted successfully into DB.")
    } catch (dbError: any) {
      console.error("Upload API: Database insertion error details:", dbError)
      // If DB insertion fails, attempt to delete the blob to clean up
      if (blobUrl) {
        try {
          await del(blobUrl)
          console.log("Upload API: Cleaned up blob due to DB error.")
        } catch (cleanupError) {
          console.warn("Upload API: Failed to clean up blob after DB error:", cleanupError)
        }
      }
      // Return a more informative error message from the database
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
