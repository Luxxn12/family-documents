import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import type { Document } from "@/lib/types"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params

  try {
    // Fetch document URL and metadata from your database using the ID
    const [doc] = await sql<Document[]>`
      SELECT url, name, original_file_name AS "originalFileName", file_type AS "fileType"
      FROM documents
      WHERE id = ${id};
    `

    if (!doc) {
      return new NextResponse("Document not found", { status: 404 })
    }

    // Fetch the file from Vercel Blob
    const response = await fetch(doc.url)

    if (!response.ok) {
      console.error(`Failed to fetch blob from Vercel Blob: ${response.status} ${response.statusText}`)
      return new NextResponse("Failed to retrieve file from storage", { status: 500 })
    }

    // Get content type from the blob response or use the one from your DB
    const contentType = response.headers.get("Content-Type") || doc.fileType

    // Create a new response with the blob content and appropriate headers
    const headers = new Headers(response.headers)
    headers.set("Content-Type", contentType)
    // IMPORTANT: Use 'attachment' and doc.originalFileName to force download and preserve original filename/type
    headers.set("Content-Disposition", `attachment; filename="${doc.originalFileName}"`)
    headers.set("Cache-Control", "public, max-age=31536000, immutable") // Cache for a long time

    return new NextResponse(response.body, {
      status: 200,
      headers: headers,
    })
  } catch (error: any) {
    console.error("Error serving file:", error)
    return new NextResponse("Internal server error", { status: 500 })
  }
}
