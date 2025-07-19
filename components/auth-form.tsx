"use client"

import Image from "next/image"; // Import Image component from Next.js
import type React from "react";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setUserId } from "@/lib/auth";

interface AuthFormProps {
  type: "login" | "register"
}

export function AuthForm({ type }: AuthFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const endpoint = type === "login" ? "/api/auth/login" : "/api/auth/register"

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (res.ok) {
        const data = await res.json()
        setUserId(data.userId)
        router.push("/dashboard")
      } else {
        let message = "An unexpected error occurred."
        const ct = res.headers.get("content-type") ?? ""

        try {
          if (ct.includes("application/json")) {
            const err = await res.json()
            message = err.message ?? message
          } else {
            message = await res.text()
          }
        } catch (parseErr) {
          console.error("Failed to parse error response:", parseErr)
        }

        setError(message)
      }
    } catch (err) {
      console.error("Network or unexpected error:", err)
      setError("Failed to connect to the server. Please check your internet connection.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-card text-card-foreground border-border shadow-lg">
      <div className="flex justify-center pt-8 pb-4">
        {" "}

        <Image
          src="/logo-doc.png"
          alt="Family Document Manager Logo"
          width={80}
          height={80}
        />
      </div>
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-white">{type === "login" ? "Login" : "Register"}</CardTitle>
        <CardDescription className="text-muted-foreground">
          {type === "login" ? "Enter your credentials to access your documents." : "Create an account to get started."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="bg-input text-foreground border-border focus:ring-ring"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="bg-input text-foreground border-border focus:ring-ring"
            />
          </div>
          {error && <p className="text-destructive text-sm text-center">{error}</p>}
          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {type === "login" ? "Logging in..." : "Registering..."}
              </>
            ) : type === "login" ? (
              "Login"
            ) : (
              "Register"
            )}
          </Button>
        </form>
        <div className="mt-6 text-center text-sm text-muted-foreground">
          {type === "login" ? (
            <>
              Don't have an account?{" "}
              <Button
                variant="link"
                onClick={() => router.push("/register")}
                className="p-0 h-auto text-accent hover:text-accent/80 font-bold"
                disabled={isLoading}
              >
                Register
              </Button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Button
                variant="link"
                onClick={() => router.push("/login")}
                className="p-0 h-auto text-accent hover:text-accent/80 font-bold"
                disabled={isLoading}
              >
                Login
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
