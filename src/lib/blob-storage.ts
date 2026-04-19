import { put, head } from "@vercel/blob";

export async function uploadFileToBlobStorage(
  fileName: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  try {
    // Create unique file name with timestamp to avoid conflicts
    const timestamp = Date.now();
    const sanitizedName = fileName
      .replace(/[^a-z0-9.]/gi, "_")
      .toLowerCase();
    const uniqueFileName = `documents/${timestamp}-${sanitizedName}`;

    // Upload to Vercel Blob
    const blob = await put(uniqueFileName, buffer, {
      contentType,
      access: "public",
    });

    return blob.url;
  } catch (error) {
    console.error("Blob upload error:", error);
    throw new Error(`Falha ao salvar arquivo: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
  }
}

export async function deleteFileFromBlobStorage(url: string): Promise<void> {
  try {
    // Extract the pathname from the URL for deletion
    const urlObj = new URL(url);
    const pathname = urlObj.pathname.replace(/^\//, "");

    // Vercel Blob API expects just the file path
    const response = await fetch(url, { method: "DELETE" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    console.warn("Blob deletion error (non-critical):", error);
    // Don't throw on deletion errors as they're non-critical
  }
}

export async function checkBlobFileExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch {
    return false;
  }
}
