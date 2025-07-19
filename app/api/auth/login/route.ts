import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import type { User } from "@/lib/types"

export async function POST(req: Request) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ message: "Email and password are required" }, { status: 400 })
  }

  try {
    const [user] = await sql<User[]>`SELECT id, email, password, role FROM users WHERE email = ${email}`

    if (!user || user.password !== password) {
      // In a real app, compare hashed passwords securely
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    return NextResponse.json({ message: "Login successful", userId: user.id }, { status: 200 })
  } catch (error: any) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "An error occurred during login", error: error.message }, { status: 500 })
  }
}
