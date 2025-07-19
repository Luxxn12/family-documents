import { sql } from "@/lib/db"
import type { Role, User } from "@/lib/types"
import { NextResponse } from "next/server"

const getUserIdFromHeaders = (headers: Headers) => headers.get("X-User-Id")

/* -------------------------------------------------------------------------- */
/* GET – return a single user's public details                                */
/* -------------------------------------------------------------------------- */
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const requestingUserId = getUserIdFromHeaders(req.headers)
  if (!requestingUserId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const { id: targetUserId } = params

  try {
    // Admins can fetch anyone, regular users can only fetch themselves
    const [requestingUser] = await sql<User[]>`SELECT role FROM users WHERE id = ${requestingUserId}`
    if (!requestingUser) {
      return NextResponse.json({ message: "Requester not found" }, { status: 404 })
    }
    if (requestingUserId !== targetUserId && requestingUser.role !== "admin") {
      return NextResponse.json({ message: "Forbidden: You don't have permission to view this user" }, { status: 403 })
    }

    const [user] = await sql<User[]>`
      SELECT id, email, role, created_at
      FROM users
      WHERE id = ${targetUserId};
    `
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user }, { status: 200 })
  } catch (error: any) {
    console.error("Failed to fetch user:", error)
    return NextResponse.json({ message: "Failed to fetch user", error: error.message }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const requestingUserId = getUserIdFromHeaders(req.headers)
  if (!requestingUserId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const { id: targetUserId } = params
  const { role } = (await req.json()) as { role: Role }

  if (!role || (role !== "admin" && role !== "member")) {
    return NextResponse.json({ message: "Invalid role provided" }, { status: 400 })
  }

  try {
    // Verify if the requesting user is an admin
    const [requestingUser] = await sql<User[]>`SELECT role FROM users WHERE id = ${requestingUserId}`
    if (!requestingUser || requestingUser.role !== "admin") {
      return NextResponse.json({ message: "Forbidden: Only admins can change user roles" }, { status: 403 })
    }

    // Prevent an admin from demoting themselves if they are the only admin
    if (requestingUserId === targetUserId && role === "member") {
      const adminCount = await sql<{ count: number }[]>`SELECT COUNT(*) FROM users WHERE role = 'admin'`
      if (adminCount[0].count <= 1) {
        return NextResponse.json({ message: "Cannot demote the last admin user" }, { status: 400 })
      }
    }

    // Update the target user's role
    const [updatedUser] = await sql<User[]>`
      UPDATE users
      SET role = ${role}
      WHERE id = ${targetUserId}
      RETURNING id, email, role, created_at;
    `

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "User role updated successfully", user: updatedUser }, { status: 200 })
  } catch (error: any) {
    console.error("Failed to update user role:", error)
    return NextResponse.json({ message: "Failed to update user role", error: error.message }, { status: 500 })
  }
}

/* -------------------------------------------------------------------------- */
/* DELETE – remove user                                                       */
/* -------------------------------------------------------------------------- */
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const requestingUserId = getUserIdFromHeaders(req.headers)
  if (!requestingUserId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const { id: targetUserId } = params

  try {
    // Verify if the requesting user is an admin
    const [requestingUser] = await sql<User[]>`SELECT role FROM users WHERE id = ${requestingUserId}`
    if (!requestingUser || requestingUser.role !== "admin") {
      return NextResponse.json({ message: "Forbidden: Only admins can delete users" }, { status: 403 })
    }

    // Prevent an admin from deleting themselves
    if (requestingUserId === targetUserId) {
      return NextResponse.json({ message: "Cannot delete your own admin account" }, { status: 400 })
    }

    // Prevent deletion of the last admin if the target is an admin
    const [targetUser] = await sql<User[]>`SELECT role FROM users WHERE id = ${targetUserId}`
    if (targetUser && targetUser.role === "admin") {
      const adminCount = await sql<{ count: number }[]>`SELECT COUNT(*) FROM users WHERE role = 'admin'`
      if (adminCount[0].count <= 1) {
        return NextResponse.json({ message: "Cannot delete the last admin user" }, { status: 400 })
      }
    }

    // Delete user's documents and folders first (due to CASCADE on owner_id)
    // This assumes CASCADE is set up correctly in your SQL schema for documents and folders.
    // If not, you'd need explicit DELETE statements here for documents and folders owned by targetUserId.
    // For this project, `ON DELETE CASCADE` is set for `owner_id` on `folders` and `documents`.
    await sql`DELETE FROM users WHERE id = ${targetUserId};`

    return NextResponse.json({ message: "User deleted successfully" }, { status: 200 })
  } catch (error: any) {
    console.error("Failed to delete user:", error)
    return NextResponse.json({ message: "Failed to delete user", error: error.message }, { status: 500 })
  }
}
