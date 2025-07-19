// lib/db.ts
import { neon, type NeonQueryFunction } from "@neondatabase/serverless"
import { Pool } from "@neondatabase/serverless"

// Ensure DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set")
}

// Create a single, reusable Neon client instance
// This is typically done once per application lifecycle or per function for serverless.
export const sql = neon(process.env.DATABASE_URL) as NeonQueryFunction<false, false>

// You can also create a Pool if you prefer for multiple connections/transactions
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})
