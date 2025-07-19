import { AuthForm } from "@/components/auth-form"

export default function LoginPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-br from-background to-card p-4">
      <AuthForm type="login" />
    </div>
  )
}
