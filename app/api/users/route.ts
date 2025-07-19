import { sql } from "@/lib/db"
import type { User } from "@/lib/types"
import { NextResponse } from "next/server"

// Helper to get user ID from headers
const getUserIdFromHeaders = (headers: Headers) => headers.get("X-User-Id")

export async function GET(req: Request) {
  const userId = getUserIdFromHeaders(req.headers)
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    // Verify if the requesting user is an admin
    const [currentUser] = await sql<User[]>`SELECT role FROM users WHERE id = ${userId}`
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ message: "Forbidden: Only admins can view users" }, { status: 403 })
    }

    // Fetch all users, excluding password for security
    const users = await sql<User[]>`
      SELECT id, email, role, created_at
      FROM users
      ORDER BY created_at DESC;
    `
    return NextResponse.json({ users }, { status: 200 })
  } catch (error: any) {
    console.error("Failed to fetch users:", error)
    return NextResponse.json({ message: "Failed to fetch users", error: error.message }, { status: 500 })
  }
}
