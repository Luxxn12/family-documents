"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Loader2, FileWarningIcon, ArrowLeftIcon, Download } from "lucide-react"
import { getUserId } from "@/lib/auth"
import type { Document } from "@/lib/types"
import { Button } from "@/components/ui/button"

export default function DocumentViewPage() {
  const router = useRouter()
  const params = useParams()
  const documentId = params.id as string

  const [document, setDocument] = useState<Document | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const userId = getUserId()
    if (!userId) {
      router.replace("/login")
      return
    }

    const fetchDocument = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/documents/${documentId}`, {
          headers: { "X-User-Id": userId },
        })

        if (res.ok) {
          const data = await res.json()
          setDocument(data.document)
        } else {
          const errorData = await res.json()
          setError(errorData.message || "Failed to fetch document details.")
        }
      } catch (err: any) {
        setError("Network error fetching document: " + err.message)
        console.error("Fetch document error:", err)
      } finally {
        setIsLoading(false)
      }
    }

    if (documentId) {
      fetchDocument()
    }
  }, [documentId, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <Loader2 className="h-10 w-10 animate-spin text-accent" />
        <span className="ml-4 text-lg">Loading document...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4">
        <FileWarningIcon className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Error Loading Document</h1>
        <p className="text-muted-foreground text-center">{error}</p>
        <Button onClick={() => router.back()} className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90">
          <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4">
        <FileWarningIcon className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Document Not Found</h1>
        <p className="text-muted-foreground text-center">
          The document you are looking for does not exist or you do not have permission to view it.
        </p>
        <Button onClick={() => router.back()} className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90">
          <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>
    )
  }

  const fileUrl = `/api/files/${document.id}`

  const isPdf = document.fileType === "application/pdf"
  const isImage = document.fileType.startsWith("image/")

  let previewContent = null
  if (isPdf) {
    previewContent = (
      <iframe
        src={fileUrl}
        title={document.name}
        className="w-full h-full border-none"
        style={{ minHeight: "calc(100vh - 64px)" }} 
      >
        <p className="p-4 text-center text-muted-foreground">
          Browser Anda tidak mendukung iframe. Anda dapat{" "}
          <a href={fileUrl} download={document.originalFileName} className="text-accent hover:underline">
            mengunduh PDF
          </a>{" "}
          sebagai gantinya.
        </p>
      </iframe>
    )
  } else if (isImage) {
    previewContent = (
      <div className="flex flex-1 items-center justify-center p-4">
        <img
          src={fileUrl || "/placeholder.svg"}
          alt={document.name}
          className="max-w-full max-h-[calc(100vh-100px)] object-contain" 
        />
      </div>
    )
  } else {
    previewContent = (
      <div className="flex flex-1 flex-col items-center justify-center p-4 text-center">
        <FileWarningIcon className="h-20 w-20 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold mb-2">Pratinjau Tidak Tersedia</h2>
        <p className="text-muted-foreground">
          Jenis file ini ({document.fileType}) tidak dapat dipratinjau langsung di browser.
        </p>
        <Button asChild className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
          <a href={fileUrl} download={document.originalFileName}>
            <Download className="mr-2 h-4 w-4" /> Unduh File
          </a>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="flex h-16 items-center justify-between border-b border-border bg-background px-4 md:px-6 shadow-sm">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-lg font-semibold text-foreground hover:bg-transparent hover:text-primary"
        >
          <ArrowLeftIcon className="h-6 w-6 text-accent" />
          <span>Kembali ke Dashboard</span>
        </Button>
        <h1 className="text-xl font-bold truncate max-w-[calc(100%-150px)]">{document.name}</h1>
      </header>

      <main className="flex flex-1 overflow-hidden">{previewContent}</main>
    </div>
  )
}
