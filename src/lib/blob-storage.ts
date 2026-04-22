import { put, head, del } from "@vercel/blob";

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

    // Upload to Vercel Blob (using any to allow private store defaults)
    const options: any = { contentType };
    const blob = await put(uniqueFileName, buffer, options);

    return blob.url;
  } catch (error) {
    console.error("Blob upload error:", error);
    throw new Error(`Falha ao salvar arquivo: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
  }
}

export async function deleteFileFromBlobStorage(url: string): Promise<void> {
  try {
    if (!url) return;
    await del(url);
  } catch (error) {
    console.warn("Blob deletion error (non-critical):", error);
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
