import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import type { Folder } from "@/lib/types"

// Helper to get user ID from headers
const getUserIdFromHeaders = (headers: Headers) => headers.get("X-User-Id")

export async function GET(req: Request) {
  const userId = getUserIdFromHeaders(req.headers)
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const folders = await sql<Folder[]>`
      SELECT id, name, parent_id AS "parentId", owner_id AS "ownerId", created_at AS "createdAt"
      FROM folders
      WHERE owner_id = ${userId}
      ORDER BY name ASC;
    `
    return NextResponse.json({ folders }, { status: 200 })
  } catch (error: any) {
    console.error("Failed to fetch folders:", error)
    return NextResponse.json({ message: "Failed to fetch folders", error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const userId = getUserIdFromHeaders(req.headers)
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const { name, parentId } = await req.json()
  if (!name) {
    return NextResponse.json({ message: "Folder name is required" }, { status: 400 })
  }

  try {
    const [newFolder] = await sql<Folder[]>`
      INSERT INTO folders (name, parent_id, owner_id)
      VALUES (${name}, ${parentId}, ${userId})
      RETURNING id, name, parent_id AS "parentId", owner_id AS "ownerId", created_at AS "createdAt";
    `
    return NextResponse.json({ folder: newFolder }, { status: 201 })
  } catch (error: any) {
    console.error("Failed to create folder:", error)
    return NextResponse.json({ message: "Failed to create folder", error: error.message }, { status: 500 })
  }
}
