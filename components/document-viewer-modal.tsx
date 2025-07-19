"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, FileWarningIcon, Download } from "lucide-react";
import type { Document } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DocumentViewerModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document | null;
}

export function DocumentViewerModal({
  isOpen,
  onOpenChange,
  document,
}: DocumentViewerModalProps) {
  const [textPreviewContent, setTextPreviewContent] = useState<string | null>(
    null
  );
  const [isTextContentLoading, setIsTextContentLoading] = useState(false);

  const fetchTextContent = useCallback(async (url: string) => {
    setIsTextContentLoading(true);
    try {
      const res = await fetch(url);
      if (res.ok) {
        const text = await res.text();
        setTextPreviewContent(text);
      } else {
        console.error(
          "Failed to fetch text content:",
          res.status,
          await res.text()
        );
        setTextPreviewContent("Failed to load text content.");
      }
    } catch (err) {
      console.error("Network error fetching text content:", err);
      setTextPreviewContent("Network error loading text content.");
    } finally {
      setIsTextContentLoading(false);
    }
  }, []);

  useEffect(() => {
    if (
      isOpen &&
      document &&
      (document.fileType === "text/plain" || document.fileType === "text/csv")
    ) {
      fetchTextContent(document.url);
    } else if (!isOpen) {
      setTextPreviewContent(null);
    }
  }, [isOpen, document, fetchTextContent]);

  if (!document) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] h-[400px] flex flex-col items-center justify-center text-center">
          <FileWarningIcon className="h-16 w-16 text-muted-foreground mb-4" />
          <DialogTitle>Document Not Found</DialogTitle>
          <p className="text-muted-foreground">
            The document details could not be loaded.
          </p>
        </DialogContent>
      </Dialog>
    );
  }

  const fileUrl = `/api/files/${document.id}`;
  const blobDirectUrl = document.url;

  const isPdf = document.fileType === "application/pdf";
  const isImage = document.fileType.startsWith("image/");
  const isOfficeDoc = [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ].includes(document.fileType);
  const isPlainText = document.fileType === "text/plain";
  const isCsv = document.fileType === "text/csv";

  let previewContent = null;
  if (isPdf) {
    previewContent = (
      <iframe
        src={fileUrl} 
        title={document.name}
        className="w-full h-full border-none"
      >
        <p className="p-4 text-center text-muted-foreground">
          Your browser does not support iframes. You can{" "}
          <a
            href={fileUrl}
            download={document.originalFileName}
            className="text-accent hover:underline"
          >
            download the PDF
          </a>{" "}
          instead.
        </p>
      </iframe>
    );
  } else if (isImage) {
    previewContent = (
      <div className="flex flex-1 items-center justify-center p-4">
        <img
          src={blobDirectUrl || "/placeholder.svg"}
          alt={document.name}
          className="max-w-full max-h-[calc(80vh-100px)] object-contain" // Adjusted max-height for modal
        />
      </div>
    );
  } else if (isOfficeDoc) {
    const googleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(
      blobDirectUrl
    )}&embedded=true`;
    previewContent = (
      <iframe
        src={googleViewerUrl}
        title={`Preview ${document.name}`}
        className="w-full h-full border-none"
        allowFullScreen
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      >
        <p className="p-4 text-center text-muted-foreground">
          Your browser cannot display a preview of this document. You can{" "}
          <a
            href={fileUrl}
            download={document.originalFileName}
            className="text-accent hover:underline"
          >
            download it
          </a>{" "}
          or try opening it in a suitable application.
        </p>
      </iframe>
    );
  } else if (isPlainText || isCsv) {
    previewContent = (
      <div className="flex flex-1 flex-col p-4 overflow-auto">
        <h2 className="text-xl font-bold mb-2">Text Preview</h2>
        {isTextContentLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
            <span className="ml-2 text-muted-foreground">
              Loading text content...
            </span>
          </div>
        ) : textPreviewContent ? (
          <pre className="whitespace-pre-wrap break-words bg-card p-4 rounded-md border border-border text-sm text-card-foreground flex-1 max-h-[calc(80vh-200px)] overflow-auto">
            {textPreviewContent}
          </pre>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <FileWarningIcon className="h-12 w-12 mb-2" />
            <p>Failed to load text preview.</p>
          </div>
        )}
      </div>
    );
  } else {
    previewContent = (
      <div className="flex flex-1 flex-col items-center justify-center p-4 text-center">
        <FileWarningIcon className="h-20 w-20 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold mb-2">Preview Not Available</h2>
        <p className="text-muted-foreground">
          This file type ({document.fileType}) cannot be previewed directly in
          the browser.
        </p>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[60vw] h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="truncate">{document.name}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden flex flex-col">
          {previewContent}
        </div>
        <div className="flex justify-end p-4 border-t border-border flex-shrink-0">
          <Button
            asChild
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <a href={fileUrl} download={document.originalFileName}>
              <Download className="mr-2 h-4 w-4" /> Download File
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
