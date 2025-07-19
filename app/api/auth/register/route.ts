import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import type { User } from "@/lib/types"

export async function POST(req: Request) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ message: "Email and password are required" }, { status: 400 })
  }

  try {
    // Check if user already exists
    const existingUser = await sql<User[]>`SELECT id FROM users WHERE email = ${email}`
    if (existingUser.length > 0) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 409 })
    }

    // Create new user (password is stored in plain text for demo, hash in production!)
    const [newUser] = await sql<User[]>`
      INSERT INTO users (email, password, role)
      VALUES (${email}, ${password}, 'member')
      RETURNING id, email, role, created_at;
    `

    return NextResponse.json({ message: "User registered successfully", userId: newUser.id }, { status: 201 })
  } catch (error: any) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { message: "An error occurred during registration", error: error.message },
      { status: 500 },
    )
  }
}
