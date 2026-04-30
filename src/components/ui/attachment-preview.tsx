"use client";

import { useState } from "react";
import { File, Image, FileText, X, ExternalLink, Loader2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AttachmentPreviewProps {
  url: string;
  filename?: string;
  className?: string;
}

const getFileIcon = (url: string) => {
  const ext = url.split(".").pop()?.toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext || "")) return "image";
  if (["pdf"].includes(ext || "")) return "pdf";
  if (["doc", "docx"].includes(ext || "")) return "doc";
  return "file";
};

export function AttachmentPreview({ url, filename, className }: AttachmentPreviewProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileType = getFileIcon(url);

  const previewContent = () => {
    if (fileType === "image") {
      return (
        <div className="flex items-center justify-center min-h-[400px] bg-surface-variant/20">
          <img 
            src={url} 
            alt={filename || "Attachment"} 
            className="max-h-[70vh] max-w-full object-contain rounded-lg"
            onLoad={() => setLoading(false)}
            onError={() => setLoading(false)}
          />
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="w-20 h-20 rounded-2xl bg-surface-variant flex items-center justify-center">
          <FileText className="w-10 h-10 text-on-surface-variant" />
        </div>
        <p className="text-on-surface-variant font-medium">{filename || "Documento"}</p>
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-primary hover:underline"
        >
          <ExternalLink className="w-4 h-4" />
          Abrir em nova aba
        </a>
      </div>
    );
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-variant/50 hover:bg-surface-variant transition-colors text-sm font-medium",
          className
        )}
      >
        {fileType === "image" ? (
          <Image className="w-4 h-4" />
        ) : (
          <File className="w-4 h-4" />
        )}
        <span className="truncate max-w-[100px]">{filename || "Anexo"}</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-outline/10">
            <h3 className="font-bold text-lg">{filename || "Preview"}</h3>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-on-surface-variant" />
            </div>
          )}
          {previewContent()}
        </DialogContent>
      </Dialog>
    </>
  );
}